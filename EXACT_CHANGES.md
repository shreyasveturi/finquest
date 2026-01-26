# Bot Matchmaking Fix - Exact Changes & Diffs

## Summary of Changes

**5 files modified, 3 new files created**

### Modified Files (Existing Endpoints Enhanced)
1. `app/play/page.tsx` - Retry logic + endpoint change
2. `app/api/match/[matchId]/route.ts` - Add requestId logging
3. `app/api/match/[matchId]/submit/route.ts` - Add requestId logging
4. `app/api/match/[matchId]/finalize-round/route.ts` - Add requestId logging

### New Files
1. `app/api/match/bot/start/route.ts` - New idempotent bot match endpoint
2. `tests/bot-match-start.test.ts` - Automated test suite
3. Documentation files (3)

---

## Diff 1: New Bot Start Endpoint

**File**: `app/api/match/bot/start/route.ts` (NEW FILE - 200 lines)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { trackEvent } from '@/lib/events';

/**
 * POST /api/match/bot/start
 * Start a bot match with idempotency per clientId.
 * Returns: { matchId, requestId }
 *
 * Request body: { clientId, username }
 *
 * Guarantees:
 * - Idempotent: same clientId always returns same matchId (if match still pending/active)
 * - Atomic: match + 5 rounds + questions all created or all rolled back
 * - Logged: each stage with requestId for support debugging
 */
export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    const { clientId, username } = await req.json();

    // Validation
    if (!clientId || !username) {
      console.error(`[${requestId}] Missing clientId or username`, {
        requestId,
        clientId: clientId ? 'present' : 'missing',
        username: username ? 'present' : 'missing',
      });
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_REQUEST',
            message: 'clientId and username are required',
            requestId,
          },
        },
        { status: 400, headers: { 'x-request-id': requestId } }
      );
    }

    console.log(`[${requestId}] Start bot match request`, {
      requestId,
      clientId,
      username,
    });

    // Check for existing active/pending bot match for this clientId (IDEMPOTENCY)
    console.log(`[${requestId}] Checking for existing bot match`, { requestId, clientId });
    const existingMatch = await prisma.match.findFirst({
      where: {
        playerAId: clientId,
        isBotMatch: true,
        status: {
          in: ['active', 'in_progress'],
        },
      },
      select: {
        id: true,
        status: true,
        rounds: {
          select: { id: true },
        },
      },
    });

    if (existingMatch && existingMatch.rounds.length === 5) {
      console.log(`[${requestId}] Returning existing match (idempotency)`, {
        requestId,
        clientId,
        matchId: existingMatch.id,
        durationMs: Date.now() - startTime,
      });
      const headers = new Headers({
        'x-request-id': requestId,
      });
      return NextResponse.json(
        {
          matchId: existingMatch.id,
          requestId,
          cached: true,
        },
        { status: 200, headers }
      );
    }

    // Ensure user exists; create if not
    console.log(`[${requestId}] Ensure user exists`, { requestId, clientId });
    let user = await prisma.user.findUnique({
      where: { id: clientId },
    });

    if (!user) {
      console.log(`[${requestId}] Creating new user`, { requestId, clientId, username });
      user = await prisma.user.create({
        data: {
          id: clientId,
          name: username,
          rating: 1200,
          tier: 'Bronze',
        },
      });
      console.log(`[${requestId}] User created`, { requestId, userId: user.id, rating: user.rating });
    } else {
      console.log(`[${requestId}] User already exists`, { requestId, userId: user.id, rating: user.rating });
    }

    // Fetch exactly 5 questions
    console.log(`[${requestId}] Fetching questions for match`, { requestId });
    const questions = await prisma.question.findMany({
      take: 5,
      orderBy: { id: 'asc' },
    });

    if (!questions || questions.length < 5) {
      console.error(`[${requestId}] Not enough questions in database`, {
        requestId,
        found: questions?.length || 0,
        required: 5,
        durationMs: Date.now() - startTime,
      });
      return NextResponse.json(
        {
          error: {
            code: 'NO_QUESTIONS',
            message: 'Not enough questions available. Please contact support.',
            requestId,
          },
        },
        { status: 500, headers: { 'x-request-id': requestId } }
      );
    }

    console.log(`[${requestId}] Transaction start: creating match and rounds`, { requestId, clientId });

    // Atomic transaction: create match and all rounds in one go
    const match = await prisma.match.create({
      data: {
        playerAId: clientId,
        isBotMatch: true,
        status: 'active',
        startedAt: new Date(),
        rounds: {
          createMany: {
            data: questions.map((q, index) => ({
              roundIndex: index,
              questionId: q.id,
              correctIndex: q.correctIndex,
            })),
          },
        },
      },
      include: {
        rounds: {
          select: {
            id: true,
            roundIndex: true,
          },
        },
      },
    });

    console.log(`[${requestId}] Match created with rounds`, {
      requestId,
      matchId: match.id,
      roundCount: match.rounds.length,
      durationMs: Date.now() - startTime,
    });

    // Track events
    await Promise.all([
      trackEvent(
        'bot_match_created',
        {
          matchId: match.id,
          playerRating: user.rating,
          roundCount: match.rounds.length,
          requestId,
        },
        clientId
      ),
      trackEvent(
        'match_started',
        {
          matchId: match.id,
          isBotMatch: true,
          requestId,
        },
        clientId
      ),
    ]);

    console.log(`[${requestId}] Match start response`, {
      requestId,
      matchId: match.id,
      durationMs: Date.now() - startTime,
    });

    const headers = new Headers({
      'x-request-id': requestId,
      'Content-Type': 'application/json',
    });

    return NextResponse.json(
      {
        matchId: match.id,
        requestId,
      },
      { status: 200, headers }
    );
  } catch (error) {
    const durationMs = Date.now() - startTime;
    console.error(`[${requestId}] Bot match start error`, {
      requestId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      durationMs,
    });

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to start bot match. Please try again.',
          requestId,
        },
      },
      { status: 500, headers: { 'x-request-id': requestId } }
    );
  }
}
```

---

## Diff 2: Play Page Changes

**File**: `app/play/page.tsx`

**BEFORE** (lines 54-72):
```typescript
  const handlePlayBot = async () => {
    const ident = ensureIdentity();
    if (!ident) return;
    await logEvent('cta_play_vs_bot_clicked');

    try {
      const res = await fetch('/api/matchmaking/create-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: ident.clientId }),
      });
      const data = await res.json();

      if (data.matchId) {
        router.push(`/match/${data.matchId}`);
      } else {
        setError('Failed to create bot match');
      }
    } catch (err) {
      setError('Failed to create bot match');
    }
  };
