# Identity Lite - Quick Start Guide

## 🎯 What You Have Now

A complete zero-signup identity system with:
- ✅ Stable anonymous user identity (clientId in localStorage)
- ✅ Username + discriminator system (like Discord)
- ✅ 24-hour name change cooldown
- ✅ Profanity filtering and validation
- ✅ Production-ready for Vercel serverless
- ✅ No TypeScript errors (except test file needing npm install)

## 🚀 Next Steps to Deploy

### 1. Install Dependencies (if not already done)
```bash
npm install
```

### 2. Generate Prisma Client
```bash
npx prisma generate
```

### 3. Run Database Migration
```bash
# For production
npx prisma migrate deploy

# For development
npx prisma migrate dev
```

### 4. Test Locally
```bash
# Start dev server
npm run dev

# Visit http://localhost:3000/play
# - Should prompt for username
# - Submit a username
# - Verify you see "YourName#1234"

# Visit http://localhost:3000/leaderboard
# - Should show all users with discriminators
```

### 5. (Optional) Run Discriminator Test
```bash
# In another terminal while dev server is running
npx tsx tests/identity-discriminator.test.ts
```

Expected output:
```
✅ SUCCESS: All discriminators are unique!
```

### 6. Deploy to Vercel
```bash
git add .
git commit -m "feat: implement Identity Lite (Phase -1)"
git push
```

Vercel will automatically:
- Run `npm install`
- Run `npx prisma generate`
- Build Next.js app
- Deploy

### 7. Run Migration on Production Database
```bash
# After deployment, run migration against production DB
npx prisma migrate deploy --schema=./prisma/schema.prisma
```

Or use Vercel CLI:
```bash
vercel env pull .env.local
npx prisma migrate deploy
```

### 8. Verify Production
1. Visit your Vercel URL
2. Go to `/play`
3. Create a username
4. Check `/leaderboard`
5. Try changing your name
6. Wait or mock cooldown to test enforcement

## 📁 Files Overview

### New Files Created (13 files)
```
lib/
  identity.ts              # Client identity utils
  profanity.ts            # Profanity filter
  validation.ts           # Username validation

app/api/identity/
  upsert/route.ts         # Create/update user
  validate/route.ts       # Validate username

components/
  UsernameModal.tsx       # Username selection UI

prisma/migrations/
  20260130000000_add_identity_lite/
    migration.sql         # Database migration

tests/
  identity-discriminator.test.ts  # Uniqueness test

# Documentation
IDENTITY_LITE.md                  # Full documentation
DEPLOYMENT_IDENTITY_LITE.md       # Deployment guide  
IDENTITY_LITE_SUMMARY.md          # Implementation summary
IDENTITY_LITE_QUICKSTART.md       # This file
```

### Modified Files (3 files)
```
prisma/schema.prisma      # Added identity fields to User model
app/play/page.tsx         # Integrated identity system
app/leaderboard/page.tsx  # Show discriminators
```

## 🔧 Configuration

### Username Rules
- **Length:** 3-20 characters
- **Allowed:** Letters, numbers, spaces, underscores
- **Cooldown:** 24 hours between changes

To modify:
- Length limits: `lib/validation.ts`
- Cooldown: `app/api/identity/upsert/route.ts` (NAME_CHANGE_COOLDOWN_MS)
- Profanity list: `lib/profanity.ts`

## 🐛 Troubleshooting

### "Cannot find module '@prisma/client'"
```bash
npm install
npx prisma generate
```

### "clientId already exists"
User's localStorage has stale data. Clear browser localStorage or use incognito.

### Leaderboard shows null discriminators
Migration didn't run or didn't populate existing users. Re-run:
```bash
npx prisma migrate reset  # WARNING: Deletes all data!
npx prisma migrate dev
```

Or manually update:
```sql
UPDATE "User"
SET 
  "clientId" = 'legacy-' || "id",
  "displayName" = COALESCE("name", "email", 'Player'),
  "canonicalName" = LOWER(TRIM(COALESCE("name", "email", 'player'))),
  "discriminator" = (RANDOM() * 9999)::INTEGER
WHERE "clientId" IS NULL;
```

### Cooldown not working
Check server time matches database time. Verify `lastNameChangeAt` is being set:
```sql
SELECT "displayName", "lastNameChangeAt" 
FROM "User" 
ORDER BY "lastNameChangeAt" DESC 
LIMIT 10;
```

## 📊 Monitoring

### Key Database Queries

```sql
-- User count
SELECT COUNT(*) FROM "User";

-- Users created today
SELECT COUNT(*) FROM "User" 
WHERE "createdAt" > CURRENT_DATE;

-- Most popular names
SELECT "canonicalName", COUNT(*) as count
FROM "User"
GROUP BY "canonicalName"
ORDER BY count DESC
LIMIT 10;

-- Recent name changes
SELECT "displayName", "lastNameChangeAt"
FROM "User"
WHERE "lastNameChangeAt" IS NOT NULL
ORDER BY "lastNameChangeAt" DESC
LIMIT 20;
```

## ✅ Validation Checklist

Before considering deployment complete:

**Database:**
- [ ] Migration applied successfully
- [ ] All User records have clientId
- [ ] All User records have discriminator
- [ ] Unique constraints exist

**Functionality:**
- [ ] New users can create identity
- [ ] Username validation works
- [ ] Discriminators assigned correctly
- [ ] Leaderboard shows discriminators
- [ ] Name changes work
- [ ] Cooldown enforced

**Production:**
- [ ] No TypeScript errors (except test file)
- [ ] DATABASE_URL set in Vercel
- [ ] Build succeeds
- [ ] App loads without errors

## 🎓 Learn More

- **Full Documentation:** See `IDENTITY_LITE.md`
- **Deployment Guide:** See `DEPLOYMENT_IDENTITY_LITE.md`
- **Implementation Details:** See `IDENTITY_LITE_SUMMARY.md`

## 💡 Tips

1. **Test locally first** - Always run `npm run dev` and test before deploying
2. **Use Prisma Studio** - Run `npx prisma studio` to visually browse database
3. **Check Vercel logs** - If issues occur, check deployment logs in Vercel dashboard
4. **Monitor Prisma queries** - Set `log: ['query']` in `lib/prisma.ts` for debugging

## 🎉 Success!

If you've completed the steps above, Identity Lite is live! Users can now:
- Play without signing up
- Choose custom usernames
- See their unique tag (Name#1234)
- Change names (once per 24h)
- Appear on leaderboard with clear identity

**The foundation for Scio's user system is complete! 🚀**
