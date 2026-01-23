# Scio v0.1: Competitive Ranked Reasoning Battles

## Overview

Scio v0.1 is a multiplayer, competitive reasoning game where players engage in real-time 1v1 battles. Each match consists of 5 critical reasoning questions answered in 20-30 seconds each. Players earn ELO ratings, climb tier ranks (Bronze → Silver → Gold → Platinum → Diamond), and compete on a global leaderboard.

**Core Loop:** Home → Play Button → Matchmaking Queue → 5-Round Battle → Results → Play Again

---

## Features

### Matchmaking System
- **Skill-Based Matchmaking (SBMM):** Players are matched within a ±100 ELO rating band for fair competition
- **Human vs. AI Fallback:** If no human opponent is found within 8-12 seconds, the system automatically pairs the player with an adaptive AI bot
- **Instant Queue:** Join and search for opponents with a simple button click

### Game Mechanics
- **5-Round Matches:** Each match has exactly 5 reasoning questions
- **20-30 Second Timer:** Players have 20-30 seconds per question (randomized difficulty-based)
- **Instant Feedback:** After each round, both players see the correct answer and who won the round
- **Final Results:** Complete match results with ELO change, tier progression, and leaderboard position

### Rating & Progression System
- **ELO Ratings:** Starting rating: 1200 | K-factor: 32 (standard competitive gaming)
- **Tier System:**
  - Bronze: 0-1299
  - Silver: 1300-1599
  - Gold: 1600-1899
  - Platinum: 1900-2199
  - Diamond: 2200+
- **Live Leaderboard:** Global rankings updated in real-time after each match

### AI Bot Logic
The bot provides deterministic, skill-appropriate answers:
- **Easy Questions:** 70-85% correct rate
- **Medium Questions:** 55-70% correct rate
- **Hard Questions:** 40-55% correct rate

This ensures challenging but fair competition against the AI.

---

## Pages

### Home (`/`)
- Hero section with "⚔️ Start a Match" CTA
- "Ranked Battles" section explaining 1v1 competition
- Game mechanics overview (SBMM, ELO, leaderboard)
- Final CTA directing to `/play` or `/admin/metrics`

### Play / Matchmaking Queue (`/play`)
- Displays "Finding opponent..." with countdown timer
- Shows current ELO rating and tier
- "Cancel" button to exit queue
- Auto-redirects to match page when opponent found

### Match Gameplay (`/match/[matchId]`)
- 5-round sequential gameplay
- Question display with multiple-choice answers
- 20-30 second timer per round (countdown with red warning at <5s)
- Instant feedback: correct answer highlight, round winner, score tally
- After round 5: Results screen with:
  - Match score (X/5 questions won)
  - ELO change (±points)
  - New rating and tier
  - "Play Again" button (returns to `/play`)

### Admin Metrics Dashboard (`/admin/metrics`)
- Global game statistics:
  - Total matches played
  - Total users
  - Average match duration
  - Win rate distribution
  - Top 10 leaderboard
  - Tier breakdown (pie chart or bar)

---

## Database Schema

### Core Tables

**User**
- `id`: Unique identifier
- `email`: User email (from Google OAuth)
- `name`: User name
- `rating`: Current ELO rating (default: 1200)
- `tier`: Current tier (Bronze/Silver/Gold/Platinum/Diamond)
- `matchesPlayed`: Total matches
- `matchesWon`: Wins count
- `createdAt`, `updatedAt`

**Question**
- `id`: Unique identifier
- `text`: Question text
- `options`: JSON array of 4 options
- `correctIndex`: Index of correct answer (0-3)
- `difficulty`: 'easy' | 'medium' | 'hard'

**Match**
- `id`: Unique identifier
- `player1Id`, `player2Id`: User IDs (player2 is null if vs. bot)
- `winnerId`: ID of winning player (null if tie)
- `player1Score`, `player2Score`: Number of rounds won (0-5 each)
- `status`: 'in-progress' | 'completed'
- `createdAt`, `updatedAt`

**MatchRound**
- `id`: Unique identifier
- `matchId`: Reference to match
- `roundIndex`: 0-4 for round order
- `questionId`: Reference to question
- `player1AnswerIndex`, `player2AnswerIndex`: Selected answer indices
- `correctIndex`: Correct answer index
- `createdAt`