```

**AFTER** (lines 54-140):
```typescript
  const handlePlayBot = async () => {
    const ident = ensureIdentity();
    if (!ident) return;
    await logEvent('cta_play_vs_bot_clicked');
    setError(null);

    const maxRetries = 2;
    const backoffMs = [300, 800]; // ms delays for retries
    let lastError: any = null;
    let lastRequestId: string | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`[PlayBot] Retry attempt ${attempt}/${maxRetries}, waiting ${backoffMs[attempt - 1]}ms`);
          await new Promise(resolve => setTimeout(resolve, backoffMs[attempt - 1]));
        }

        console.log(`[PlayBot] Attempt ${attempt + 1}/${maxRetries + 1}: POST /api/match/bot/start`, {
          clientId: ident.clientId,
          username: ident.username,
        });

        const res = await fetch('/api/match/bot/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: ident.clientId,
            username: ident.username,
          }),
        });

        lastRequestId = res.headers.get('x-request-id');
        const data = await res.json();

        if (!res.ok) {
          lastError = data;
          console.error(`[PlayBot] Attempt ${attempt + 1} failed:`, {
            status: res.status,
            error: data.error,
            requestId: lastRequestId,
          });

          // Only retry on network errors or 5xx; don't retry on 4xx client errors
          if (res.status >= 400 && res.status < 500) {
            throw new Error(`Client error (${res.status}): ${data.error?.message || 'Unknown error'}`);
          }
          // 5xx or network error; try again if retries remain
          if (attempt < maxRetries) {
            continue;
          }
          throw new Error(data.error?.message || 'Failed to start bot match');
        }

        // Success
        console.log(`[PlayBot] Match started successfully`, {
          matchId: data.matchId,
          requestId: lastRequestId,
          attempt: attempt + 1,
        });

        await logEvent('bot_match_started', {
          matchId: data.matchId,
          requestId: lastRequestId,
        });

        router.push(`/match/${data.matchId}`);
        return;
      } catch (err) {
        lastError = err;
        console.error(`[PlayBot] Attempt ${attempt + 1} exception:`, {
          error: err instanceof Error ? err.message : String(err),
          requestId: lastRequestId,
        });

        // If last attempt or client error, stop retrying
        if (attempt >= maxRetries || (err instanceof Error && err.message.includes('Client error'))) {
          break;
        }
      }
    }

    // All retries exhausted
    let errorMsg = 'Failed to connect to match against the bot. Try again';
    if (lastRequestId) {
      errorMsg += ` (ref: ${lastRequestId.slice(0, 8)})`;
    }
    console.error(`[PlayBot] All retries exhausted`, {
      lastError,
      requestId: lastRequestId,
    });
    setError(errorMsg);
  };
