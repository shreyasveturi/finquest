# Scio v0.1 — Username-Only Mode

Scio v0.1 ships **without accounts or authentication**. Players enter a temporary username and play instantly.

## Identity
- Stored locally in the browser:
  - `scio_client_id` — UUID generated on first use
  - `scio_username` — user-chosen, 3–16 chars (letters/numbers/underscore)
- No backend sessions. `clientId` is the primary identifier for matchmaking, ratings, and event tracking.

## Flow
1. Visiting `/play` (or pressing **Start a Match**) prompts for a username if missing.
2. Username + clientId are saved to `localStorage`.
3. All gameplay/API requests include `{ clientId, username }`.
4. Leaderboard and metrics use `clientId` as identity; duplicate usernames are allowed (shown with suffix `name#AB12`, last 4 of clientId when needed).

## APIs (v0.1)
- `POST /api/matchmaking/join` — body `{ clientId, username }`, queues or matches immediately.
- `GET /api/matchmaking/status?queueId=...` — polls for match.
- `POST /api/matchmaking/cancel` — body `{ clientId }`.
- `GET /api/match/:matchId?clientId=...` — fetch match data (must be a participant).
- `POST /api/match/:matchId/submit` — body `{ roundId, playerAnswer, clientId }`.
- `POST /api/events` — body `{ name, properties?, clientId }` for analytics.
- `GET /api/admin/metrics` — public metrics (7d window) based on events/matches.

## Notes
- No signup/login, no email/OAuth. All auth-related code removed for v0.1.
- Typography and global styling unchanged.
- Ratings/tier persist per `clientId`.
- Future versions may reintroduce accounts; keep `clientId` as a stable fallback.
