# NearMe AI

NearMe AI is a location-aware discovery app that helps users find nearby restaurants, cafes, spas, gyms, hotels, and more using AI-assisted search and Google Places data.

---

## Current Features

- AI search with natural language queries
- Category + vibe based discovery
- Current-location aware category routing
- Search filters, sorting, and live result refresh
- Place detail pages with gallery, reviews, and booking widget
- User authentication with email/password login
- **OTP email verification for signup**
- Account page with:
  - personal details
  - recommendation preferences
  - OTP-protected delete account flow
- User-specific persistent favorites:
  - save/remove favorites across home/search/place pages
  - favorites page loads from DB
  - if not logged in, user is redirected to login then favorite is saved after auth

---

## Tech Stack

- Next.js 15 (App Router)
- TypeScript + React 19
- Tailwind CSS + shadcn/ui
- SQLite (LibSQL client, local file at `data/nearme-auth.db`)
- OpenAI + Google Places APIs
- Nodemailer (OTP email delivery)

---

## Getting Started

### 1) Install

```bash
npm install
```

### 2) Environment variables

Create `.env` (or copy from `.env.example`) and set:

| Variable | Required | Purpose |
|---|---|---|
| `OPENAI_API_KEY` | Yes | AI query interpretation |
| `GOOGLE_API_KEY` | Yes | Places + reverse geocoding |
| `SMTP_HOST` | Yes (for OTP mail) | SMTP server host (e.g. `smtp.gmail.com`) |
| `SMTP_PORT` | Yes (for OTP mail) | SMTP port (e.g. `587`) |
| `SMTP_USER` | Yes (for OTP mail) | SMTP username/email |
| `SMTP_PASS` | Yes (for OTP mail) | SMTP password/app password |
| `SMTP_FROM` | Yes (for OTP mail) | Sender email |
| `SMTP_SECURE` | Optional | `true` for SSL port, else `false` |
| `NEXT_PUBLIC_APP_URL` | Optional | App base URL |

Notes:
- If SMTP is missing, OTP still works in fallback mode (OTP logs on server console in dev).
- `.env` and `data/*.db` are gitignored.

### 3) Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Auth + OTP Flows

### Signup
1. User submits name/email/password on `/signup`
2. Server sends OTP email
3. User verifies OTP
4. Account is created and session starts

### Delete account
1. User clicks "Send Delete OTP" on `/account`
2. OTP is sent to registered email
3. User enters OTP and confirms
4. Account + related data are deleted and session is cleared

---

## Database

Local SQLite file:

- `data/nearme-auth.db`

Main tables:

- `users`
- `sessions`
- `user_profiles`
- `user_preferences`
- `user_favorites`
- `signup_otps`
- `account_delete_otps`

---

## Useful Commands

```bash
# Run app
npm run dev

# Typecheck
npx tsc --noEmit

# Build
npm run build
```
