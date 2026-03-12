export type Card = "Emperor" | "Citizen" | "Slave";
export type Side = "emperor" | "slave";
export type RoundWinner = "emperor" | "slave" | "draw";
export type Phase =
  | "menu"
  | "lobby"
  | "waiting"
  | "playing"
  | "roundResult"
  | "swapping"
  | "gameOver";

export interface Hands {
  emperor: Card[];
  slave: Card[];
}

export interface Scores {
  emperor: number;
  slave: number;
}

export interface RoomState {
  roomId: string;
  hostId: string;
  guestId: string | null;
  hostSide: Side;
  hands: Hands;
  scores: Scores;
  round: number;
  phase: Phase;
  hostCard: Card | null;
  guestCard: Card | null;
  roundWinner: RoundWinner | null;
  log: string[];
}

// Broadcast event payloads
export type BroadcastEvent =
  | { type: "guest_joined"; guestId: string }
  | { type: "card_played"; playerId: string; card: Card }
  | { type: "next_round" }
  | { type: "room_state"; state: RoomState };
