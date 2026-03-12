import type { CSSProperties } from "react";
import { useGame } from "./useGame";
import { CardBack, CardFace, HandCard, Btn } from "./components";
import { SUIT_COLORS, SUIT_SYMBOLS, TOTAL_ROUNDS } from "./gameLogic";
import type { Card, Side } from "./types";

// ─── Layout helpers ───────────────────────────────────────────────────────────

const col: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const row: CSSProperties = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
};

function Label({ children, color = "#555" }: { children: React.ReactNode; color?: string }) {
  return <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color }}>{children}</div>;
}

function Panel({ children, style }: { children: React.ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        background: "#12121e",
        border: "1px solid #2a2a3e",
        borderRadius: 12,
        padding: "24px 28px",
        ...style,
      }}>
      {children}
    </div>
  );
}

// ─── Screens ──────────────────────────────────────────────────────────────────

function MenuScreen({
  onCreate,
  onJoin,
  roomIdInput,
  setRoomIdInput,
  error,
}: {
  onCreate: () => void;
  onJoin: (id: string) => void;
  roomIdInput: string;
  setRoomIdInput: (v: string) => void;
  error: string | null;
}) {
  return (
    <div style={{ ...col, gap: 20, width: "100%" }}>
      <Panel>
        <p style={{ color: "#aaa", lineHeight: 1.7, fontSize: 15, margin: "0 0 16px" }}>
          A psychological card game from the depths of despair.
          <br />
          <span style={{ color: SUIT_COLORS.Emperor }}>Emperor</span> crushes <span style={{ color: SUIT_COLORS.Citizen }}>Citizen</span>.{" "}
          <span style={{ color: SUIT_COLORS.Citizen }}>Citizen</span> defeats <span style={{ color: SUIT_COLORS.Slave }}>Slave</span>.{" "}
          <span style={{ color: SUIT_COLORS.Slave }}>Slave</span> kills <span style={{ color: SUIT_COLORS.Emperor }}>Emperor</span>.
        </p>
        <div style={{ ...row, justifyContent: "center", gap: 24, marginBottom: 16 }}>
          {(["Emperor", "Citizen", "Slave"] as Card[]).map((c) => (
            <div key={c} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 26, color: SUIT_COLORS[c] }}>{SUIT_SYMBOLS[c]}</div>
              <Label>{c}</Label>
            </div>
          ))}
        </div>
        <p style={{ color: "#444", fontSize: 13, margin: 0, textAlign: "center" }}>
          {TOTAL_ROUNDS} rounds · sides swap every 3 rounds · 5 cards each
        </p>
      </Panel>

      <div style={{ ...col, gap: 12, width: "100%" }}>
        <Btn onClick={onCreate} variant="primary">
          Create Room
        </Btn>

        <div style={{ ...row, gap: 8, width: "100%", maxWidth: 340 }}>
          <input
            value={roomIdInput}
            onChange={(e) => setRoomIdInput(e.target.value.toUpperCase())}
            placeholder="ROOM CODE"
            maxLength={6}
            style={{
              flex: 1,
              background: "#0d0d1a",
              border: "1px solid #2a2a3e",
              borderRadius: 8,
              padding: "12px 16px",
              color: "#e8e8e0",
              fontFamily: "inherit",
              fontSize: 15,
              letterSpacing: 3,
              textTransform: "uppercase",
              outline: "none",
            }}
          />
          <Btn onClick={() => onJoin(roomIdInput)} variant="secondary">
            Join
          </Btn>
        </div>

        {error && <div style={{ color: "#c0392b", fontSize: 13, letterSpacing: 1 }}>{error}</div>}
      </div>
    </div>
  );
}