**Event** (Analytics)
- `id`: Unique identifier
- `userId`: User ID
- `eventType`: 'match_started' | 'round_completed' | 'match_finished'
- `matchId`: Reference to match (if applicable)
- `metadata`: JSON field for extra data (roundNumber, eloChange, etc.)
- `createdAt`

---

## API Routes

### Authentication
**`POST /api/auth/[...nextauth]`**
- Google OAuth provider
- Sessions stored in Prisma + NextAuth
- Returns: Session with user `id`, `email`, `rating`, `tier`

### Matchmaking
**`POST /api/matchmaking/join`**
- Request: None (auth required)
- Response: `{ matchId: string, status: 'waiting' | 'matched' }`
- Adds player to queue, searches for opponent within ±100 ELO band
- 8-12 second timeout → creates match vs. AI bot if no opponent found
- Emits `match_started` event

**`GET /api/matchmaking/status`**
- Request: None (auth required)
- Response: `{ status: 'waiting' | 'matched' | 'not_queued', matchId?: string }`

**`POST /api/matchmaking/cancel`**
- Request: None (auth required)
- Response: `{ success: true }`
- Removes player from queue

### Match Management
**`GET /api/match/[matchId]`**
- Request: Path: `matchId`
- Response: Full match object with rounds, questions, and answers
- Used to render current game state on client

**`POST /api/match/[matchId]/submit`**
- Request: `{ roundIndex: number, answerIndex: number }`
- Response: `{ roundResult: { winner: 'player1' | 'player2', correct: boolean }, nextRound?: object }`
- Validates answer, updates MatchRound, calculates round winner
- After round 5: Calculates ELO, updates ratings, emits `match_finished` event

### Admin
**`GET /api/admin/metrics`**
- Request: None (admin only)
- Response: Dashboard metrics (total matches, users, stats, leaderboard)
- Protected by `ADMIN_EMAIL` environment variable

---

## Environment Variables

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth / OAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Admin Dashboard
ADMIN_EMAIL="admin@example.com"

# Optional: OpenAI (unused in v0.1)
OPENAI_API_KEY="sk-..."
```

---

## Setup & Installation

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env.local` with the variables above (see `.env.example` if provided).

### 3. Setup Database & Seed Questions
```bash
npx prisma migrate dev
npx prisma db seed
```

This creates:
- SQLite database (`dev.db`)
- 60 seeded questions (20 easy, 25 medium, 15 hard)
- NextAuth tables

### 4. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to play!

---

## Tech Stack

- **Frontend:** React 19.2 + Next.js 16.1 (App Router, TypeScript)
- **Styling:** Tailwind CSS 4 + PostCSS
- **Database:** SQLite (Prisma 6.x)
- **Auth:** NextAuth 4.24.13 (Google OAuth)
- **Hosting:** Vercel-ready

---

## What's NOT in v0.1 (Removed)

The following Scio v1.0 features have been removed to keep v0.1 minimal and focused:

- ❌ Solo drills and practice problems
- ❌ Article reading & explanations
- ❌ Interview feedback system
- ❌ Progress tracking & dashboards
- ❌ Pricing & billing
- ❌ User accounts & settings
- ❌ Demo page with curated articles
- ❌ Lessons and learning paths

**v0.1 is strictly a competitive game loop. All educational features are out of scope.**

---

## Testing the Game Loop

1. **Sign in:** Click "⚔️ Start a Match" → Google OAuth
2. **Queue:** See matchmaking status with countdown
3. **Play Match:** Answer 5 questions in <5 min total
4. **See Results:** View score, ELO change, new rating
5. **Play Again:** Instant queue button to start next match
6. **Leaderboard:** Visit `/admin/metrics` to see global rankings

---

## Future Improvements (Post-v0.1)

- Real-time WebSocket multiplayer (no page refreshes)
- Seasonal rankings & rewards
- Match replay & analysis
- Custom question sets
- Tournament brackets
- Social features (friends, teams)

---

## Support

For issues or questions about v0.1, contact the development team.

**Last Updated:** 2025
**Status:** Production-ready (v0.1)
