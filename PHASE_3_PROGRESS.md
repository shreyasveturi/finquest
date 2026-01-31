# Phase 3 — Engagement & Retention (IN PROGRESS)

**Status:** 🔄 PARTIAL IMPLEMENTATION  
**Build:** ✅ Passes  
**Database:** ✅ Schema extended & migrated  
**Core Libraries:** ✅ Created (seasons.ts, labels.ts)  

---

## Overview

Phase 3 introduces **habit formation WITHOUT streaks, shame mechanics, or chat**. Focus is on:
- Identity-based labels (derived from match performance)
- Near-miss feedback ("Lost by 1 question")
- Anonymous leaderboards with seasonal resets
- Cohort tags (university affiliations)

---

## Completed

### 1. Database Schema ✅

**User model extensions:**
```prisma
cohortTag    String?   // e.g. "UCL", "LSE", "KCL"
isAnonymous  Boolean   @default(true)
publicHandle String?   // optional display name if not anonymous
anonId       String?   @unique // generated ID like "anon-7f3a2c"
```

**Match model extensions:**
```prisma
scoreA                Int?     // number correct for player A
scoreB                Int?     // number correct for player B
decidedByRoundIndex   Int?     // which round was the "swing" round
nearMiss              Boolean  @default(false)
```

**Round model extensions:**
```prisma
wasDecidingMistake  Boolean   @default(false)
efficiencyScore     Float?
```

**New models:**
```prisma
model Season {
  id        String   @id
  name      String   // e.g. "Week of 2026-01-31"
  startsAt  DateTime
  endsAt    DateTime
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  
  leaderboardSnapshots LeaderboardSnapshot[]
}

model LeaderboardSnapshot {
  id         String @id
  seasonId   String
  userId     String
  matches    Int    @default(0)
  wins       Int    @default(0)
  losses     Int    @default(0)
  accuracy   Float  @default(0)
  efficiency Float  @default(0)
  rating     Int    @default(1200)
  
  @@unique([seasonId, userId])
  @@index([seasonId, rating])
}
```

**Migration:** `20260131140000_phase_3_engagement_retention` applied successfully.

---

### 2. Core Libraries ✅

**lib/seasons.ts** — Season management helpers:
- `getActiveSeason()` — Get or create current active season
- `rotateSeason()` — End current season, create new one (for cron)
- `getOrCreateSnapshot()` — Leaderboard snapshot management
- `updateLeaderboardAfterMatch()` — Update snapshot with new match data

**lib/labels.ts** — Identity-based label computation:
- `computeUserLabel(stats)` — Returns label + blurb based on performance
- `computeUserStats(matches)` — Calculate avg accuracy, efficiency, consistency
- Labels: "Consistent Closer", "Fast but Risky", "Precision Thinker", "Building Momentum"

**Label Examples:**
```
Consistent Closer: "Stable accuracy under time pressure."
Fast but Risky: "Speed is high. Tighten your constraint checks."
Precision Thinker: "High accuracy. Work on earlier commitment."
Building Momentum: "Your reasoning patterns are taking shape."
```

---

## Remaining Work

### 3. User Profile API (TODO)
**Route:** `POST /api/user/profile`

**Purpose:** Allow users to set cohortTag, toggle isAnonymous, set publicHandle

**Validation:**
- cohortTag allowlist: `['UCL', 'LSE', 'KCL', 'Imperial', 'Oxford', 'Cambridge', 'Other']`
- publicHandle: 3-20 chars, no profanity (use existing profanity lib)
- If isAnonymous = false, require publicHandle
- If isAnonymous = true, generate anonId if missing

---

### 4. Season-Aware Leaderboard API (TODO)
**Route:** `GET /api/leaderboard?season=active&cohortTag=UCL`

**Query Params:**
- `season`: 'active' (default) or seasonId
- `cohortTag`: optional filter by cohort

