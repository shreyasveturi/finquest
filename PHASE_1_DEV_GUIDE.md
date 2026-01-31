# Phase 1 Quick Reference for Developers

## File Map

| File | Purpose | Status |
|------|---------|--------|
| `lib/feedbackMap.ts` | Feedback taxonomy enum + text mapping | ✅ New |
| `lib/feedback.ts` | Heuristic assignment logic | ✅ New |
| `prisma/schema.prisma` | Added feedbackTag, feedbackText to Round | ✅ Modified |
| `app/api/match/complete/route.ts` | Feedback generation after completion | ✅ Modified |
| `app/api/match/[matchId]/summary/route.ts` | Include feedback in API response | ✅ Modified |
| `app/match/[matchId]/results/page.tsx` | Display feedback on results page | ✅ Modified |

---

## Key Exports

### feedbackMap.ts
```typescript
export enum FeedbackTag { /* 7 tags */ }
export const FEEDBACK_MAP: Record<FeedbackTag, string>
export function getFeedbackText(tag: FeedbackTag): string
```

### feedback.ts
```typescript
export interface RoundData { /* timing + correctness signals */ }
export function assignFeedback(round: RoundData): FeedbackTag | null
export function assignFeedbackBatch(rounds: RoundData[]): Map<number, FeedbackTag>
```

---

## Feedback Generation Flow

```
POST /api/match/complete
  ├─ Mark match COMPLETED
  ├─ Update ratings
  ├─ Send response
  └─ [Background]
     └─ For each incorrect round without feedback:
        ├─ Build RoundData from Round fields
        ├─ assignFeedback(roundData) → tag
        ├─ getFeedbackText(tag) → text
        └─ Update Round with feedbackTag + feedbackText
```

---

## Adding New Feedback Tags

1. Add to `FeedbackTag` enum in `lib/feedbackMap.ts`
2. Add entry to `FEEDBACK_MAP` constant
3. Add heuristic in `lib/feedback.ts` (optional, or use for future phases)
4. No database changes needed (TEXT field is flexible)

Example:
```typescript
// feedbackMap.ts
export enum FeedbackTag {
  // ... existing 7 tags
  MY_NEW_TAG = 'MY_NEW_TAG',
}

export const FEEDBACK_MAP: Record<FeedbackTag, string> = {
  // ... existing mappings
  [FeedbackTag.MY_NEW_TAG]: 'Your new insight here.',
};

// feedback.ts
if (someCondition) {
  return FeedbackTag.MY_NEW_TAG;
}
```

---

## Adjusting Heuristic Thresholds

In `lib/feedback.ts`, modify these constants:

```typescript
const earlyThreshold = 0.3;    // < 30% time = RUSHED_DECISION
const lateThreshold = 0.8;     // > 80% time = OVERTHOUGHT
// Late commit threshold: 0.7 (line in timeToFirstCommitMs check)
```

Then rebuild and re-run feedback generation on existing matches (idempotent).

---

## Testing Feedback Assignment

```typescript
// In a test file or node REPL
import { assignFeedback } from '@/lib/feedback';
import { getFeedbackText } from '@/lib/feedbackMap';

const testRound = {
  correct: false,
  responseTimeMs: 7000,
  timeExpired: false,
  roundDurationMs: 25000,
  timeToFirstCommitMs: 6500,
};

const tag = assignFeedback(testRound);
console.log(tag); // "RUSHED_DECISION"
console.log(getFeedbackText(tag)); // "You prioritised speed..."
```

---

## Regenerating Feedback

For existing matches, to re-assign feedback:

```bash
# Delete existing feedback for a match (careful!)
# Then the next POST /api/match/complete will regenerate it

# Or manually re-run the logic:
npx prisma db push  # Ensure schema is up to date
# Then trigger feedback generation (call /api/match/complete again)
```

---

## Database Queries

### Get all incorrect rounds with feedback
```sql
SELECT * FROM "Round" 
WHERE correct = false AND feedbackTag IS NOT NULL;
```

### Get all incorrect rounds WITHOUT feedback (pending)
```sql
SELECT * FROM "Round" 
WHERE correct = false AND feedbackTag IS NULL;
```

### Count feedback assignments by tag
```sql
SELECT feedbackTag, COUNT(*) as count 
FROM "Round" 
WHERE feedbackTag IS NOT NULL 
GROUP BY feedbackTag 
ORDER BY count DESC;
```

