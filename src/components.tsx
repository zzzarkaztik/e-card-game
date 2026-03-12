import { useState } from "react";
import type { CSSProperties } from "react";
import { SUIT_COLORS, SUIT_SYMBOLS } from "./gameLogic";
import type { Card } from "./types";

export function CardBack({ width = 52, height = 78 }: { width?: number; height?: number }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 6,
        background: "repeating-linear-gradient(135deg,#1e1e30 0px,#1e1e30 4px,#181828 4px,#181828 8px)",
        border: "2px solid #2a2a44",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
      <span style={{ fontSize: 18, color: "#2a2a44" }}>✦</span>
    </div>
  );
}

export function CardFace({ card, width = 52, height = 78, glow = false }: { card: Card; width?: number; height?: number; glow?: boolean }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 8,
        border: `2px solid ${SUIT_COLORS[card]}`,
        background: `rgba(${card === "Emperor" ? "212,175,55" : card === "Citizen" ? "126,200,227" : "192,57,43"},0.13)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        boxShadow: glow ? `0 0 28px ${SUIT_COLORS[card]}66` : undefined,
        flexShrink: 0,
      }}>
      <span style={{ fontSize: width > 60 ? 28 : 18, color: SUIT_COLORS[card] }}>{SUIT_SYMBOLS[card]}</span>
      <span
        style={{
          fontSize: width > 60 ? 11 : 9,
          color: SUIT_COLORS[card],
          letterSpacing: 1,
          textTransform: "uppercase",
        }}>
        {card}
      </span>
    </div>
  );
}

export function HandCard({ card, onClick, disabled, played }: { card: Card; onClick: () => void; disabled: boolean; played: boolean }) {
  const [hovered, setHovered] = useState(false);
  const active = hovered && !disabled && !played;

  const style: CSSProperties = {
    width: 72,
    height: 108,
    borderRadius: 8,
    border: `2px solid ${active ? SUIT_COLORS[card] : played ? "#333" : "#444"}`,
    background: played
      ? "#111"
      : active
        ? `rgba(${card === "Emperor" ? "212,175,55" : card === "Citizen" ? "126,200,227" : "192,57,43"},0.15)`
        : "#1a1a2e",
    cursor: disabled || played ? "not-allowed" : "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.18s",
    transform: active ? "translateY(-12px) scale(1.08)" : "none",
    boxShadow: active ? `0 0 22px ${SUIT_COLORS[card]}66` : "0 2px 8px #0008",
    opacity: played ? 0.2 : disabled ? 0.5 : 1,
    gap: 6,
    flexShrink: 0,
  };

  return (
    <div
      style={style}
      onClick={!disabled && !played ? onClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      <span style={{ fontSize: 22, color: played ? "#333" : SUIT_COLORS[card] }}>{SUIT_SYMBOLS[card]}</span>
      <span
        style={{
          fontSize: 9,
          color: played ? "#333" : SUIT_COLORS[card],
          letterSpacing: 1,
          textTransform: "uppercase",
        }}>
        {card}
      </span>
    </div>
  );
}

export function Btn({
  children,
  onClick,
  variant = "primary",
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
}) {
  const styles: Record<string, CSSProperties> = {
    primary: {
      background: "linear-gradient(135deg,#8b0000,#c0392b)",
      color: "#fff",
      border: "none",
      boxShadow: "0 4px 20px #c0392b44",
    },
    secondary: {
      background: "#1e1e30",
      color: "#aaa",
      border: "1px solid #333",
    },
    ghost: {
      background: "transparent",
      color: "#555",
      border: "1px solid #2a2a3e",
    },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles[variant],
        borderRadius: 8,
        padding: "12px 32px",
        fontSize: 14,
        letterSpacing: 2,
        cursor: disabled ? "not-allowed" : "pointer",
        textTransform: "uppercase",
        fontFamily: "inherit",
        opacity: disabled ? 0.5 : 1,
        transition: "opacity 0.2s",
      }}>
      {children}
    </button>
  );
}
