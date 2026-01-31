# Phase 1 Feedback: Example Assignments

This document shows how the heuristic logic assigns feedback tags and insights to different player behaviors.

---

## Example Scenarios

### Scenario 1: Time Expired
```
roundDurationMs: 25000
responseTimeMs: 25000
timeExpired: true
correct: false
```

**Assignment:** `MISSED_CONSTRAINT`
**Insight:** "You committed without checking the binding constraint."

**Why:** When time expires, the player likely didn't have enough time to check all constraints. The feedback prompts them to validate constraints *before* committing.

---

### Scenario 2: Rushed Decision (< 30% time used)
```
roundDurationMs: 25000
responseTimeMs: 7000  // 28% of available time
timeExpired: false
timeToFirstCommitMs: 6500
correct: false
```

**Assignment:** `RUSHED_DECISION`
**Insight:** "You prioritised speed before validating the structure."

**Why:** Very quick response suggests player prioritized speed over careful analysis. Feedback prompts validation of structure before committing.

---

### Scenario 3: Overthought (> 80% time used)
```
roundDurationMs: 25000
responseTimeMs: 21000  // 84% of available time
timeExpired: false
timeToFirstCommitMs: 2000
correct: false
```

**Assignment:** `OVERTHOUGHT`
**Insight:** "You added complexity where the structure was simple."

**Why:** Spent most of the time but still got it wrong → likely added unnecessary complexity. Feedback prompts them to keep solutions simple.

---

### Scenario 4: Uncertain/Late Commit
```
roundDurationMs: 25000
responseTimeMs: 18000
timeExpired: false
timeToFirstCommitMs: 16500  // 66% of round time
correct: false
```

**Assignment:** `UNCHECKED_ASSUMPTION`
**Insight:** "You accepted an assumption without validating it against the evidence."

**Why:** Very late first commit suggests uncertainty and re-checking. Likely accepted an assumption early and only realized doubt later. Feedback prompts early validation.

---

### Scenario 5: Medium Speed (45–75%)
```
roundDurationMs: 25000
responseTimeMs: 14000  // 56% of available time
timeExpired: false
timeToFirstCommitMs: null
correct: false
```

**Assignment:** `MISREAD_STRUCTURE` OR `SIGNAL_NOISE_CONFUSION` (deterministic based on responseTimeMs % 2)

**Insight:** "You focused on surface details instead of the underlying structure." OR "You treated noise as signal, or missed the signal in the details."

**Why:** Medium-speed wrong answers suggest they analyzed something but got it wrong. Either misread the question structure or focused on distracting details.

---

## How Feedback Looks on Results Page

### After a match with multiple incorrect rounds:

```
┌─────────────────────────────────────────┐
│ ✨ What to improve next time            │
├─────────────────────────────────────────┤
│ 💡 Round 1                              │
│    You prioritised speed before         │
│    validating the structure.            │
├─────────────────────────────────────────┤
│ 💡 Round 3                              │
│    You committed without checking the   │
│    binding constraint.                  │
├─────────────────────────────────────────┤
│ 💡 Round 4                              │
│    You added complexity where the       │
│    structure was simple.                │
└─────────────────────────────────────────┘
```

---

## Data Points Used for Assignment

The heuristic has access to these signals from each Round:

```typescript
interface RoundData {
  correct: boolean;                 // Did player answer correctly?
  responseTimeMs: number;           // Total time spent on this round
  timeExpired: boolean;             // Did time run out?
  roundDurationMs: number;          // Total available time (typically 25000ms)
  timeToFirstCommitMs?: number;     // Time until first selection made
  optionCount?: number;             // Number of options (currently not used)
}
```

**Only used for INCORRECT rounds** (`correct: false`).

---

## Frequency Distribution (Expected)

Over a typical session with 5 rounds and ~40% accuracy:

- 3 incorrect rounds per match (on average)
- Expected feedback distribution:
  - `RUSHED_DECISION`: 20–25%
  - `OVERTHOUGHT`: 15–20%
  - `MISSED_CONSTRAINT`: 10–15% (only when time expires)
  - `UNCHECKED_ASSUMPTION`: 15–20%
  - `MISREAD_STRUCTURE`: 30–35% (most common)
  - `SIGNAL_NOISE_CONFUSION`: 10–15% (alternates with MISREAD_STRUCTURE)
  - `LOCAL_OPTIMUM`: ~0% (no current heuristic assigns this)

**Note:** `LOCAL_OPTIMUM` is reserved for future enhancement (e.g., questions with multi-step optimization).

---

## Why This Heuristic Works

1. **No ML overhead** — Simple threshold comparisons
2. **Uses existing data** — responseTimeMs + timeToFirstCommitMs already collected
3. **Deterministic** — Same input = same output (reproducible)
4. **Interpretable** — Easy to explain why feedback was assigned
5. **Personalized** — Different players see different feedback based on their behavior
6. **Actionable** — Insights point to reasoning improvement, not content

---

## Edge Cases

### Case: No timeToFirstCommitMs
- Uses fallback heuristics based on total responseTimeMs
- Doesn't fail; always produces a tag

### Case: responseTimeMs exactly 30% or 80%
- Uses `<` and `>` operators, so edge cases flow to next heuristic
- Deterministic resolution

### Case: All incorrect rounds already have feedback
- Query filters for `feedbackTag: null`
- Doesn't re-assign; safe to re-run

### Case: Match has zero incorrect rounds
- No feedback rounds to assign
- Results page shows: "No feedback needed — accuracy was high."

---

## Future Improvements

### Phase 1.1: Calibration
- Track which heuristic assignments correlate with improvement
- Adjust time thresholds based on actual data
- Measure feedback effectiveness

### Phase 1.2: Context-Aware
- Different heuristics for different question types
- Difficulty-level adjustments (easy vs. hard questions)
- Per-player baseline (faster players get different thresholds)

### Phase 2: Adaptive
- Track player's historical response patterns
- Personalize heuristic thresholds
- Rotate insights to avoid repetition

---

## Testing

To test feedback assignment locally:

```typescript
import { assignFeedback, type RoundData } from '@/lib/feedback';
import { getFeedbackText } from '@/lib/feedbackMap';

const testRound: RoundData = {
  correct: false,
  responseTimeMs: 7000,
  timeExpired: false,
  roundDurationMs: 25000,
  timeToFirstCommitMs: 6500,
};

const tag = assignFeedback(testRound);
const text = getFeedbackText(tag);

console.log(`Tag: ${tag}`);
console.log(`Insight: ${text}`);
// Output: RUSHED_DECISION, "You prioritised speed before validating the structure."
```

---

## Summary

The Phase 1 heuristic uses **simple, deterministic rules** based on timing signals to assign exactly ONE structural insight per incorrect round. This keeps cognitive load low while giving actionable guidance for the next attempt.
