# Scio v1.0 Quick Start Guide

## Setup

### 1. Install Dependencies
```bash
npm install
```
(No new dependencies added; existing stack is sufficient.)

### 2. Set Environment Variables
Create `.env.local` in project root:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## Testing Flows

### Test 1: Free User Flow
1. Go to [http://localhost:3000/drills](http://localhost:3000/drills)
2. Click on any drill (e.g., "The Tariff Gamble")
3. Read the prompt on the prep screen
4. Click "Start Drill"
5. Write a response (aim for 60–160 words; watch the word count bar)
6. Submit when ready
7. ✅ Should see "Nice—submitted" confirmation (no critique shown)
8. Click "Upgrade to Pro" CTA
9. See pricing page

### Test 2: Pro User Flow
1. Go to [http://localhost:3000/pricing](http://localhost:3000/pricing)
2. Click "Upgrade to Pro" (mocked — sets `plan: 'pro'` in localStorage)
3. Go back to [http://localhost:3000/drills](http://localhost:3000/drills)
4. Complete another drill
5. ✅ Results page should show "Get Adversarial Critique" button
6. Click "Request Critique"
7. ✅ Wait for OpenAI response (10–15 seconds)
8. See critique with:
   - Weak points
   - Strong points
   - Rewrite challenge
   - Independence Score (overall + 6 sub-scores)
   - Weakness tags

### Test 3: AI-Likelihood Block
1. Start a drill and write a response that triggers the AI detector
   - Try repeating phrases 20+ times
   - Use generic filler phrases ("Furthermore, in conclusion, for instance")
   - Keep sentence structure very uniform
2. ✅ Should see "rewrite_required" message
3. Rewrite with natural language → should accept

### Test 4: Progress Dashboard (Pro)
1. Complete 2–3 drills as a pro user
2. Request critique for each
3. Go to [http://localhost:3000/progress](http://localhost:3000/progress)
4. ✅ Should see:
   - 7-day and 30-day average scores
   - Trend chart (bar chart with heights)
   - Recent attempts list with scores

### Test 5: Downgrade to Free
1. Go to [http://localhost:3000/account/billing](http://localhost:3000/account/billing)
2. Click "Downgrade to Free"
3. Go back to a results page
4. ✅ Should see "Unlock detailed critique" CTA instead of critique

---

## Key Interactions

### Timer & Word Count Constraints
- Timer starts immediately on "Start Drill"
- Timer counts down; stops at 0 seconds
- Word count bar:
  - **Green** when 60–160 words
  - **Red** when outside range
- Submit disabled if not in range or text is empty

### AI-Likelihood Check
- Runs server-side on submit
- Heuristic: Text length, word repetition, sentence regularity, filler phrases, punctuation balance
- Threshold: 0.20 (20%)
- Message: "This response shows signs of external generation. Scio is for independent thinking. Rewrite in your own words."

### Critique Generation
- Calls OpenAI with system prompt: "You are an adversarial evaluator"
- Returns JSON with weakPoints, strongPoints, rewriteChallenge, scores, tags
- Takes 10–20 seconds (test with shorter responses first)

---

## localStorage Inspection (Dev Tools)

**Open DevTools → Application → Local Storage → http://localhost:3000**

Keys to check:
- `scio_user` → Current user object with `plan` field
- `scio_drills` → Array of available drills
- `scio_attempts` → Array of user's submitted attempts
- `scio_critiques` → Array of generated critiques

---

## Troubleshooting

### OpenAI API Error
**Symptom**: "Missing OPENAI_API_KEY" on critique request
**Fix**: Ensure `.env.local` has valid OpenAI key; restart dev server

### Critique Takes Forever
**Symptom**: Spinning "Generating Critique..." for >30 seconds
**Fix**: Check network tab (DevTools → Network). If stuck, the OpenAI API may be slow. Try shorter response text.

### Word Count Not Updating
**Symptom**: Word count bar stuck
**Fix**: Page may have cached. Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

### Pro Features Not Showing
**Symptom**: Can't access /progress or see critique button
**Fix**: 
1. Clear localStorage: DevTools → Application → Local Storage → Delete `scio_user`
2. Go to /pricing and click "Upgrade to Pro"
3. Refresh page

---

## Next Steps After Launch

### Immediate (Week 1–2)
- Monitor OpenAI API usage and costs
- Gather feedback on critique quality
- Track conversion (free → pro upgrade clicks)

### Short-term (Month 1)
- Replace localStorage with real database
- Add user authentication
- Expand drill content (20+ drills by category)

### Medium-term (Month 2–3)
- Integrate Stripe for real payments
- Implement better AI-likelihood detector
- Add analytics dashboard (drill completion rate, avg score, etc.)

---

## Contact & Support

- **Bug reports**: Check GitHub Issues
- **Feature requests**: Submit in Discussions
- **Billing questions**: support@scio.io

---

**Happy shipping! 🚀**