---

## Common Issues

### Feedback not showing on results page
- ✅ Check that `feedbackTag` + `feedbackText` are in Round data
- ✅ Verify `/api/match/{matchId}/summary` includes feedback fields
- ✅ Check browser console for API errors
- ✅ Confirm match was marked COMPLETED (not PENDING)

### Feedback generation timing
- Feedback generation is **non-blocking** (runs after response)
- If you refresh results page immediately, feedback may not be visible yet
- Wait a few seconds or check database directly

### Same feedback every time
- Heuristic is deterministic — same input = same output
- This is intentional (reproducibility)
- For randomization, adjust heuristic logic

---

## Monitoring Feedback Quality

### Metrics to track
- **Feedback coverage:** % of incorrect rounds with feedback
- **Tag distribution:** Which tags appear most often?
- **User improvement:** Do users who see feedback improve on next attempt?
- **Engagement:** Which insights do users find most helpful?

### Queries for monitoring
```typescript
// Get feedback stats by user
const stats = await prisma.round.groupBy({
  by: ['userId', 'feedbackTag'],
  where: { correct: false, feedbackTag: { not: null } },
  _count: true,
});

// Get recent feedback
const recent = await prisma.round.findMany({
  where: { feedbackTag: { not: null } },
  orderBy: { createdAt: 'desc' },
  take: 100,
});
```

---

## API Response Structure

```typescript
interface RoundSummary {
  roundIndex: number;
  correct: boolean;
  responseTimeMs: number;
  timeExpired: boolean;
  selectedOption: string | null;
  timeToFirstCommitMs: number | null;
  questionPrompt: string;
  correctIndex: number;
  
  // Phase 1 additions:
  feedbackTag?: string | null;    // e.g., "RUSHED_DECISION"
  feedbackText?: string | null;   // Short insight
}
```

---

## React Component Usage

```tsx
// In results page
const incorrectRounds = summary.rounds.filter(r => !r.correct);
const feedbackInsights = incorrectRounds
  .filter(r => r.feedbackText)
  .map(r => ({
    roundIndex: r.roundIndex,
    feedbackText: r.feedbackText,
  }));

// Render
{feedbackInsights.map((insight, idx) => (
  <div key={idx}>
    <p>Round {insight.roundIndex + 1}</p>
    <p>{insight.feedbackText}</p>
  </div>
))}
```

---

## Schema Changes Recap

**Before:**
```sql
ALTER TABLE "Round" ADD COLUMN "responseTimeMs" INT;
ALTER TABLE "Round" ADD COLUMN "timeToFirstCommitMs" INT;
```

**Now (Phase 1):**
```sql
ALTER TABLE "Round" ADD COLUMN "feedbackTag" TEXT;
ALTER TABLE "Round" ADD COLUMN "feedbackText" TEXT;
```

---

## Environment Variables

No new environment variables required. Uses existing:
- `DATABASE_URL` — PostgreSQL connection

---

## Performance Considerations

- Feedback assignment is **O(n)** where n = incorrect rounds per match
- Typical match: 5 rounds × ~40% accuracy = 2 incorrect rounds
- Database writes are batched within feedback generation loop
- No impact on match completion response time (non-blocking)

---

## Future Enhancement Hooks

### TODO: Adaptive thresholds
```typescript
// Future: per-user baseline speed
const userAvgSpeed = await getUserAverageResponseTime(userId);
const personalizedThreshold = userAvgSpeed * 0.3;
```

### TODO: Difficulty-aware feedback
```typescript
// Future: adjust based on question difficulty
if (round.difficulty === 'hard') {
  // Use different hresholds for hard questions
}
```

### TODO: Feedback rotation
```typescript
// Future: avoid repeating same insight
const recentFeedback = await getUserRecentFeedback(userId, limit: 5);
if (!recentFeedback.includes(tag)) {
  // Assign tag
}
```

---

## Support & Questions

For more details, see:
- [PHASE_1_FEEDBACK.md](PHASE_1_FEEDBACK.md) — Full spec
- [PHASE_1_EXAMPLES.md](PHASE_1_EXAMPLES.md) — Examples
- [PHASE_1_CHECKLIST.md](PHASE_1_CHECKLIST.md) — Requirements
