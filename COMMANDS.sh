#!/bin/bash
# Bot Matchmaking Fix - Quick Command Reference
# Run these commands to build, test, and deploy

# ============================================================================
# DEVELOPMENT & LOCAL TESTING
# ============================================================================

# 1. Setup local environment
npm install
npx prisma generate
npm run prisma:seed

# 2. Start dev server (port 3000)
npm run dev

# 3. Open in browser
# http://localhost:3000/play

# 4. Run automated tests (in separate terminal, requires dev server)
npx tsx tests/bot-match-start.test.ts

# ============================================================================
# LINTING & TYPE CHECKING
# ============================================================================

# Check for TypeScript errors
npm run build

# Lint code
npm run lint

# ============================================================================
# PRODUCTION DEPLOYMENT
# ============================================================================

# 1. Build production bundle
npm run build

# 2. Test production build locally (if needed)
npm start

# 3. Deploy to Vercel (auto on merge to main)
# git push origin main
# Vercel auto-builds and deploys

# 4. Check Vercel logs
vercel logs --tail

# ============================================================================
# PRISMA COMMANDS
# ============================================================================

# Generate Prisma client
npx prisma generate

# Run database migrations (if needed)
npx prisma migrate dev --name <migration_name>

# Seed database with questions
npm run prisma:seed

# View database via Prisma Studio
npx prisma studio

# ============================================================================
# DATABASE & DEBUGGING
# ============================================================================

# Connect to SQLite database
sqlite3 ./dev.db

# Find match for user
# SELECT * FROM Match WHERE playerAId = '<clientId>' ORDER BY createdAt DESC LIMIT 5;

# Check match rounds
# SELECT * FROM MatchRound WHERE matchId = '<matchId>' ORDER BY roundIndex;

# Count questions
# SELECT COUNT(*) FROM Question;

# Find error by requestId in logs
grep "<requestId>" server_logs.txt | head -20

# ============================================================================
# VERIFICATION COMMANDS (Post-Deployment)
# ============================================================================

# Verify build
npm run build 2>&1 | grep -E "error|Error" && echo "BUILD FAILED" || echo "BUILD OK"

# Verify dev server starts
timeout 5 npm run dev > /dev/null 2>&1 && echo "DEV SERVER OK" || echo "DEV SERVER FAILED"

# Verify no missing packages
npm audit

# Check for TypeScript issues
npx tsc --noEmit

# ============================================================================
# QUICK TEST SCENARIOS
# ============================================================================

# Test 1: New user can start match
curl -X POST http://localhost:3000/api/match/bot/start \
  -H "Content-Type: application/json" \
  -d '{"clientId":"test-'$(date +%s)'","username":"testuser"}' | jq .

# Test 2: Verify idempotency (same clientId)
CLIENT_ID="test-idem-$(date +%s)"
curl -X POST http://localhost:3000/api/match/bot/start \
  -H "Content-Type: application/json" \
  -d '{"clientId":"'$CLIENT_ID'","username":"user1"}' | jq .matchId > /tmp/match1.txt

curl -X POST http://localhost:3000/api/match/bot/start \
  -H "Content-Type: application/json" \
  -d '{"clientId":"'$CLIENT_ID'","username":"user1"}' | jq .matchId > /tmp/match2.txt

diff /tmp/match1.txt /tmp/match2.txt && echo "IDEMPOTENCY OK" || echo "IDEMPOTENCY FAILED"

# Test 3: Missing questions error
# (After deleting all questions from DB)
curl -X POST http://localhost:3000/api/match/bot/start \
  -H "Content-Type: application/json" \
  -d '{"clientId":"test-noq","username":"user"}' | jq '.error.code'

# Test 4: Invalid request (missing clientId)
curl -X POST http://localhost:3000/api/match/bot/start \
  -H "Content-Type: application/json" \
  -d '{"username":"user"}' | jq '.error.code'

# ============================================================================
# PERFORMANCE MONITORING
# ============================================================================

# Install autocannon for load testing (optional)
npm install --save-dev autocannon

# Run load test (100 connections, 10 seconds)
npx autocannon -c 100 -d 10 http://localhost:3000/api/match/bot/start

# Measure p50/p95/p99 response times
npx autocannon -c 10 -d 5 --requests '{"method":"POST","path":"/api/match/bot/start","body":"{\"clientId\":\"test\",\"username\":\"user\"}","headers":{"content-type":"application/json"}}' http://localhost:3000

# ============================================================================
# LOG ANALYSIS
# ============================================================================

# Extract logs for specific requestId
REQUEST_ID="a1b2c3d4"
grep "\[$REQUEST_ID\]" server.log

# Count errors by type
grep "error" server.log | grep -o '"code":"[^"]*"' | sort | uniq -c | sort -rn

# Track retry rate
grep "Retry attempt" browser.log | wc -l

# Find timeout requests
grep "durationMs" server.log | awk -F'durationMs": ' '{print $2}' | awk -F',' '{print $1}' | awk '$1 > 1000 {print}'

# ============================================================================
# ENVIRONMENT SETUP
# ============================================================================

# Create .env if needed
cat > .env << EOF
DATABASE_URL="file:./dev.db"
NODE_ENV="development"
NEXT_PUBLIC_API_URL=""
EOF

# Pull environment from Vercel
vercel env pull

# ============================================================================
# GIT COMMANDS
# ============================================================================

# View changes in this fix
git diff main app/api/match/bot/start/route.ts
git diff main app/play/page.tsx

# Create feature branch
git checkout -b fix/bot-matchmaking

# Commit changes
git add -A
git commit -m "fix: bot matchmaking - idempotency, retry, logging"

# Push to origin
git push origin fix/bot-matchmaking

# Create PR (on GitHub)
# https://github.com/.../compare/main...fix/bot-matchmaking

# Merge to main (after review)
git checkout main
git pull origin main
git merge fix/bot-matchmaking
git push origin main

# ============================================================================
# ROLLBACK (if needed)
# ============================================================================

# Find commit hash
git log --oneline | head -5

# Revert last commit
git revert HEAD

# Revert to specific commit
git revert <commit-hash>

# Force push (use with caution)
git reset --hard <commit-hash>
git push origin main --force

# ============================================================================
# CLEANUP
# ============================================================================

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Prisma cache
rm -rf node_modules/.prisma

# Reset database (WARNING: loses all data)
rm dev.db
npm run prisma:seed

# ============================================================================
# MONITORING & ALERTS (Production)
# ============================================================================

# Watch production logs in real-time
vercel logs --tail

# Filter logs by error
vercel logs --tail | grep "error"

# Search logs for specific requestId
vercel logs --tail | grep "<requestId>"

# Check error rate
vercel logs --tail | grep "ERROR" | wc -l

# Monitor response times
vercel logs --tail | grep "durationMs"

# ============================================================================
# REFERENCES
# ============================================================================

# Documentation files to review:
# - BOT_MATCHMAKING_FIX.md (comprehensive guide)
# - BOT_MATCHMAKING_QUICK_REF.md (quick reference)
# - IMPLEMENTATION_SUMMARY.md (technical details)
# - EXACT_CHANGES.md (full diffs)

# Error codes:
# - INVALID_REQUEST: Missing clientId or username
# - NO_QUESTIONS: DB has less than 5 questions
# - INTERNAL_ERROR: Unexpected server error

# Success response:
# { "matchId": "uuid", "requestId": "uuid" }

# Error response:
# { "error": { "code": "ERROR_CODE", "message": "...", "requestId": "uuid" } }
