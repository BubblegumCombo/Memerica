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

More detailed setup (environment variables for Supabase and AWS) is documented as those phases land.