```

---

## Diff 3: GET Match Endpoint Logging

**File**: `app/api/match/[matchId]/route.ts`

**Key additions**:
```diff
- const ROUND_DURATION_MS = 25000; // 25s per round

+ const ROUND_DURATION_MS = 25000; // 25s per round

  export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ matchId: string }> }
  ) {
+   const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
    try {
      const { matchId } = await params;
      const { searchParams } = new URL(req.url);
      const clientId = searchParams.get('clientId');
+
+     console.log(`[${requestId}] GET /api/match/:matchId`, {
+       requestId,
+       matchId,
+       clientId,
+     });

      const match = await prisma.match.findUnique({
        where: { id: matchId },
        include: {
          rounds: {
            include: {
              question: true,
            },
            orderBy: {
              roundIndex: 'asc',
            },
          },
        },
      });

      if (!match) {
+       console.error(`[${requestId}] Match not found`, { requestId, matchId });
-       return NextResponse.json({ error: 'Match not found' }, { status: 404 });
+       return NextResponse.json({ error: 'Match not found', requestId }, { status: 404 });
      }

      // Verify user is in this match
      if (!clientId || (match.playerAId !== clientId && match.playerBId !== clientId)) {
+       console.error(`[${requestId}] Unauthorized match access`, {
+         requestId,
+         matchId,
+         clientId,
+         playerAId: match.playerAId,
+         playerBId: match.playerBId,
+       });
-       return NextResponse.json(
-         { error: 'Not a player in this match' },
-         { status: 403 }
-       );
+       return NextResponse.json(
+         { error: 'Not a player in this match', requestId },
+         { status: 403 }
+       );
      }

      // ... existing round computation code ...

+     console.log(`[${requestId}] Match state fetched successfully`, {
+       requestId,
+       matchId,
+       currentRoundIndex: activeIndex === -1 ? orderedRounds.length - 1 : activeIndex,
+       roundStatus,
+       totalRounds: orderedRounds.length,
+     });

+     const headers = new Headers({ 'x-request-id': requestId });
-     return NextResponse.json({
+     return NextResponse.json(
+       {
          ...match,
          currentRoundIndex: activeIndex === -1 ? orderedRounds.length - 1 : activeIndex,
          roundStartAt,
          roundDurationMs,
          roundStatus,
          serverNow: now,
-       });
+       },
+       { headers }
+     );
    } catch (error) {
+     console.error(`[${requestId}] Fetch match error`, {
+       requestId,
+       error: error instanceof Error ? error.message : String(error),
+       stack: error instanceof Error ? error.stack : undefined,
+     });
-     console.error('Fetch match error:', error);
-     if (error instanceof Error) {
-       console.error('Error details:', { message: error.message, stack: error.stack });
-     }
-     return NextResponse.json(
-       { error: 'Failed to fetch match' },
-       { status: 500 }
-     );
+     return NextResponse.json(
+       { error: 'Failed to fetch match', requestId },
+       { status: 500, headers: { 'x-request-id': requestId } }
+     );
    }
  }