function WaitingScreen({ roomId }: { roomId: string }) {
  return (
    <Panel style={{ textAlign: "center", width: "100%" }}>
      <Label color="#888">Room Code</Label>
      <div
        style={{
          fontSize: 48,
          fontWeight: 700,
          letterSpacing: 8,
          color: "#d4af37",
          margin: "12px 0 8px",
        }}>
        {roomId}
      </div>
      <p style={{ color: "#555", fontSize: 14 }}>
        Share this code with your opponent.
        <br />
        Waiting for them to join…
      </p>
      <div style={{ ...row, justifyContent: "center", gap: 8, marginTop: 12 }}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#d4af37",
            animation: "pulse 1s infinite",
          }}
        />
        <Label color="#555">Waiting</Label>
      </div>
    </Panel>
  );
}

function LobbyScreen() {
  return (
    <Panel style={{ textAlign: "center", width: "100%" }}>
      <div style={{ fontSize: 24, color: "#d4af37", marginBottom: 8 }}>⟳</div>
      <Label color="#666">Connecting to room…</Label>
    </Panel>
  );
}

function ScoreBar({
  scores,
  round,
  hostSide,
  isHost,
}: {
  scores: { emperor: number; slave: number };
  round: number;
  hostSide: Side;
  isHost: boolean;
}) {
  const mySide = isHost ? hostSide : hostSide === "emperor" ? "slave" : "emperor";
  const myScore = scores[mySide];
  const oppScore = scores[mySide === "emperor" ? "slave" : "emperor"];

  return (
    <div
      style={{
        ...row,
        justifyContent: "space-between",
        background: "#12121e",
        borderRadius: 10,
        padding: "12px 20px",
        border: "1px solid #2a2a3e",
        marginBottom: 16,
      }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#7ec8e3" }}>{myScore}</div>
        <Label>You</Label>
        <Label color={mySide === "emperor" ? "#d4af37" : "#c0392b"}>{mySide}</Label>
      </div>
      <div style={{ textAlign: "center" }}>
        <Label>Round</Label>
        <div style={{ fontSize: 22, color: "#666" }}>
          {round} / {TOTAL_ROUNDS}
        </div>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#c0392b" }}>{oppScore}</div>
        <Label>Opponent</Label>
        <Label color={mySide === "emperor" ? "#c0392b" : "#d4af37"}>{mySide === "emperor" ? "slave" : "emperor"}</Label>
      </div>
    </div>
  );
}

function BattleZone({
  phase,
  myPlayedCard,
  oppPlayedCard,
  roundWinner,
  isHost,
  hostSide,
  onNext,
  round,
}: {
  phase: string;
  myPlayedCard: Card | null;
  oppPlayedCard: Card | null;
  roundWinner: string | null;
  isHost: boolean;
  hostSide: Side;
  onNext: () => void;
  round: number;
}) {
  const mySide = isHost ? hostSide : hostSide === "emperor" ? "slave" : "emperor";

  let resultLabel = "";
  if (phase === "roundResult" && roundWinner) {
    if (roundWinner === "draw") resultLabel = "— DRAW —";
    else if (roundWinner === mySide) resultLabel = "⚔ VICTORY";
    else resultLabel = "✗ DEFEAT";
  }

  const resultColor = roundWinner === "draw" ? "#666" : roundWinner === mySide ? "#4caf50" : "#c0392b";

  return (
    <div
      style={{
        background: "#0d0d1a",
        border: "1px solid #1e1e30",
        borderRadius: 12,
        padding: 24,
        minHeight: 160,
        ...col,
        justifyContent: "center",
        gap: 14,
        marginBottom: 16,
      }}>
      {phase === "swapping" && <div style={{ color: "#d4af37", fontSize: 18, letterSpacing: 4 }}>⟳ SIDES SWAP ⟳</div>}

      {phase === "playing" && (
        <>
          {myPlayedCard ? (
            <div style={{ ...col, gap: 6 }}>
              <Label color="#444">Your card — locked in</Label>
              <CardFace card={myPlayedCard} width={64} height={96} glow />
            </div>
          ) : (
            <Label color="#2a2a40">Choose a card from your hand</Label>
          )}
          {myPlayedCard && !oppPlayedCard && <Label color="#444">Waiting for opponent…</Label>}
        </>
      )}

      {phase === "roundResult" && myPlayedCard && oppPlayedCard && (
        <div style={{ ...col, gap: 14, width: "100%" }}>
          <div style={{ ...row, gap: 40, justifyContent: "center" }}>
            <div style={{ ...col, gap: 6 }}>
              <Label color="#444">You</Label>
              <CardFace card={myPlayedCard} width={80} height={120} glow />
            </div>
            <div style={{ fontSize: 20, color: "#333" }}>VS</div>
            <div style={{ ...col, gap: 6 }}>
              <Label color="#444">Opponent</Label>
              <CardFace card={oppPlayedCard} width={80} height={120} glow />
            </div>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 3, color: resultColor }}>{resultLabel}</div>
          {isHost && (
            <Btn onClick={onNext} variant="secondary">
              {round >= TOTAL_ROUNDS ? "Final Results" : "Next Round →"}
            </Btn>
          )}
          {!isHost && <Label color="#444">Waiting for host to continue…</Label>}
        </div>
      )}
    </div>
  );
}

