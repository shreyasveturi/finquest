# Auth Setup (Email via Resend SMTP)

This project uses NextAuth (App Router) with Email magic links only (Resend SMTP).

## Required env vars
Set these in `.env` or your deployment environment:
- NEXTAUTH_URL
- NEXTAUTH_SECRET
- EMAIL_SERVER_HOST
- EMAIL_SERVER_PORT
- EMAIL_SERVER_USER
- EMAIL_SERVER_PASSWORD
- EMAIL_FROM

## Email magic links (SMTP)
- Uses Resend SMTP (EMAIL_SERVER_HOST=smtp.resend.com, EMAIL_SERVER_USER=resend, EMAIL_SERVER_PASSWORD=Resend API key).
- `EMAIL_FROM` should be a verified sender in Resend.
- These env vars are required; sign-in will fail without them.

## Local testing
1) Add all env vars (use `http://localhost:3000` for NEXTAUTH_URL).
2) Run `npm run dev`.
3) Visit `/account`:
   - Enter an email and send link → you should receive a magic link; clicking it signs you in and returns you to `/play`.
4) When signed in, `/account` shows your profile, rating, tier, and matches played.
5) On Vercel, set NEXTAUTH_URL to the deployed domain and redeploy after env changes.

## Defaults
- New users start at rating 1200 with tier auto-derived (Bronze < 1150, Silver 1150–1350, Gold 1350–1550, Platinum 1550+).
- Session page is `/account`; unauthenticated users hitting `/play` are redirected there.
