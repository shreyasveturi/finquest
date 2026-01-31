# Phase 1: Feedback Without Cognitive Overload — Implementation Summary

## Overview
This implementation delivers sparse, structural feedback that appears **only on the post-match results screen** (never mid-round). Feedback reinforces reasoning schemas and is designed to help performance on the *next* attempt, not solve past questions.

---

## Architecture

### 1. Data Model
**File:** [prisma/schema.prisma](prisma/schema.prisma)

Extended the `Round` model with two new fields:
```prisma
feedbackTag    String?   // e.g. "MISSED_CONSTRAINT", "RUSHED_DECISION"
feedbackText   String?   // short, human-readable insight
```

**Migration:** `20260131030200_add_feedback_fields`

---

### 2. Feedback Taxonomy
**File:** [lib/feedbackMap.ts](lib/feedbackMap.ts)

Fixed set of **7 feedback tags**, each with a structural insight:

| Tag | Insight |
|-----|---------|
| `MISSED_CONSTRAINT` | You committed without checking the binding constraint. |
| `UNCHECKED_ASSUMPTION` | You accepted an assumption without validating it against the evidence. |
| `RUSHED_DECISION` | You prioritised speed before validating the structure. |
| `OVERTHOUGHT` | You added complexity where the structure was simple. |
| `LOCAL_OPTIMUM` | You optimised locally instead of comparing trade-offs. |
| `MISREAD_STRUCTURE` | You focused on surface details instead of the underlying structure. |
| `SIGNAL_NOISE_CONFUSION` | You treated noise as signal, or missed the signal in the details. |

---

### 3. Heuristic Assignment Logic
**File:** [lib/feedback.ts](lib/feedback.ts)

Function `assignFeedback(round: RoundData)` assigns one tag per incorrect round using simple heuristics:

**Inputs:**
- `correct` (boolean)
- `responseTimeMs` (number)
- `timeExpired` (boolean)
- `roundDurationMs` (number)
- `timeToFirstCommitMs` (optional number)

**Heuristics (checked in order):**

1. **Time expired** → `MISSED_CONSTRAINT`
   - Ran out of time, likely didn't check all constraints

2. **Very fast** (< 30% of round time) → `RUSHED_DECISION`
   - Prioritized speed over validation

3. **Very slow** (> 80% of round time) → `OVERTHOUGHT`
   - Spent too much time, likely added unnecessary complexity

4. **Late commit** (timeToFirstCommitMs > 70% of round time) → `UNCHECKED_ASSUMPTION`
   - Uncertain, kept re-checking, didn't validate assumptions early

5. **Medium speed** (45–75% of round time) → `MISREAD_STRUCTURE` or `SIGNAL_NOISE_CONFUSION`
   - Alternated deterministically based on response time

6. **Fallback** → `MISREAD_STRUCTURE`

**Properties:**
- Idempotent: safe to re-run multiple times
- Deterministic: same input always produces same output
- NO LLM calls or long explanations

---

### 4. Feedback Generation
**File:** [app/api/match/complete/route.ts](app/api/match/complete/route.ts)

After match completion:
1. Mark match as `COMPLETED` and update ratings (unchanged)
2. Fetch all incorrect rounds without feedback
3. For each round:
   - Build `RoundData` with timing + correctness signals
   - Assign tag via `assignFeedback()`
   - Fetch insight text via `getFeedbackText()`
   - Update `Round` row with `feedbackTag` + `feedbackText`

**Flow is non-blocking:** Feedback generation happens *after* match completion response, ensuring match completes immediately.

---

### 5. Feedback in API Response
**File:** [app/api/match/[matchId]/summary/route.ts](app/api/match/[matchId]/summary/route.ts)

Updated `RoundSummary` interface to include:
```typescript
feedbackTag?: string | null;
feedbackText?: string | null;
```

Feedback is included in the `/api/match/{matchId}/summary` response.

---

