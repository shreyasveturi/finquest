# Bot Matchmaking Fix - Complete Implementation

## Summary

Fixed end-to-end bot matchmaking flow to ensure reliable match creation with:
- **Atomic transactions**: Match + 5 rounds created atomically with questions
- **Idempotency**: Concurrent requests return same matchId, no duplicates
- **Structured logging**: Every request has unique requestId for support debugging
- **Retry logic**: Client retries network/5xx errors with exponential backoff
- **User auto-creation**: Creates user on first match start if missing
- **Error clarity**: Friendly errors with support reference (requestId)
- **Comprehensive logging**: Stage-by-stage logs with requestId at all critical paths

## Files Changed

### 1. New Endpoint: `/app/api/match/bot/start/route.ts` ✨
**Purpose**: Replaces create-bot endpoint with idempotent, atomic bot match creation

**Key Features**:
- Validates clientId and username
- Checks for existing active/pending match (idempotency)
- Auto-creates user if missing (create-or-connect pattern)
- Fetches exactly 5 questions; errors if < 5 available
- Creates match + 5 MatchRound rows in atomic transaction
- Returns requestId in response header and body
- Comprehensive logging with requestId at each stage
- Error responses include code, message, and requestId

**Diff**: 
```typescript
POST /api/match/bot/start
Content-Type: application/json

{
  "clientId": "uuid",
  "username": "player_name"
}

Response 200:
{
  "matchId": "match_uuid",
  "requestId": "request_uuid",
  "cached": false
}

Response 400/500:
{
  "error": {
    "code": "INVALID_REQUEST" | "NO_QUESTIONS" | "INTERNAL_ERROR",
    "message": "Human readable message",
    "requestId": "request_uuid"
  }
}
```

### 2. Updated: `/app/play/page.tsx`
**Changes**:
- Replaced call from `/api/matchmaking/create-bot` → `/api/match/bot/start`
- Added clientId + username in request body
- Added retry logic: max 2 retries with backoff (300ms, 800ms)
- Only retries on network errors or 5xx; never retries 4xx
- Logs requestId from response header for support debugging
- Error message includes requestId prefix: "...Try again (ref: uuid_prefix)"
- Client-side structured logging with attempt tracking

**Key Code Flow**:
```typescript
for (let attempt = 0; attempt <= maxRetries; attempt++) {
  // Retry with backoff: 300ms, 800ms
  // Only retry on network/5xx, not 4xx
  // Log requestId from response header
  // Show friendly error with requestId to user
}
```

### 3. Enhanced: `/app/api/match/[matchId]/route.ts`
**Changes**:
- Added requestId generation (or use from header if provided)
- Log at request entry with clientId, matchId
- Log match state fetch success with round info
- Log authorization failures with detailed context
- Include requestId in response headers and error payloads
- Error responses include requestId for correlation

### 4. Enhanced: `/app/api/match/[matchId]/submit/route.ts`
**Changes**:
- Added requestId generation at entry
- Log request with roundId, playerAnswer
- Log player answer recording
- Log bot answer generation (for bot matches)
- Log round completion
- Log match completion with scores
- Log rating updates with old→new values
- Include requestId in all responses
- Error responses include requestId and request context

### 5. Enhanced: `/app/api/match/[matchId]/finalize-round/route.ts`
**Changes**:
- Added requestId generation at entry
- Log request with client/match context
- Log round finalization check (timeoutReached, bothAnswered)
- Log bot answer generation for timeout rounds
- Log round end reason (answers | timeout)
- Log match finalization with final scores
- Log rating calculations with old→new values
- Include requestId in all responses
- Error responses include requestId

### 6. New Test Suite: `/tests/bot-match-start.test.ts` 🧪
**Tests**:

**testIdempotency**: Concurrent requests return same matchId
- Makes 2 concurrent POST requests with same clientId
- Verifies both get same matchId
- Verifies exactly 1 match created
- Verifies exactly 5 rounds with roundIndex 0-4

**testUserCreation**: New user auto-created on first match
- Calls start with non-existent clientId
- Verifies user created with default rating 1200, tier Bronze
- Verifies match assigned to user

**testMissingQuestions**: Error handling when DB has < 5 questions
- Temporarily deletes questions
- Verifies 500 error with code 'NO_QUESTIONS'
- Verifies requestId in error response
- Verifies no orphan match created

## Database Changes