```

---

## Diff 4: Submit Endpoint Logging

**File**: `app/api/match/[matchId]/submit/route.ts`

**Key additions** (similar pattern to GET):
```diff
+ const requestId = crypto.randomUUID();
  try {
    const { matchId } = await params;
    const { roundId, playerAnswer, clientId } = await req.json();
+
+   console.log(`[${requestId}] POST /api/match/:matchId/submit`, {
+     requestId,
+     matchId,
+     roundId,
+     clientId,
+     playerAnswer,
+   });

    if (!clientId || !roundId || playerAnswer === undefined) {
+     console.error(`[${requestId}] Missing required fields`, { requestId, clientId, roundId, playerAnswer });
-     return NextResponse.json(
-       { error: 'clientId, roundId, and playerAnswer required' },
-       { status: 400 }
-     );
+     return NextResponse.json(
+       { error: 'clientId, roundId, and playerAnswer required', requestId },
+       { status: 400, headers: { 'x-request-id': requestId } }
+     );
    }

    // ... get round, verify, update answer ...

+   console.log(`[${requestId}] Recording player answer`, { requestId, roundId, isPlayerA, playerAnswer });
    await prisma.matchRound.update({ where: { id: roundId }, data: { ... } });

    // If bot match, generate bot answer
    if (round.match.isBotMatch && isPlayerA) {
      const botAnswer = getBotAnswer(round.questionId, round.question.difficulty);
+     console.log(`[${requestId}] Generating bot answer`, { requestId, roundId, botAnswer });
      await prisma.matchRound.update({ where: { id: roundId }, data: { playerBAnswer: botAnswer } });
    }

    // ... check if round complete ...

    if (roundComplete) {
+     console.log(`[${requestId}] Round complete, ending round`, { requestId, roundId });
      await prisma.matchRound.update({ where: { id: roundId }, data: { endedAt: new Date() } });
      // ... track event ...
    }

    // ... check if match complete ...

    if (allRoundsCompleteByAnswers || allRoundsEnded) {
+     console.log(`[${requestId}] All rounds complete, finalizing match`, { requestId, matchId });
      // ... calculate scores ...
+     console.log(`[${requestId}] Match scores`, { requestId, playerAScore, playerBScore, winner: ... });
      // ... calculate ratings ...
+     console.log(`[${requestId}] Updating ratings`, { requestId, playerAOld: ..., playerANew: ..., ... });
      // ... update DB ...
+     console.log(`[${requestId}] Match finalized`, { requestId, matchId, status: 'completed' });

-     return NextResponse.json({
+     return NextResponse.json(
+       {
          matchComplete: true,
          playerAScore,
          playerBScore,
          winner: ...,
          playerANewRating,
          playerBNewRating,
+         requestId,
-       });
+       },
+       { headers: { 'x-request-id': requestId } }
+     );
    }

+   console.log(`[${requestId}] Submit successful, match continues`, { requestId, roundComplete });
-   return NextResponse.json({
+   return NextResponse.json(
+     {
        matchComplete: false,
        roundComplete,
+       requestId,
-     });
+     },
+     { headers: { 'x-request-id': requestId } }
+   );
  } catch (error) {
+   console.error(`[${requestId}] Submit error`, {
+     requestId,
+     error: error instanceof Error ? error.message : String(error),
+     stack: error instanceof Error ? error.stack : undefined,
+   });
-   console.error('Submit error:', error);
-   if (error instanceof Error) {
-     console.error('Submit error details:', { message: error.message, stack: error.stack });
-   }
-   return NextResponse.json(
-     { error: 'Submission failed' },
-     { status: 500 }
-   );
+   return NextResponse.json(
+     { error: 'Submission failed', requestId },
+     { status: 500, headers: { 'x-request-id': requestId } }
+   );
  }
```

---

## Diff 5: Finalize Round Endpoint Logging

**File**: `app/api/match/[matchId]/finalize-round/route.ts`

**Same pattern as Submit**:
- Add `const requestId = crypto.randomUUID()` at start
- Log at request entry with full context
- Log at each decision point (timeout, both answered, etc.)
- Log at match finalization with scores and ratings
- Include requestId in all error responses and response headers

---

## Testing Commands

```bash
# Install and setup
npm install
npx prisma generate

# Ensure questions exist
npm run prisma:seed

# Start dev server (required for tests)
npm run dev

# In another terminal, run tests
npx tsx tests/bot-match-start.test.ts

# Build for production
npm run build
```

---

## Verification Checklist

After deployment, verify:

- [ ] `npm run build` completes with no errors
- [ ] Dev server starts: `npm run dev`
- [ ] Can create match at http://localhost:3000/play
- [ ] Browser console shows logs with requestId
- [ ] Server logs show [uuid] patterns
- [ ] Double-clicking Play doesn't create duplicates
- [ ] Network throttling + retry works
- [ ] Tests pass: `npx tsx tests/bot-match-start.test.ts`
- [ ] Empty questions DB shows NO_QUESTIONS error
- [ ] All 5 questions appear in matches
- [ ] Ratings update after completing match
