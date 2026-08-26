<div align="center">

<img src="src/app/icon.svg" width="72" alt="i love physics — a heart-shaped orbit with a particle riding the upper lobe" />

# i love physics

**Cinematic physics you can grab.** 34 interactive simulations, living equations, and a growing glossary — from Newton’s orbits to the logistic map.

[![Live Site](https://img.shields.io/badge/live-i--love--physics.vercel.app-53d6f2?style=for-the-badge&logo=vercel)](https://i-love-physics.vercel.app)
[![Topics](https://img.shields.io/badge/simulations-34-b48cf2?style=for-the-badge)](#the-collection)
[![Glossary](https://img.shields.io/badge/glossary-90%20terms-ffd27a?style=for-the-badge)](https://i-love-physics.vercel.app/glossary)

*Every slider rewrites the equation. Every equation drives the simulation.*

</div>

---

## ✨ What makes it different

Most physics sites show you diagrams. **i love physics** puts the system in your hands:

- 🔴 **Real numerics, not canned animations** — semi-implicit Euler, RK4, split-step FFT for quantum tunneling, Newton-iterated Kepler equations. Where a closed form exists, the sim is checked against it to machine precision.
- 🧮 **Living equations** — KaTeX-rendered formulas sit beside every simulation and update *as you drag*, so notation and intuition stay welded together.
- 🖤 **Zero-friction by design** — no trackers, no cookies, everything computed in your browser. Community features degrade gracefully when signed out.
- 🗳️ **Community-steered roadmap** — propose and vote on what gets simulated next; the top pick ships.

## 🚀 Quick start

```bash
git clone https://github.com/rkd0608/i-love-physics.git
cd i-love-physics
npm install
npm run dev          # http://localhost:3000 — works with zero configuration
```

Optional (community features — accounts, library, collections, voting):

```bash
cp .env.example .env.local   # fill in your Supabase URL + anon key
psql "$DATABASE_URL" -f supabase/migrations/0001_init.sql
```

## 🌌 The collection

**Classical Mechanics** · [Orbits & Gravitation](https://i-love-physics.vercel.app/topics/orbits) · [Projectile Motion](https://i-love-physics.vercel.app/topics/projectile-motion) · [Harmonic Oscillator](https://i-love-physics.vercel.app/topics/harmonic-oscillator) · [Zeno & Achilles](https://i-love-physics.vercel.app/topics/zeno-achilles) · [Brachistochrone](https://i-love-physics.vercel.app/topics/brachistochrone) · [Coupled Oscillators](https://i-love-physics.vercel.app/topics/coupled-modes) · [Angular Momentum](https://i-love-physics.vercel.app/topics/angular-momentum) · [Collision Lab](https://i-love-physics.vercel.app/topics/collision-lab)

**Waves & Optics** · [Wave Interference](https://i-love-physics.vercel.app/topics/wave-interference) · [Fourier Sound](https://i-love-physics.vercel.app/topics/fourier-sound) · [Snell’s Law](https://i-love-physics.vercel.app/topics/snells-law) · [Thin Lenses](https://i-love-physics.vercel.app/topics/thin-lenses) · [Doppler Effect](https://i-love-physics.vercel.app/topics/doppler-effect) · [Standing Waves](https://i-love-physics.vercel.app/topics/standing-waves)

**Electromagnetism** · [Electric Fields](https://i-love-physics.vercel.app/topics/electric-fields) · [Magnetic Dipole](https://i-love-physics.vercel.app/topics/magnetic-dipole) · [Electromagnetic Induction](https://i-love-physics.vercel.app/topics/electromagnetic-induction) · [LC Circuit](https://i-love-physics.vercel.app/topics/lc-circuit)

**Thermal & Statistical** · [Ideal Gas](https://i-love-physics.vercel.app/topics/ideal-gas) · [Carnot Cycle](https://i-love-physics.vercel.app/topics/carnot-cycle) · [Diffusion & Random Walks](https://i-love-physics.vercel.app/topics/diffusion-random-walk) · [Maxwell’s Demon](https://i-love-physics.vercel.app/topics/maxwell-demon)

**Relativity** · [Special Relativity](https://i-love-physics.vercel.app/topics/special-relativity) · [Twin Paradox](https://i-love-physics.vercel.app/topics/twin-paradox)

**Quantum Physics** · [Quantum Double-Slit](https://i-love-physics.vercel.app/topics/quantum-double-slit) · [Quantum Tunneling](https://i-love-physics.vercel.app/topics/quantum-tunneling) · [Heisenberg Uncertainty](https://i-love-physics.vercel.app/topics/heisenberg-uncertainty)

**Chaos & Complexity** · [Double Pendulum](https://i-love-physics.vercel.app/topics/double-pendulum) · [Three-Body Problem](https://i-love-physics.vercel.app/topics/three-body) · [Logistic Map](https://i-love-physics.vercel.app/topics/logistic-map)

**Astrophysics & Cosmology** · [Kepler’s Laws](https://i-love-physics.vercel.app/topics/kepler-laws) · [Hohmann Transfer](https://i-love-physics.vercel.app/topics/hohmann-transfer) · [Cosmological Redshift](https://i-love-physics.vercel.app/topics/cosmological-redshift) · [Olbers’ Paradox](https://i-love-physics.vercel.app/topics/olbers-paradox)

## 🧰 Under the hood

| Layer | Choice |
|---|---|
| Framework | Next.js 16 App Router · React 19 · TypeScript strict |
| Simulation engine | Custom Canvas 2D loop — DPR-aware, IntersectionObserver-paused, zero steady-state allocations |
| Math typesetting | KaTeX, rendered live from sim state |
| Styling | Tailwind CSS v4 tokens, dark-first cinematic theme |
| Data & auth | Supabase (Postgres + RLS-enforced schema + cookie sessions) |
| Hosting | Vercel — 85 routes, 68 of them fully static |

```
src/
├── app/                  # routes: /topics/* · /explore · /equations · /glossary · /vote · /library …
├── components/
│   ├── labs/             # 34 self-contained simulation components
│   ├── sim/              # engine contracts: useSimLoop · SimFrame · controls · useSimParams
│   ├── math/             # live KaTeX wrapper
│   └── auth · library · collections · vote · explore · glossary · home
├── lib/
│   ├── topics.ts         # typed registry — every topic flows through this contract
│   ├── equations.ts      # 100+ render-tested expressions
│   └── supabase/         # graceful-degradation data layer
└── supabase/migrations/  # schema + RLS policies + seeded proposals
```

## 🗳️ Vote on what ships next

The [/vote booth](https://i-love-physics.vercel.app/vote) is seeded with proposals — fluid dynamics, AC circuits, Fourier optics, the Ising model and more. One vote per account; the leader gets built next.

## 🤝 Contributing

Found a physics bug? A typo in the universe? Issues and PRs welcome — every simulation carries its own accuracy checks, so please include how you validated.

---

<div align="center">

Made with ❤️ for physics

</div>