None required. Uses existing schema:
- `User` model with id (clientId), name (username), rating, tier
- `Match` model with isBotMatch, status (active, completed, abandoned)
- `MatchRound` model with matchId, roundIndex 0-4, question relationship

## Environment Variables

No new variables required. Continues using:
- `DATABASE_URL` for SQLite/database connection
- `NODE_ENV` for dev/prod logging levels

## Logging Strategy

### RequestId Correlation
Every request gets a unique requestId (UUID) that flows through:
- Request entry → logged immediately
- DB operations → logged with requestId
- Response → included in headers and body

Format: `[requestId] Operation description` in console logs

### Log Levels
- **INFO**: Request entry, state transitions, successful operations
- **WARN**: Retries, timeouts (on client side)
- **ERROR**: Failures with full context and stack traces

### Example Log Output
```
[abc-123-def] Start bot match request { requestId: "abc-123-def", clientId: "user-1", username: "alice" }
[abc-123-def] Checking for existing bot match { requestId: "abc-123-def", clientId: "user-1" }
[abc-123-def] Ensure user exists { requestId: "abc-123-def", clientId: "user-1" }
[abc-123-def] User already exists { requestId: "abc-123-def", userId: "user-1", rating: 1200 }
[abc-123-def] Fetching questions for match { requestId: "abc-123-def" }
[abc-123-def] Transaction start: creating match and rounds { requestId: "abc-123-def", clientId: "user-1" }
[abc-123-def] Match created with rounds { requestId: "abc-123-def", matchId: "match-1", roundCount: 5, durationMs: 45 }
[abc-123-def] Match start response { requestId: "abc-123-def", matchId: "match-1", durationMs: 52 }
```

## API Endpoint Summary

| Endpoint | Method | Change | New |
|----------|--------|--------|-----|
| `/api/match/bot/start` | POST | - | ✅ |
| `/api/match/[matchId]` | GET | Enhanced logging | -  |
| `/api/match/[matchId]/submit` | POST | Enhanced logging | - |
| `/api/match/[matchId]/finalize-round` | POST | Enhanced logging | - |
| `/api/matchmaking/create-bot` | POST | Deprecated (use bot/start) | - |

## Testing Checklist

### Unit Tests
- [x] `tests/bot-match-start.test.ts` - Idempotency, user creation, error handling

### Manual Testing

**Setup**:
```bash
npm run prisma:seed  # Ensure 5+ questions in DB
npm run dev          # Start dev server at http://localhost:3000
```

**Test Case 1: New User, First Match**
- [ ] Open http://localhost:3000/play in incognito window
- [ ] Enter username and click "Start Playing"
- [ ] Click "Play vs Bot"
- [ ] ✅ Should navigate to match page with first question visible
- [ ] ✅ Check browser console for structured logs with requestId
- [ ] ✅ Check server logs for `[uuid] Start bot match request` entry

**Test Case 2: Idempotency - Double Click**
- [ ] On play page, rapidly double-click "Play vs Bot"
- [ ] ✅ Both clicks should return same matchId
- [ ] ✅ Should navigate to same match page
- [ ] ✅ Check logs: second request should log "idempotency" cache hit

**Test Case 3: Repeat User, Multiple Matches**
- [ ] On results page, click "Play Again"
- [ ] ✅ Should create new match (not reuse previous)
- [ ] ✅ Answer 5 questions and complete match
- [ ] ✅ Click "Play Again" repeatedly
- [ ] ✅ Each should be a fresh match with 5 rounds

**Test Case 4: Slow Network with Retry**
- [ ] Open DevTools Network tab, set throttling to "Slow 3G"
- [ ] Click "Play vs Bot"
- [ ] Watch network tab: 
  - [ ] ✅ First request may timeout/fail
  - [ ] ✅ Auto-retry occurs (Attempt 2 message in console)
  - [ ] ✅ Eventually succeeds or shows friendly error with requestId
- [ ] Check console: should see retry logs with requestId

**Test Case 5: Error Cases**
- [ ] Delete all questions from DB
- [ ] Try to start match
- [ ] ✅ Should show "No questions available" error
- [ ] ✅ Error message should include requestId prefix
- [ ] Check server logs: error code 'NO_QUESTIONS' logged

**Test Case 6: Complete Match Flow**
- [ ] Start match
- [ ] Answer all 5 questions
- [ ] ✅ Should show results with new rating
- [ ] Check logs: verify `[requestId] Match completed` at each endpoint
- [ ] Trace through submit, finalize-round, rating calc

### Production Verification

