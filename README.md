# Memerica

**Freedom of the Feed** — a tagged meme-sharing app for one shared space, shipped as an installable PWA (web · Android · iOS).

## What it is

- An **admin** uploads or composes memes, tags each post, assigns tags to members, and publishes (Draft → Published).
- A **member**'s feed shows published posts whose tags match the tags the admin gave them. Members swipe, **like** (blue) / **dislike** (red), and comment. Members never see or manage tags.

## Stack

- **Next.js** (App Router) + **React** + **TypeScript**, **Tailwind CSS** — deployed on **Vercel**
- **Supabase** — auth, Postgres, RLS, realtime
- **AWS S3 + CloudFront** — image upload & delivery (presigned uploads)
- Installable **PWA** — Serwist service worker + web manifest

## Repository

- `design-handoff/` — the authoritative design source exported from Claude Design (the spec this app is built to).
- App source is added in `app/`, `components/`, and `lib/` (see the implementation plan).

## Status

Greenfield. Built frontend-first on seed data, then wired to Supabase + S3 behind a single data-access interface.

## Development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and fill in your own values. The app runs entirely on **seed data** until Supabase env vars are set — no credentials are assumed or required for local development.

## Backend setup (Supabase — Phase 3)

The schema lives in `supabase/migrations/`. To stand up a backend on a **new, dedicated** Supabase project:

1. Create a fresh Supabase project for Memerica (don't reuse another project).
2. Apply, in order (SQL editor or the Supabase CLI): `supabase/migrations/0001_init.sql`, `supabase/migrations/0002_rls.sql`, then `supabase/seed.sql`.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.
4. In Supabase Auth, enable **Email** (magic link) and **Google**; set the redirect URL to `<app-origin>/auth/callback`.
5. Sign in once, then bootstrap yourself as admin using the snippet at the top of `supabase/seed.sql`.
6. Regenerate types: `supabase gen types typescript --project-id <id> > lib/database.types.ts`.

Auth (login, callback, sign-out), session middleware, and RLS are already wired and guard themselves when env is absent. The remaining live step is swapping `lib/data/store.tsx` from the seed source to Supabase queries behind the same interface.
