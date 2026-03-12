import type { Card, Hands, RoundWinner, Side } from "./types";

export const EMPEROR: Card = "Emperor";
export const CITIZEN: Card = "Citizen";
export const SLAVE: Card = "Slave";

export const TOTAL_ROUNDS = 12;
export const SWAP_EVERY = 3;

export const SUIT_SYMBOLS: Record<Card, string> = {
  Emperor: "♛",
  Citizen: "◆",
  Slave: "⛓",
};

export const SUIT_COLORS: Record<Card, string> = {
  Emperor: "#d4af37",
  Citizen: "#7ec8e3",
  Slave: "#c0392b",
};

export const INITIAL_HAND: Hands = {
  emperor: [EMPEROR, CITIZEN, CITIZEN, CITIZEN, CITIZEN],
  slave: [SLAVE, CITIZEN, CITIZEN, CITIZEN, CITIZEN],
};

export function cloneHand(hand: Hands): Hands {
  return { emperor: [...hand.emperor], slave: [...hand.slave] };
}

export function resolveRound(
  emperorCard: Card,
  slaveCard: Card
): RoundWinner {
  if (emperorCard === EMPEROR && slaveCard === SLAVE) return "slave"; // slave kills emperor
  if (emperorCard === EMPEROR && slaveCard === CITIZEN) return "emperor";
  if (emperorCard === CITIZEN && slaveCard === SLAVE) return "emperor";
  if (emperorCard === slaveCard) return "draw";
  return "draw";
}

export function removeCard(hand: Card[], card: Card): Card[] {
  const idx = hand.indexOf(card);
  if (idx === -1) return hand;
  return [...hand.slice(0, idx), ...hand.slice(idx + 1)];
}

export function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function generatePlayerId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function oppositeSide(side: Side): Side {
  return side === "emperor" ? "slave" : "emperor";
}
