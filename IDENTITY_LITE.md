# Phase −1: Identity Lite

**Zero-signup stable identity system for Scio**

## Overview

Identity Lite provides stable user identity without requiring signup, authentication, or email verification. Users are identified by a client-generated UUID stored in localStorage, and can choose display names with automatic discriminators to prevent collisions.

## Features

✅ **Canonical username handling** - Trim, collapse whitespace, lowercase for uniqueness  
✅ **Client-side identity** - `clientId` in localStorage, no server-side sessions  
✅ **Server-side user upsert** - Automatic user creation/retrieval by clientId  
✅ **Discriminator system** - Username#1234 format like Discord to avoid name conflicts  
✅ **Username validation** - 3-20 chars, letters/numbers/spaces/underscores, profanity filter  
✅ **Name change cooldown** - 1 change per 24 hours  
✅ **Production-ready** - No in-memory state, works on Vercel serverless  
✅ **Leaderboard disambiguation** - All users show with discriminator (Name#1234)

## Architecture

### Client-Side (`lib/identity.ts`)

```typescript
getOrCreateClientId()      // Generate/retrieve stable UUID
getStoredUsername()         // Get cached username
setStoredUsername()         // Cache username locally
canonicalizeUsername()      // Normalize for uniqueness checks
formatUserTag()             // Format as "Name#1234"
```

### Database Schema

```prisma
model User {
  clientId         String    @unique          // Anonymous UUID
  displayName      String                     // User's chosen name (preserves casing)
  canonicalName    String                     // Lowercase normalized name
  discriminator    Int                        // 0-9999 for disambiguation
  lastNameChangeAt DateTime?                  // For cooldown enforcement
  banned           Boolean   @default(false)
  
  @@unique([canonicalName, discriminator])
  @@index([canonicalName])
}
```

### API Routes

#### `POST /api/identity/upsert`
Create or update user identity.

**Request:**
```json
{
  "clientId": "uuid-string",
  "desiredName": "MyUsername"  // optional
}
```

**Response:**
```json
{
  "ok": true,
  "user": {
    "id": "...",
    "clientId": "...",
    "displayName": "MyUsername",
    "canonicalName": "myusername",
    "discriminator": 1234,
    "tag": "MyUsername#1234"
  },
  "cooldownEndsAt": "2026-01-31T12:00:00Z"  // if cooldown active
}
```

**Behavior:**
- If user exists with clientId:
  - No desiredName → return current identity
  - With desiredName → validate cooldown, validate name, update
- If user doesn't exist:
  - No desiredName → create with "Player"
  - With desiredName → validate, create

#### `POST /api/identity/validate`
Validate username without creating/updating user (for real-time UI feedback).

**Request:**
```json
{
  "desiredName": "MyUsername"
}
```

**Response:**
```json
{
  "ok": true
}
// or
{
  "ok": false,
  "reason": "Username must be at least 3 characters"
}
```

## Username Rules

- **Length:** 3-20 characters
- **Allowed:** Letters, numbers, spaces, underscores
- **Profanity:** Blocked via built-in list (`lib/profanity.ts`)
- **Uniqueness:** Handled by discriminator system (0-9999)
- **Cooldown:** 24 hours between name changes

## Discriminator Assignment

When a user chooses a name:

1. Canonicalize the name (trim, collapse spaces, lowercase)
2. Query for all existing users with that canonical name
3. Find available discriminator (0-9999):
   - Try random selection (20 attempts)
   - Fallback to sequential search
4. Assign discriminator and create/update user

**Example:**
- "John Smith" → canonical: "john smith"
- First user: `John Smith#0000`
- Second user: `John Smith#5432`
- Third user: `john smith#0783` (different casing, same canonical)

## UI Components

### `UsernameModal`
Modal component for username selection/changes.

**Features:**
- Real-time validation with 500ms debounce
- Cooldown timer display
- Error handling
- Auto-dismisses on success

**Usage:**
```tsx
<UsernameModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onSuccess={(username, discriminator) => {
    // Handle success
  }}
  currentUsername={username}
  cooldownEndsAt={cooldownIso}
/>
```

### Play Page Integration

- Auto-initializes identity on page load
- Shows modal if no username set or if assigned "Player"
- Displays user tag with "change" link
- Blocks gameplay if identity not established

## Migration

Run the migration to add Identity Lite fields to existing database:

```bash
npx prisma migrate deploy
```

Or manually run:
```bash
npx prisma migrate dev
```

The migration handles existing users by:
- Generating legacy clientIds (`legacy-{userId}`)
- Using existing name/email as displayName
- Assigning random discriminators
- Preserving all existing data

## Testing

Test discriminator uniqueness with 20 concurrent users:

```bash
npm run dev  # Start server first
npx tsx tests/identity-discriminator.test.ts
```

This creates 20 users with identical names and verifies all get unique discriminators.

## Production Deployment

✅ **Serverless-safe:** No in-memory state, all data in database  
✅ **Connection pooling:** Uses Prisma singleton pattern  
✅ **Error handling:** Graceful fallbacks for network issues  
✅ **Client-side guards:** All localStorage calls wrapped in `typeof window` checks  

### Vercel Configuration

No special configuration needed. The system:
- Uses DATABASE_URL from environment
- Generates Prisma client at build time (`prisma generate`)
- Works across serverless function invocations

## Security Considerations

- **clientId validation:** Basic string validation (non-empty)
- **Rate limiting:** Not implemented (add via middleware if needed)
- **Profanity filter:** Basic built-in list (expand as needed)
- **Banned users:** Boolean flag in schema (enforcement in API routes)

## Future Enhancements

- [ ] Rate limiting for name changes
- [ ] Enhanced profanity filtering (external API)
- [ ] Username reservation system
- [ ] Profile customization (avatar, bio)
- [ ] Username history/audit log
- [ ] Admin panel for moderation

## Files Changed

### Created
- `lib/identity.ts` - Client identity utilities
- `lib/profanity.ts` - Profanity filter
- `lib/validation.ts` - Username validation
- `app/api/identity/upsert/route.ts` - User upsert endpoint
- `app/api/identity/validate/route.ts` - Username validation endpoint
- `components/UsernameModal.tsx` - Username selection UI
- `tests/identity-discriminator.test.ts` - Discriminator uniqueness test
- `prisma/migrations/.../migration.sql` - Database migration

### Modified
- `prisma/schema.prisma` - Added identity fields to User model
- `app/play/page.tsx` - Integrated identity system
- `app/leaderboard/page.tsx` - Show discriminators for all users

## Questions?

This implementation provides a production-ready, zero-signup identity system that scales on serverless infrastructure. All usernames are disambiguated, validation is enforced, and cooldowns prevent abuse.