**Response:**
```json
{
  "season": { "id": "...", "name": "Week of 2026-01-31" },
  "leaderboard": [
    {
      "rank": 1,
      "displayName": "anon-7f3a2c",  // if isAnonymous=true
      "cohortTag": "UCL",
      "rating": 1450,
      "matches": 12,
      "wins": 9,
      "losses": 3,
      "accuracy": 0.78
    }
  ]
}
```

**Data Source:** Query `LeaderboardSnapshot` joined with `User`

---

### 5. Near-Miss Detection in Match Completion (TODO)
**File:** `app/api/match/complete/route.ts`

**Changes needed:**
1. Compute `scoreA` (count correct rounds for player A)
2. Compute `scoreB` (bot score or player B score)
3. Detect near miss: `abs(scoreA - scoreB) == 1`
4. If near miss:
   - Find swing round: earliest incorrect round that, if correct, would change outcome
   - Mark `Round.wasDecidingMistake = true` for that round
   - Set `Match.decidedByRoundIndex` and `Match.nearMiss = true`
5. Call `updateLeaderboardAfterMatch()` from `lib/seasons.ts`

**Pseudo-code:**
```typescript
const scoreA = rounds.filter(r => r.correct).length;
const scoreB = isBotMatch ? computeBotScore(rounds) : /* playerB score */;

if (Math.abs(scoreA - scoreB) === 1 && scoreA < scoreB) {
  // Near miss loss
  const swingRound = findSwingRound(rounds, scoreA, scoreB);
  await prisma.round.update({
    where: { id: swingRound.id },
    data: { wasDecidingMistake: true },
  });
  
  await prisma.match.update({
    where: { id: matchId },
    data: {
      scoreA,
      scoreB,
      nearMiss: true,
      decidedByRoundIndex: swingRound.roundIndex,
    },
  });
}

// Update leaderboard
await updateLeaderboardAfterMatch(
  userId,
  matchResult,
  scoreA / totalRounds,
  avgEfficiency,
  newRating
);
```

---

### 6. Seasonal Reset Cron Job (TODO)
**Files:**
- `vercel.json` (new file)
- `app/api/cron/rotate-season/route.ts` (new file)

**vercel.json:**
```json
{
  "crons": [
    {
      "path": "/api/cron/rotate-season",
      "schedule": "0 0 * * 1"
    }
  ]
}
```
Runs Mondays at 00:00 UTC.

**route.ts:**
```typescript
export async function GET(req: NextRequest) {
  // Verify CRON_SECRET
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Rotate season
  const newSeason = await rotateSeason();
  
  return NextResponse.json({
    ok: true,
    newSeasonId: newSeason.id,
    newSeasonName: newSeason.name,
  });
}
```

**Environment Variable:**
Add to `.env` and Vercel:
```
CRON_SECRET=<generate-random-32-char-string>
```

---

### 7. Results Page UI Updates (TODO)
**File:** `app/match/[matchId]/results/page.tsx`

**New sections to add:**

#### A) Near-Miss Banner
```tsx
{summary.nearMiss && (
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
    <p className="text-lg font-semibold text-yellow-900">
      Lost by 1 question. Run it back.
    </p>
  </div>
)}
```

#### B) Deciding Mistake Callout
```tsx
{summary.decidedByRoundIndex !== null && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
    <h3 className="text-sm font-semibold text-red-900 mb-1">
      Deciding moment
    </h3>
    <p className="text-sm text-red-700">
      Round {summary.decidedByRoundIndex + 1} — {swingRoundFeedback || 'Check constraints before committing.'}
    </p>
  </div>
)}
```

#### C) Identity-Based Label
```tsx
{userLabel && (
  <div className={`bg-${userLabel.color}-50 border border-${userLabel.color}-200 rounded-lg p-4 mb-6`}>
    <h3 className="text-lg font-semibold text-${userLabel.color}-900">
      {userLabel.label}
    </h3>
    <p className="text-sm text-${userLabel.color}-700">
      {userLabel.blurb}
    </p>
  </div>
)}
```

Compute label server-side by fetching last 10 matches and calling `computeUserStats()` + `computeUserLabel()`.

---

### 8. Leaderboard Page with Cohort Filtering (TODO)
**File:** `app/leaderboard/page.tsx`

