# Phase 0 Testing Guide

## Quick Start

### Run the Development Server
```bash
npm run dev
```

### Test the Core Flow

1. **Navigate to Play**
   - Go to `http://localhost:3000/play`
   - Click "Play vs Bot"

2. **Test Forced Commitment**
   - ✅ Click any option → should lock instantly (no confirm button)
   - ✅ Try clicking another option → should be disabled
   - ✅ Should show visual feedback (green if correct, red if incorrect)

3. **Test Timer Expiry (No Selection)**
   - ✅ Wait for timer to hit 0 without clicking
   - ✅ Should auto-advance after ~600ms
   - ✅ Round should be marked as wrong with `timeExpired: true`

4. **Test Timer Expiry (With Selection)**
   - ✅ Click an option
   - ✅ Should lock and finalize immediately
   - ✅ Timer should stop

5. **Test Auto-Advance**
   - ✅ After each round, wait ~600ms
   - ✅ Should automatically load next round
   - ✅ No manual "Next" button needed

6. **Test Last Round**
   - ✅ On round 5, after selection and submission
   - ✅ Should navigate to `/match/[matchId]/results`

7. **Test Results Page**
   - ✅ Should show win/loss/draw
   - ✅ Should display performance metrics:
     - Accuracy %
     - Avg response time
     - Efficiency score
     - Time usage
   - ✅ Should show performance label:
     - "Fast but inaccurate"
     - "Accurate but slow"
     - "Balanced"
   - ✅ Should show explanation text
   - ✅ Should show round-by-round breakdown

8. **Test Play Again**
   - ✅ Click "Play Again" on results page
   - ✅ Should start new match seamlessly

## Edge Cases to Test

### Network Errors
- Disconnect network after clicking option
- Should show retry button
- Click retry → should resubmit

### Race Conditions
- Try rapid clicking before lock
- Should only finalize once
- `finalizedRef` prevents double-submission

### Timer Edge Cases
- Click option with 1s remaining
- Timer should stop immediately
- Should not trigger timeout

## Expected Behaviors

### Timing Metrics
- **Response time**: Time from round start to commit
- **First commit time**: Time to first click (even if changed before finalize)
- **Time expired**: True only if timer hits 0 with no selection

### Performance Labels

#### "Accurate but slow"
- Accuracy >= 70%
- Avg time remaining < 35%
- Example: 4/5 correct, avg 20s per question (out of 25s)

#### "Fast but inaccurate"
- Accuracy < 55%
- Avg time remaining >= 45%
- Example: 2/5 correct, avg 10s per question

#### "Balanced"
- All other combinations
- Example: 3/5 correct, avg 15s per question

## API Endpoints Used

### Round Submission
```
POST /api/round/submit
Body: {
  clientId, matchId, roundIndex, questionId,
  selectedOption, correct, responseTimeMs,
  timeToFirstCommitMs, timeExpired
}
```

### Match Complete
```
POST /api/match/complete
Body: { clientId, matchId, resultA }
```

### Match Summary
```
GET /api/match/[matchId]/summary
Returns: {
  matchId, scores, winner, rounds[],
  metrics: { accuracy, avgResponseTime, efficiency, label, explanation }
}
```

## Development Tips

### Check Round Logs
```sql
SELECT * FROM "Round" 
WHERE "matchId" = 'your-match-id'
ORDER BY "roundIndex";
```

### Check Metrics
```javascript
// In browser console after results page loads
fetch('/api/match/YOUR_MATCH_ID/summary')
  .then(r => r.json())
  .then(console.log)
```

### Debug Timer Issues
```javascript
// Add to match page component
useEffect(() => {
  console.log('Timer:', {
    remaining: timeRemainingMs,
    locked: isLocked,
    finalized: finalizedRef.current
  });
}, [timeRemainingMs, isLocked]);
```

## Common Issues & Solutions

### Issue: Double submission
- **Cause**: `finalizedRef` not set early enough
- **Solution**: Already fixed - set `finalizedRef = true` before async call

### Issue: Timer doesn't stop on click
- **Cause**: Timer interval not cleared
- **Solution**: Already fixed - clear `timerIntervalRef` on commit

### Issue: Results page not loading
- **Cause**: Navigation happens before match complete
- **Solution**: Already fixed - await complete call before navigation

### Issue: Wrong metrics
- **Cause**: Using wrong duration or incorrect formula
- **Solution**: Verify `roundDurationMs = 25000` and formula in metrics.ts

## Success Criteria

✅ All rounds complete without manual buttons
✅ Timer pressure is felt but not frustrating
✅ Immediate feedback on correctness
✅ Performance label is accurate and helpful
✅ No console errors or race conditions
✅ Works reliably on Vercel serverless

---

**Ready to ship once all tests pass!**