**In Vercel/Production**:
```bash
# Verify environment
vercel env pull

# Check logs for requestId correlation
vercel logs --tail
```

**Monitoring**:
- [ ] Watch server logs for `[requestId]` pattern
- [ ] Monitor error rate in `/api/match/bot/start`
- [ ] Alert if error codes appear: `NO_QUESTIONS`, `INTERNAL_ERROR`

## Rollback Plan

If issues occur:

1. **Revert endpoint** (keep logging enhancements):
   - Restore old `/api/matchmaking/create-bot` route
   - Update `/app/play/page.tsx` to call old endpoint
   
2. **Keep logging** (low risk):
   - Logging changes don't affect behavior
   - Can safely stay in place

3. **Full revert**:
   - git revert to pre-fix commit
   - Verify DB backup restored if needed

## Performance Impact

**Expected**:
- ~0-5ms additional latency from idempotency check (1 DB query)
- ~0-2ms additional latency from logging (async, non-blocking)
- **Net**: Negligible overhead, improved reliability

**Scaling**:
- Prisma global client caching prevents connection pool exhaustion
- SQLite: Single file DB, no additional resources
- Logging: Streamed to stdout, no disk I/O overhead

## Migration Steps

### For Development

```bash
# 1. Pull latest code
git pull

# 2. Install deps (if changed)
npm install

# 3. Generate Prisma client
npx prisma generate

# 4. Run migrations (if any schema changes needed)
npx prisma migrate dev --name bot_match_start

# 5. Seed questions (if missing)
npm run prisma:seed

# 6. Start dev server
npm run dev

# 7. Run tests (optional, requires dev server running)
# In separate terminal:
# npx tsx tests/bot-match-start.test.ts
```

### For Production (Vercel)

```bash
# 1. Merge PR to main
git push origin fix/bot-matchmaking

# 2. Vercel auto-deploys on merge

# 3. Verify:
vercel logs --tail
# Watch for '[requestId]' patterns in logs

# 4. Monitor error rate:
# - Check /api/match/bot/start status
# - Alert if NO_QUESTIONS or INTERNAL_ERROR spikes
```

## Troubleshooting

### Issue: "Failed to connect to match against the bot"

**Debug Steps**:
1. Get error from user (should include requestId prefix)
2. Search server logs: `grep "[requestId-hex]"` in logs
3. Check for:
   - `NO_QUESTIONS` → seed questions with `npm run prisma:seed`
   - `User not found` → client ID might be null/empty
   - `Network error` → retry logic should handle; user tries again
   - `INTERNAL_ERROR` → check full error in logs

### Issue: Duplicated matches created

**Verification**:
1. Check DB: `select count(*) from Match where playerAId='<clientId>' and isBotMatch=true and status='active'`
2. If > 1: Bug in idempotency check
3. Should be fixed by: checking existing active match in line ~50 of bot/start route

### Issue: Rounds not created

**Verification**:
1. Check: `select count(*) from MatchRound where matchId='<matchId>'`
2. Should be exactly 5 for each match
3. If < 5: Questions < 5 or transaction failed mid-way
4. Check server logs for error at `Transaction start` stage

### Issue: Client not seeing requestId in error

**Check**:
1. Verify response header: `x-request-id`
2. Verify response body: `requestId` field present
3. Check browser DevTools Network tab for both

## Support / Bug Reports

Users can now provide requestId for rapid debugging:

```
User says: "Got error 'Failed to connect... (ref: a1b2c3d4)'"

Support action:
1. grep server logs for: a1b2c3d4
2. Trace full request: see all stages in logs with that prefix
3. Identify exact failure point and error code
```

## Monitoring Recommendations

Add to your monitoring/alerting system:

```
Alert on:
- POST /api/match/bot/start error rate > 5%
- Response time > 2 seconds
- Error code 'NO_QUESTIONS' appearing (DB issue)
- Error code 'INTERNAL_ERROR' spike (logic issue)

Log aggregation:
- Tag all logs with requestId
- Group by requestId for request tracing
- Alert on error patterns by code
```

## Future Improvements

Potential enhancements post-launch:

1. **Distributed tracing**: Extend requestId through event service and rating calculations
2. **Circuit breaker**: Auto-fallback if question fetch fails repeatedly
3. **Cache warmup**: Pre-fetch questions on server start
4. **Metrics**: Track P50/P95/P99 latencies per endpoint
5. **Human matchmaking**: Apply same idempotency + logging to future peer matches
