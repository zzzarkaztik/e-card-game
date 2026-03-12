import { useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";
import {
  INITIAL_HAND,
  SWAP_EVERY,
  TOTAL_ROUNDS,
  cloneHand,
  generatePlayerId,
  generateRoomId,
  oppositeSide,
  removeCard,
  resolveRound,
} from "./gameLogic";
import type { BroadcastEvent, Card, Phase, RoomState, Side } from "./types";

// ─── helpers ────────────────────────────────────────────────────────────────

function freshRoom(roomId: string, hostId: string): RoomState {
  return {
    roomId,
    hostId,
    guestId: null,
    hostSide: "emperor",
    hands: cloneHand(INITIAL_HAND),
    scores: { emperor: 0, slave: 0 },
    round: 1,
    phase: "waiting",
    hostCard: null,
    guestCard: null,
    roundWinner: null,
    log: [],
  };
}

// ─── hook ────────────────────────────────────────────────────────────────────

export function useGame() {
  const [playerId] = useState<string>(() => generatePlayerId());
  const [phase, setPhase] = useState<Phase>("menu");
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [roomIdInput, setRoomIdInput] = useState("");

  const channelRef = useRef<RealtimeChannel | null>(null);
  const roomStateRef = useRef<RoomState | null>(null);

  // Keep ref in sync with state for use inside callbacks
  useEffect(() => {
    roomStateRef.current = roomState;
  }, [roomState]);

  // ── broadcast helpers ──────────────────────────────────────────────────────

  const broadcast = (event: BroadcastEvent) => {
    channelRef.current?.send({
      type: "broadcast",
      event: event.type,
      payload: event,
    });
  };

  function subscribeToRoom(roomId: string, initialState?: RoomState) {
    // Clean up any existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase.channel(`ecard:${roomId}`, {
      config: { broadcast: { self: false } },
    });

    channel
      .on("broadcast", { event: "room_state" }, ({ payload }) => {
        const event = payload as Extract<BroadcastEvent, { type: "room_state" }>;
        setRoomState(event.state);
        setPhase(event.state.phase);
      })
      .on("broadcast", { event: "guest_joined" }, ({ payload }) => {
        const event = payload as Extract<BroadcastEvent, { type: "guest_joined" }>;
        const current = roomStateRef.current;
        if (!current) return;
        // Only host updates state when guest joins
        if (current.hostId !== playerId) return;

        const updated: RoomState = {
          ...current,
          guestId: event.guestId,
          phase: "playing",
        };
        setRoomState(updated);
        setPhase("playing");
        broadcast({ type: "room_state", state: updated });
      })
      .on("broadcast", { event: "card_played" }, ({ payload }) => {
        const event = payload as Extract<BroadcastEvent, { type: "card_played" }>;
        handleOpponentCard(event.card);
      })
      .on("broadcast", { event: "next_round" }, () => {
        // Guest receives "next_round" from host after host pressed button
        const current = roomStateRef.current;
        if (!current) return;
        advanceRound(current, false);
      })
      .subscribe();

    channelRef.current = channel;

    if (initialState) {
      setRoomState(initialState);
    }
  }

  // ── create / join ──────────────────────────────────────────────────────────

  function createRoom() {
    const roomId = generateRoomId();
    const state = freshRoom(roomId, playerId);
    subscribeToRoom(roomId, state);
    setPhase("waiting");
    setError(null);
  }

  async function joinRoom(roomId: string) {
    const trimmed = roomId.trim().toUpperCase();
    if (!trimmed) {
      setError("Enter a room code.");
      return;
    }
    subscribeToRoom(trimmed);
    setPhase("lobby");

    // Broadcast that we joined — host will respond with full state
    setTimeout(() => {
      broadcast({ type: "guest_joined", guestId: playerId });
    }, 600); // small delay to ensure subscription is active

    setError(null);
  }

  // ── derived role helpers ───────────────────────────────────────────────────

  function myRole(state: RoomState): "host" | "guest" {
    return state.hostId === playerId ? "host" : "guest";
  }

  function mySide(state: RoomState): Side {
    return myRole(state) === "host" ? state.hostSide : oppositeSide(state.hostSide);
  }

  function myCard(state: RoomState): Card | null {
    return myRole(state) === "host" ? state.hostCard : state.guestCard;
  }

  // ── play a card ────────────────────────────────────────────────────────────

  function playCard(card: Card) {
    const state = roomStateRef.current;
    if (!state || state.phase !== "playing") return;
    if (myCard(state)) return; // already played

    const role = myRole(state);
    const side = mySide(state);

    // Remove from local hand
    const newHands = cloneHand(state.hands);
    newHands[side] = removeCard(newHands[side], card);

    const updated: RoomState = {
      ...state,
      hands: newHands,
      hostCard: role === "host" ? card : state.hostCard,
      guestCard: role === "guest" ? card : state.guestCard,
    };

    setRoomState(updated);
    broadcast({ type: "card_played", playerId, card });

    // If both cards are now set, resolve
    const hostCard = role === "host" ? card : state.hostCard;
    const guestCard = role === "guest" ? card : state.guestCard;

    if (hostCard && guestCard) {
      resolveCards(updated, hostCard, guestCard);
    }
  }

  function handleOpponentCard(card: Card) {
    const state = roomStateRef.current;
    if (!state) return;

    const role = myRole(state);
    const opponentSide = oppositeSide(mySide(state));

    const newHands = cloneHand(state.hands);
    newHands[opponentSide] = removeCard(newHands[opponentSide], card);

    const hostCard = role === "host" ? state.hostCard : card;
    const guestCard = role === "guest" ? state.guestCard : card;

    const updated: RoomState = {
      ...state,
      hands: newHands,
      hostCard,
      guestCard,
    };

    setRoomState(updated);

    if (hostCard && guestCard) {
      resolveCards(updated, hostCard, guestCard);
    }
  }

  // ── resolve round ──────────────────────────────────────────────────────────

  function resolveCards(state: RoomState, hostCard: Card, guestCard: Card) {
    const emperorCard = state.hostSide === "emperor" ? hostCard : guestCard;
    const slaveCard = state.hostSide === "slave" ? hostCard : guestCard;

    const winner = resolveRound(emperorCard, slaveCard);

    const newScores = { ...state.scores };
    if (winner !== "draw") newScores[winner]++;

    const hostSideName = state.hostSide;

    let logEntry = `Round ${state.round}: `;
    if (winner === "draw") logEntry += `DRAW — ${hostCard} vs ${guestCard}`;
    else if (winner === hostSideName) logEntry += `HOST WINS — ${hostCard} beats ${guestCard}`;
    else logEntry += `GUEST WINS — ${guestCard} beats ${hostCard}`;

    const resolved: RoomState = {
      ...state,
      hostCard,
      guestCard,
      scores: newScores,
      roundWinner: winner,
      phase: "roundResult",
      log: [logEntry, ...state.log].slice(0, 20),
    };

    setRoomState(resolved);
    setPhase("roundResult");

    // Only host syncs resolved state to avoid double-sync
    if (myRole(state) === "host") {
      broadcast({ type: "room_state", state: resolved });
    }
  }

  // ── advance to next round ──────────────────────────────────────────────────

  function nextRound() {
    const state = roomStateRef.current;
    if (!state) return;
    // Only host drives round advancement
    if (myRole(state) !== "host") return;

    broadcast({ type: "next_round" });
    advanceRound(state, true);
  }

  function advanceRound(state: RoomState, isHost: boolean) {
    const nextR = state.round + 1;

    if (nextR > TOTAL_ROUNDS) {
      const finished: RoomState = { ...state, phase: "gameOver" };
      setRoomState(finished);
      setPhase("gameOver");
      if (isHost) broadcast({ type: "room_state", state: finished });
      return;
    }

    const shouldSwap = state.round % SWAP_EVERY === 0;

    if (shouldSwap) {
      const swapping: RoomState = { ...state, phase: "swapping" };
      setRoomState(swapping);
      setPhase("swapping");
      if (isHost) broadcast({ type: "room_state", state: swapping });

      setTimeout(() => {
        const next: RoomState = {
          ...state,
          round: nextR,
          hostSide: oppositeSide(state.hostSide),
          hands: cloneHand(INITIAL_HAND),
          hostCard: null,
          guestCard: null,
          roundWinner: null,
          phase: "playing",
        };
        setRoomState(next);
        setPhase("playing");
        if (isHost) broadcast({ type: "room_state", state: next });
      }, 1500);
    } else {
      const next: RoomState = {
        ...state,
        round: nextR,
        hostCard: null,
        guestCard: null,
        roundWinner: null,
        phase: "playing",
      };
      setRoomState(next);
      setPhase("playing");
      if (isHost) broadcast({ type: "room_state", state: next });
    }
  }

  // ── restart ────────────────────────────────────────────────────────────────

  function restartGame() {
    const state = roomStateRef.current;
    if (!state || myRole(state) !== "host") return;

    const restarted: RoomState = {
      ...freshRoom(state.roomId, state.hostId),
      guestId: state.guestId,
      phase: "playing",
    };
    setRoomState(restarted);
    setPhase("playing");
    broadcast({ type: "room_state", state: restarted });
  }

  function goToMenu() {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    setRoomState(null);
    setPhase("menu");
    setError(null);
  }

  // ── cleanup on unmount ─────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  return {
    playerId,
    phase,
    roomState,
    error,
    roomIdInput,
    setRoomIdInput,
    // actions
    createRoom,
    joinRoom,
    playCard,
    nextRound,
    restartGame,
    goToMenu,
    // computed
    mySide: roomState ? mySide(roomState) : null,
    myCard: roomState ? myCard(roomState) : null,
    isHost: roomState ? myRole(roomState) === "host" : false,
  };
}
