# Identity Lite Deployment Guide

## Pre-Deployment Checklist

### 1. Database Migration

Run the Prisma migration to add Identity Lite fields:

```bash
npx prisma migrate deploy
```

Or for development:

```bash
npx prisma migrate dev
```

The migration will:
- Add new fields to User model (clientId, displayName, canonicalName, discriminator, etc.)
- Populate existing users with default values
- Create necessary indexes

### 2. Generate Prisma Client

Ensure Prisma client is generated:

```bash
npx prisma generate
```

This is automatically run during `npm run build` on Vercel.

### 3. Verify Environment Variables

Ensure `DATABASE_URL` is set in Vercel environment variables:

```
DATABASE_URL=postgresql://...
```

## Deployment Steps

### Option 1: Deploy to Vercel (Recommended)

```bash
# Commit all changes
git add .
git commit -m "feat: implement Identity Lite (Phase -1)"
git push

# Vercel will auto-deploy if connected
# Or manually deploy:
vercel --prod
```

### Option 2: Manual Build & Deploy

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Build Next.js app
npm run build

# Start production server
npm start
```

## Post-Deployment Verification

### 1. Test Identity Creation

Visit `/play` and verify:
- [ ] Page loads without errors
- [ ] Username modal appears for new users
- [ ] Can enter and submit username
- [ ] Username is validated in real-time
- [ ] User tag appears after creation (e.g., "Alex#1234")

### 2. Test Leaderboard

Visit `/leaderboard` and verify:
- [ ] All users show with discriminators (Name#1234)
- [ ] No duplicate names without discriminators
- [ ] Page loads without errors

### 3. Test Name Changes

As an existing user:
- [ ] Click "change" link on play page
- [ ] Modal opens with current username
- [ ] Can submit new username
- [ ] Cooldown enforced after first change
- [ ] Cooldown timer displays correctly

### 4. Test Validation

Try creating usernames that should fail:
- [ ] Empty username → Error
- [ ] Too short (< 3 chars) → Error
- [ ] Too long (> 20 chars) → Error
- [ ] Invalid characters → Error
- [ ] Profane words → Error

### 5. Test Discriminator Uniqueness

Run the test script (requires dev server):

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run test
npx tsx tests/identity-discriminator.test.ts
```

Expected output:
```
✅ SUCCESS: All discriminators are unique!
```

## Database Verification

### Check User Table Structure

```sql
SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'User';
```

Should show new columns:
- clientId (text, not null)
- displayName (text, not null)
- canonicalName (text, not null)
- discriminator (integer, not null)
- lastNameChangeAt (timestamp, nullable)
- banned (boolean, not null)

### Check Indexes

```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'User';
```

Should include:
- `User_clientId_key` (unique)
- `User_canonicalName_discriminator_key` (unique)
- `User_canonicalName_idx`

## Rollback Plan

If issues occur, rollback by:

### 1. Revert Code Changes

```bash
git revert HEAD
git push
```

### 2. Rollback Database (if needed)

```bash
# Identify current migration
npx prisma migrate status

# Rollback to previous migration
# Note: Prisma doesn't have built-in rollback, so manual SQL is needed
```

Manual rollback SQL:
```sql
-- Drop indexes
DROP INDEX IF EXISTS "User_clientId_key";
DROP INDEX IF EXISTS "User_canonicalName_discriminator_key";
DROP INDEX IF EXISTS "User_canonicalName_idx";

-- Drop columns
ALTER TABLE "User" DROP COLUMN IF EXISTS "clientId";
ALTER TABLE "User" DROP COLUMN IF EXISTS "displayName";
ALTER TABLE "User" DROP COLUMN IF EXISTS "canonicalName";
ALTER TABLE "User" DROP COLUMN IF EXISTS "discriminator";
ALTER TABLE "User" DROP COLUMN IF EXISTS "lastNameChangeAt";
ALTER TABLE "User" DROP COLUMN IF EXISTS "banned";
```

## Monitoring

### Key Metrics to Track

1. **User Creation Rate**
   - Monitor new users being created
   - Check for spam/abuse patterns

2. **Name Changes**
   - Track name change frequency
   - Monitor cooldown bypass attempts

3. **Discriminator Exhaustion**
   - Alert if any canonical name reaches 9000+ discriminators
   - Indicates potential issues or very popular names

4. **API Errors**
   - Monitor `/api/identity/upsert` error rate
   - Monitor `/api/identity/validate` response times

### Recommended Monitoring Queries

```sql
-- Users created in last 24h
SELECT COUNT(*) 
FROM "User" 
WHERE "createdAt" > NOW() - INTERVAL '24 hours';

-- Users who changed names in last 24h
SELECT COUNT(*) 
FROM "User" 
WHERE "lastNameChangeAt" > NOW() - INTERVAL '24 hours';

-- Most popular canonical names
SELECT "canonicalName", COUNT(*) as count
FROM "User"
GROUP BY "canonicalName"
ORDER BY count DESC
LIMIT 10;

-- Discriminator usage for popular names
SELECT "canonicalName", COUNT(*) as total_discriminators
FROM "User"
WHERE "canonicalName" IN (
  SELECT "canonicalName"
  FROM "User"
  GROUP BY "canonicalName"
  HAVING COUNT(*) > 100
)
GROUP BY "canonicalName";
```

## Troubleshooting

### Issue: "clientId already exists" error

**Cause:** User tried to create account with duplicate clientId  
**Fix:** Clear localStorage and try again, or use new browser

### Issue: "All discriminators taken" error

**Cause:** A canonical name has 10,000 users (0-9999)  
**Fix:** Very unlikely but if it happens, suggest alternative name to user

### Issue: Cooldown not working

**Cause:** System clock issues or database time mismatch  
**Fix:** Verify server timezone matches database timezone

### Issue: Leaderboard shows null discriminators

**Cause:** Legacy users not migrated properly  
**Fix:** Run migration again or manually update users:

```sql
UPDATE "User"
SET 
  "clientId" = 'legacy-' || "id",
  "displayName" = COALESCE("name", "email", 'Player'),
  "canonicalName" = LOWER(TRIM(COALESCE("name", "email", 'player'))),
  "discriminator" = (RANDOM() * 9999)::INTEGER
WHERE "clientId" IS NULL;
```

## Performance Optimization

### Database Indexes

All necessary indexes are created by migration. Monitor query performance:

```sql
-- Check slow queries
SELECT 
  query,
  calls,
  mean_exec_time
FROM pg_stat_statements
WHERE query LIKE '%User%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Caching (Future Enhancement)

Consider adding Redis cache for:
- Username availability checks
- Recent discriminator allocations
- Cooldown status

## Security Considerations

### Current Protections

✅ Input validation (length, characters)  
✅ Profanity filtering  
✅ Cooldown enforcement (24h)  
✅ Unique constraints (prevent duplicates)

### Future Enhancements

- [ ] Rate limiting (prevent spam)
- [ ] IP-based restrictions
- [ ] Enhanced profanity filter (ML-based)
- [ ] Ban system enforcement at API level
- [ ] Audit logging for name changes

## Success Criteria

✅ All new users get stable identity without signup  
✅ Usernames are unique via discriminator system  
✅ Name changes work with cooldown enforcement  
✅ Leaderboard shows all users with discriminators  
✅ No TypeScript errors  
✅ No database constraint violations  
✅ System works on Vercel serverless  

## Support

For issues or questions:
1. Check logs in Vercel dashboard
2. Review Prisma query logs
3. Test locally with `npm run dev`
4. Verify database state with SQL queries above