**Changes:**
1. Fetch season-aware leaderboard from new API endpoint
2. Add cohort filter dropdown
3. Show anonymous names (`anonId`) when `isAnonymous = true`
4. Show season name and end date

**UI Elements:**
```tsx
<select onChange={(e) => setCohortFilter(e.target.value)}>
  <option value="">All Cohorts</option>
  <option value="UCL">UCL</option>
  <option value="LSE">LSE</option>
  {/* ... */}
</select>

<div className="text-sm text-gray-500 mb-4">
  Season: {season.name} • Ends {new Date(season.endsAt).toLocaleDateString()}
</div>
```

---

## Architecture Decisions

### Why No Streaks?
Streaks create **shame on break** and **pressure to play when not motivated**. We want intrinsic motivation from improvement, not extrinsic punishment.

### Why Anonymous by Default?
Reduces performance anxiety. Users can opt-in to public handles once comfortable.

### Why Seasonal Resets?
- Fresh start every week = fair competition
- No permanent rankings that discourage new users
- Preserves historical data in snapshots

### Why Identity-Based Labels?
- Positive framing: "You ARE a X" not "You FAILED at Y"
- Derived from actual behavior patterns
- Gives users self-perception shift ("I'm a precision thinker")

### Why Near-Miss Feedback?
- Close losses are most motivating for retry
- Exactly ONE deciding mistake = specific, actionable
- Not a wall of text, just: "Round 3 — missed constraint X"

---

## Implementation Checklist

- [x] Database schema extended
- [x] Migration applied
- [x] `lib/seasons.ts` created
- [x] `lib/labels.ts` created
- [ ] User profile API (`/api/user/profile`)
- [ ] Season-aware leaderboard API (`/api/leaderboard`)
- [ ] Near-miss detection in match completion
- [ ] Leaderboard snapshot updates
- [ ] Cron job for season rotation (`vercel.json` + route)
- [ ] Results page UI (near-miss banner + deciding mistake + label)
- [ ] Leaderboard page UI (cohort filters + anonymous names)
- [ ] Anonlet ID generation on user creation/update
- [ ] Build verification
- [ ] Git commit

---

## Files Created

### Core Logic
- `lib/seasons.ts` — Season management and leaderboard snapshots
- `lib/labels.ts` — Identity-based label computation

### Database
- `prisma/migrations/20260131140000_phase_3_engagement_retention/migration.sql`

### Modified
- `prisma/schema.prisma` — Extended User, Match, Round, added Season & LeaderboardSnapshot

---

## Files To Create

### API Routes
- `app/api/user/profile/route.ts` — User cohort + anonymity settings
- `app/api/leaderboard/route.ts` — Season-aware leaderboard (replace or extend existing)
- `app/api/cron/rotate-season/route.ts` — Weekly season rotation

### Config
- `vercel.json` — Cron schedule configuration

---

## Testing Plan

1. **Near-Miss Detection:**
   - Play bot match
   - Get exactly 2 correct (bot gets 3)
   - Verify `nearMiss = true` and `decidedByRoundIndex` set

2. **Leaderboard Snapshots:**
   - Complete match
   - Query `LeaderboardSnapshot` for active season
   - Verify `matches`, `wins`, `accuracy` updated

3. **Identity Labels:**
   - Complete 10 matches with high accuracy (>0.75)
   - Check results page shows "Precision Thinker"

4. **Season Rotation:**
   - Manually call `/api/cron/rotate-season` with correct CRON_SECRET
   - Verify old season marked inactive, new season created

5. **Anonymous Display:**
   - Set `isAnonymous = true`
   - Check leaderboard shows `anonId` not `displayName`

---

## Next Steps

1. Create remaining API routes
2. Update match completion logic with near-miss detection
3. Update results page UI
4. Update leaderboard page UI
5. Add vercel.json cron config
6. Test end-to-end flow
7. Deploy to Vercel

---

**Date:** January 31, 2026  
**Status:** Core infrastructure complete, UI integration pending  
**Build:** ✅ Compiling successfully
