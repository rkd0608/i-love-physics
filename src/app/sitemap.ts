import type { MetadataRoute } from "next";

const BASE_URL = "https://i-love-physics.example";

const ROUTES = [
  "",
  "/explore",
  "/about",
  "/equations",
  "/glossary",
  "/topics/orbits",
  "/topics/projectile-motion",
  "/topics/wave-interference",
  "/topics/double-pendulum",
  "/topics/harmonic-oscillator",
  "/topics/special-relativity",
  "/topics/twin-paradox",
  "/topics/quantum-double-slit",
  "/topics/quantum-tunneling",
  "/topics/heisenberg-uncertainty",
  "/topics/fourier-sound",
  "/topics/olbers-paradox",
  "/topics/zeno-achilles",
  "/topics/maxwell-demon",
  "/topics/three-body",
  "/topics/brachistochrone",
  "/topics/coupled-modes",
  "/topics/electric-fields",
  "/topics/magnetic-dipole",
  "/topics/electromagnetic-induction",
  "/topics/lc-circuit",
  "/topics/ideal-gas",
  "/topics/carnot-cycle",
  "/topics/diffusion-random-walk",
  "/topics/kepler-laws",
  "/topics/hohmann-transfer",
  "/topics/cosmological-redshift",
  "/topics/snells-law",
  "/topics/thin-lenses",
  "/topics/doppler-effect",
  "/topics/standing-waves",
  "/topics/angular-momentum",
  "/topics/collision-lab",
  "/topics/logistic-map",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date("2026-08-25"),
    changeFrequency: "monthly",
    priority: route === "" ? 1 : route === "/explore" ? 0.8 : 0.6,
  }));
}
