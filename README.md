# E-Card — Multiplayer (Supabase + Vite + React + TSX)

A real-time 1v1 multiplayer implementation of E-Card from the anime _Kaiji_, using Supabase Realtime Broadcast for WebSocket communication and Vite + React + TypeScript for the frontend.

---

## Project Structure

```
src/
  types.ts          — all shared TypeScript types
  gameLogic.ts      — pure game logic (resolveRound, card helpers, constants)
  supabaseClient.ts — Supabase singleton client
  useGame.ts        — all multiplayer state + Supabase channel logic
  components.tsx    — reusable UI card/button components
  App.tsx           — screens and layout
```

---

## Local Setup

### 1. Scaffold a Vite project (if starting fresh)

```bash
npm create vite@latest ecard-game -- --template react-ts
cd ecard-game
```

### 2. Install dependencies

```bash
npm install
npm install @supabase/supabase-js
```

### 3. Copy source files

Replace the contents of `src/` with all the `.ts` / `.tsx` files from this project.

### 4. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **New Project**, give it a name, set a password, pick a region
3. Wait ~2 minutes for provisioning
4. Go to **Project Settings → API**
5. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

> No database tables or SQL needed. E-Card uses only Supabase **Realtime Broadcast** (ephemeral messages), so there's nothing to configure in the database.

### 5. Create your .env file

```bash
cp .env.example .env
```

Fill in the two values:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 6. Run locally

```bash
npm run dev
```

Open two browser tabs at `http://localhost:5173`.

- Tab 1: click **Create Room**, copy the 6-letter room code
- Tab 2: paste the code and click **Join**

---

## Deploy to Vercel

```bash
npm run build       # produces dist/
```

Then:

1. Push your project to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo
3. Under **Environment Variables**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
4. Click **Deploy**

---

## How the Multiplayer Works

- No backend server. All real-time communication goes through **Supabase Realtime Broadcast**.
- When Player 1 creates a room, a Supabase channel is opened at `ecard:{roomId}`.
- Player 2 joins by entering the room code — they subscribe to the same channel and broadcast `guest_joined`.
- The **host drives game state**. After each card play or round resolution, the host broadcasts the full `RoomState` to the guest.
- Card plays are broadcast immediately so both sides can resolve the round locally without waiting for a round-trip.
- Sides swap every 3 rounds. Hands reset on swap.

---

## Game Rules

Each player has 5 cards:

- **Emperor side**: 1 Emperor + 4 Citizens
- **Slave side**: 1 Slave + 4 Citizens

Resolution:
| Emperor plays | Slave plays | Winner |
|---|---|---|
| Emperor | Citizen | Emperor side |
| Citizen | Slave | Emperor side |
| Emperor | Slave | **Slave side** |
| Citizen | Citizen | Draw |

The Slave card is the only card that can kill the Emperor — the key psychological tension of the game.

12 rounds total. Most round wins takes the match.
