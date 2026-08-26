# i love physics

i love physics is an interactive, cinematic way into physics. Each topic pairs a live Canvas 2D simulation with real mathematics rendered in KaTeX, so you can feel a concept — steer an orbit, drag a pendulum into chaos, widen a fringe pattern — while the governing equations sit beside it. Built for curiosity: no accounts, no setup, just physics you can touch.

## Stack

- **Next.js 16** (App Router) + **React 19**, TypeScript strict
- **Tailwind CSS v4** (`@tailwindcss/postcss`) with CSS-variable theming and dark mode
- **KaTeX** for typeset equations
- System font stacks only; zero client-side data dependencies

## Scripts

| Command         | What it does                    |
| --------------- | ------------------------------- |
| `npm run dev`   | Start the dev server            |
| `npm run build` | Production build                |
| `npm run start` | Serve the production build      |
| `npm run lint`  | Run ESLint across the project   |

## Architecture

```
src/
├── lib/                  Topic registry, shared types, simulation helpers
├── components/
│   ├── sim/              SimFrame: canvas engine, rAF loop, resize + DPR handling
│   ├── math/             KaTeX rendering primitives
│   ├── labs/             Self-contained client components embedding SimFrame
│   ├── layout/           SiteHeader, ThemeToggle, SiteFooter
│   ├── explore/          Browse/filter UI for the topic catalog
│   └── home/             Landing-page hero and topic cards
└── app/
    ├── page.tsx          Home
    ├── explore/, about/  Catalog and about pages
    └── topics/[slug]/    Topic detail pages driven by src/lib/topics.ts
```

Labs are self-contained `"use client"` components that embed `SimFrame` and own their own state, controls, and equations — dropping one into any route is a single import.

## Deploy (Vercel + Supabase)

1. Create a [Supabase](https://supabase.com) project (free tier is enough).
2. Open the SQL editor and run `supabase/migrations/0001_init.sql` — this creates
   every table, RLS policy, trigger, and the ten seeded content proposals.
3. In the Supabase dashboard copy the project URL and anon key.
4. Import `github.com/rkd0608/i-love-physics` into Vercel — the Next.js preset
   is detected automatically. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy. Email/password auth works with the default provider; enable OAuth
   providers (Google, GitHub) in Supabase Auth settings if desired and the
   sign-in buttons activate.

Local development:

```
cp .env.example .env.local   # paste your URL + anon key
npm install
npm run dev
```

Without env vars the site still builds and runs fully — all community features
(auth, library, collections, voting) render their signed-out states.