### 6. Results Page UI
**File:** [app/match/[matchId]/results/page.tsx](app/match/[matchId]/results/page.tsx)

Added **"What to improve next time"** section after Performance Analysis metrics:

**Three states:**

1. **No incorrect answers:**
   ```
   ✨ What to improve next time
   No feedback needed — accuracy was high.
   ```

2. **Incorrect rounds with feedback:**
   ```
   ✨ What to improve next time
   💡 Round 2
      You committed without checking the binding constraint.
   
   💡 Round 4
      You added complexity where the structure was simple.
   ```

3. **No feedback section** if all rounds have no feedback text

**UX principles:**
- Max 1–2 sentences per insight
- Skimmable in < 1 second per round
- Blue accent cards for visual consistency
- Emoji indicators (💡) for quick scanning
- No per-round replay or option explanations
- No scrolling walls of text

---

## Key Design Decisions

### 1. Feedback Only for Incorrect Answers
- ✅ Only incorrect rounds receive feedback
- ✅ Correct answers show no insight (reinforce success without interruption)

### 2. Post-Match Display Only
- ✅ Feedback appears ONLY on results screen
- ✅ Never shown mid-game (maintains focus during play)
- ✅ Never interrupts match flow

### 3. Structural, Not Content-Based
- ✅ Insights apply to *classes* of problems
- ✅ Language uses reasoning schema terminology
- ✅ No explanation of the correct answer
- ✅ No teaching of content

### 4. Timing-Based Heuristics
- ✅ Uses existing `responseTimeMs` + `timeToFirstCommitMs` data
- ✅ No additional data collection needed
- ✅ Deterministic and repeatable
- ✅ No ML/LLM overhead

### 5. Immutable Feedback
- ✅ Once assigned, feedback cannot change
- ✅ Idempotent: re-running the same match's feedback generation is safe
- ✅ Feedback persists in database for analytics/learning

---

## Testing & Validation

### Build Status
✅ **Production build succeeds** with no TypeScript errors in feedback-related code

### Key Files Modified
1. [prisma/schema.prisma](prisma/schema.prisma) — Added `feedbackTag`, `feedbackText`
2. [lib/feedbackMap.ts](lib/feedbackMap.ts) — NEW: Taxonomy enum + mapping
3. [lib/feedback.ts](lib/feedback.ts) — NEW: Heuristic assignment logic
4. [app/api/match/complete/route.ts](app/api/match/complete/route.ts) — Added feedback generation
5. [app/api/match/[matchId]/summary/route.ts](app/api/match/[matchId]/summary/route.ts) — Added feedback to response
6. [app/match/[matchId]/results/page.tsx](app/match/[matchId]/results/page.tsx) — Added UI section

### Database
✅ Prisma migration applied: `20260131030200_add_feedback_fields`

---

## Next Steps / Future Enhancements

### Phase 1.1: Calibration
- Collect feedback generation data and accuracy over 100+ matches
- Adjust heuristic thresholds based on actual performance deltas
- A/B test different insight phrasings

### Phase 1.2: Analytics
- Track which feedback tags correlate with improvement on next attempt
- Identify "stuck" insights (those that don't help)
- Measure cognitive load reduction vs. Phase 0

### Phase 2: Adaptive Feedback
- Layer feedback by difficulty (easy questions get different insights)
- Personalization based on user's performance patterns
- Spaced repetition of key insights

---

## Summary

Phase 1 is now **production-ready**:
- ✅ Sparse, structural feedback without cognitive overload
- ✅ Appears only on post-match results screen
- ✅ Uses simple, deterministic heuristics (no AI)
- ✅ Integrated into existing match flow
- ✅ Database-backed for persistence + analytics
- ✅ All TypeScript, fully typed
- ✅ Builds successfully with Next.js App Router + Vercel

The system is designed to help users improve their reasoning schemas on the *next* attempt by identifying failure modes in their problem-solving process.