function GameLog({ log }: { log: string[] }) {
  if (!log.length) return null;
  return (
    <div
      style={{
        background: "#0a0a12",
        border: "1px solid #1a1a28",
        borderRadius: 8,
        padding: 12,
        maxHeight: 100,
        overflowY: "auto",
        marginTop: 12,
      }}>
      {log.slice(0, 6).map((entry, i) => (
        <div
          key={i}
          style={{
            fontSize: 12,
            color: i === 0 ? "#555" : "#2a2a3e",
            padding: "2px 0",
            borderBottom: i < 5 ? "1px solid #111" : "none",
          }}>
          {entry}
        </div>
      ))}
    </div>
  );
}

function GameOverScreen({
  scores,
  hostSide,
  isHost,
  log,
  onRestart,
  onMenu,
}: {
  scores: { emperor: number; slave: number };
  hostSide: Side;
  isHost: boolean;
  log: string[];
  onRestart: () => void;
  onMenu: () => void;
}) {
  const mySide = isHost ? hostSide : hostSide === "emperor" ? "slave" : "emperor";
  const myScore = scores[mySide];
  const oppScore = scores[mySide === "emperor" ? "slave" : "emperor"];
  const outcome = myScore > oppScore ? "VICTORY" : myScore < oppScore ? "DEFEAT" : "DRAW";
  const outcomeColor = outcome === "VICTORY" ? "#d4af37" : outcome === "DEFEAT" ? "#c0392b" : "#888";

  return (
    <div style={{ ...col, gap: 20, width: "100%" }}>
      <Panel style={{ textAlign: "center", width: "100%", border: `1px solid ${outcomeColor}` }}>
        <Label color="#555">Final Result</Label>
        <div style={{ fontSize: 46, fontWeight: 700, color: outcomeColor, margin: "12px 0 8px" }}>{outcome}</div>
        <div style={{ fontSize: 32, color: "#aaa", marginBottom: 20 }}>
          <span style={{ color: "#7ec8e3" }}>{myScore}</span>
          <span style={{ color: "#333", margin: "0 16px" }}>—</span>
          <span style={{ color: "#c0392b" }}>{oppScore}</span>
        </div>
        <GameLog log={log} />
      </Panel>
      <div style={{ ...row, gap: 12, justifyContent: "center" }}>
        {isHost && (
          <Btn onClick={onRestart} variant="primary">
            Play Again
          </Btn>
        )}
        <Btn onClick={onMenu} variant="ghost">
          Menu
        </Btn>
      </div>
      {!isHost && <Label color="#444">Waiting for host to restart…</Label>}
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  const {
    phase,
    roomState,
    error,
    roomIdInput,
    setRoomIdInput,
    createRoom,
    joinRoom,
    playCard,
    nextRound,
    restartGame,
    goToMenu,
    mySide,
    myCard,
    isHost,
  } = useGame();

  // Derive opponent's card for display
  const oppCard = roomState && phase === "roundResult" ? (isHost ? roomState.guestCard : roomState.hostCard) : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a12",
        color: "#e8e8e0",
        fontFamily: "'Crimson Text', Georgia, serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        position: "relative",
        overflow: "hidden",
      }}>
      {/* Backgrounds */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 0%, #1a0a2e 0%, #0a0a12 70%)",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg,transparent,transparent 40px,rgba(255,255,255,.01) 40px,rgba(255,255,255,.01) 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,rgba(255,255,255,.01) 40px,rgba(255,255,255,.01) 41px)",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 680 }}>
        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 11, letterSpacing: 6, color: "#888", textTransform: "uppercase", marginBottom: 4 }}>
            Gambling Apocalypse
          </div>
          <h1
            style={{
              fontSize: 42,
              fontWeight: 700,
              margin: 0,
              letterSpacing: 2,
              background: "linear-gradient(135deg,#d4af37,#f5e6a3,#d4af37)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
            E-CARD
          </h1>
          <div style={{ fontSize: 11, letterSpacing: 4, color: "#666", textTransform: "uppercase" }}>Emperor · Citizen · Slave</div>
        </div>

        {/* Screens */}
        {phase === "menu" && (
          <MenuScreen onCreate={createRoom} onJoin={joinRoom} roomIdInput={roomIdInput} setRoomIdInput={setRoomIdInput} error={error} />
        )}

        {phase === "waiting" && roomState && <WaitingScreen roomId={roomState.roomId} />}

        {phase === "lobby" && <LobbyScreen />}

        {(phase === "playing" || phase === "roundResult" || phase === "swapping") && roomState && mySide && (
          <div>
            <ScoreBar scores={roomState.scores} round={roomState.round} hostSide={roomState.hostSide} isHost={isHost} />

            {/* Opponent hand (face down) */}
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <Label color="#333">
                Opponent ({mySide === "emperor" ? "slave" : "emperor"}) ·{" "}
                {roomState.hands[mySide === "emperor" ? "slave" : "emperor"].length} cards
              </Label>
              <div style={{ ...row, justifyContent: "center", gap: 8, marginTop: 8 }}>
                {roomState.hands[mySide === "emperor" ? "slave" : "emperor"].map((_, i) => (
                  <CardBack key={i} />
                ))}
                {Array(5 - roomState.hands[mySide === "emperor" ? "slave" : "emperor"].length)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={`gap-${i}`}
                      style={{
                        width: 52,
                        height: 78,
                        borderRadius: 6,
                        border: "1px dashed #1a1a28",
                        opacity: 0.2,
                        flexShrink: 0,
                      }}
                    />
                  ))}
              </div>
            </div>

            <BattleZone
              phase={phase}
              myPlayedCard={myCard}
              oppPlayedCard={oppCard ?? null}
              roundWinner={roomState.roundWinner}
              isHost={isHost}
              hostSide={roomState.hostSide}
              onNext={nextRound}
              round={roomState.round}
            />

            {/* Player hand */}
            {phase === "playing" && (
              <div style={{ textAlign: "center" }}>
                <Label color="#444">
                  Your hand ({mySide}) · {roomState.hands[mySide].length} cards
                </Label>
                <div style={{ ...row, justifyContent: "center", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                  {roomState.hands[mySide].map((card, i) => (
                    <HandCard key={`${card}-${i}`} card={card} onClick={() => playCard(card)} disabled={!!myCard} played={false} />
                  ))}
                </div>
              </div>
            )}

            <GameLog log={roomState.log} />
          </div>
        )}

        {phase === "gameOver" && roomState && mySide && (
          <GameOverScreen
            scores={roomState.scores}
            hostSide={roomState.hostSide}
            isHost={isHost}
            log={roomState.log}
            onRestart={restartGame}
            onMenu={goToMenu}
          />
        )}
      </div>

      <style>{`
        * { box-sizing: border-box; }
        input::placeholder { color: #333; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0a12; }
        ::-webkit-scrollbar-thumb { background: #2a2a3e; border-radius: 2px; }
      `}</style>
    </div>
  );
}
