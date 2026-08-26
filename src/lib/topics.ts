export type Domain =
  | "classical-mechanics"
  | "waves-optics"
  | "electromagnetism"
  | "thermo-statistical"
  | "relativity"
  | "quantum"
  | "chaos-complexity"
  | "astrophysics-cosmology";

export type Collection = "paradoxes" | "famous-problems" | "foundations";

export type Level = 1 | 2 | 3;

export type TopicSlug =
  | "orbits"
  | "projectile-motion"
  | "wave-interference"
  | "double-pendulum"
  | "harmonic-oscillator"
  | "special-relativity"
  | "twin-paradox"
  | "quantum-double-slit"
  | "quantum-tunneling"
  | "heisenberg-uncertainty"
  | "fourier-sound"
  | "olbers-paradox"
  | "zeno-achilles"
  | "maxwell-demon"
  | "three-body"
  | "brachistochrone"
  | "coupled-modes"
  | "electric-fields"
  | "magnetic-dipole"
  | "electromagnetic-induction"
  | "lc-circuit"
  | "ideal-gas"
  | "carnot-cycle"
  | "diffusion-random-walk"
  | "kepler-laws"
  | "hohmann-transfer"
  | "cosmological-redshift"
  | "snells-law"
  | "thin-lenses"
  | "doppler-effect"
  | "standing-waves"
  | "angular-momentum"
  | "collision-lab"
  | "logistic-map";

export interface TopicMeta {
  slug: TopicSlug;
  title: string;
  tagline: string;
  domain: Domain;
  collections: Collection[];
  level: Level;
  blurb: string;
  tags: string[];
  equations: string[];
  accent: string;
}

export interface DomainMeta {
  id: Domain;
  label: string;
  blurb: string;
  accent: string;
}

export interface CollectionMeta {
  id: Collection;
  label: string;
  blurb: string;
}

export const DOMAINS: readonly DomainMeta[] = [
  {
    id: "classical-mechanics",
    label: "Classical Mechanics",
    blurb: "Motion, force, and energy before the twentieth century broke them open.",
    accent: "#53d6f2",
  },
  {
    id: "waves-optics",
    label: "Waves & Optics",
    blurb: "Superposition, interference, and everything that ripples or shines.",
    accent: "#7ef0b0",
  },
  {
    id: "electromagnetism",
    label: "Electromagnetism",
    blurb: "Fields, charges, and light as a moving disturbance of both.",
    accent: "#e879f9",
  },
  {
    id: "thermo-statistical",
    label: "Thermal & Statistical",
    blurb: "Heat, entropy, and order emerging from molecular crowds.",
    accent: "#ffd27a",
  },
  {
    id: "relativity",
    label: "Relativity",
    blurb: "Space and time bent to keep the speed of light absolute.",
    accent: "#ff6b6b",
  },
  {
    id: "quantum",
    label: "Quantum Physics",
    blurb: "Probability amplitudes, quanta of action, and measurement.",
    accent: "#2dd4bf",
  },
  {
    id: "chaos-complexity",
    label: "Chaos & Complexity",
    blurb: "Deterministic systems whose futures outrun prediction.",
    accent: "#f97316",
  },
  {
    id: "astrophysics-cosmology",
    label: "Astrophysics & Cosmology",
    blurb: "Stars, horizons, and the universe taken whole.",
    accent: "#93c5fd",
  },
];

export const COLLECTIONS: readonly CollectionMeta[] = [
  {
    id: "paradoxes",
    label: "Paradoxes",
    blurb: "Puzzles that forced physics to grow up.",
  },
  {
    id: "famous-problems",
    label: "Famous Problems",
    blurb: "Challenges that shaped centuries of argument.",
  },
  {
    id: "foundations",
    label: "Foundations",
    blurb: "The first systems everyone should meet.",
  },
];

export const TOPICS: readonly TopicMeta[] = [
  {
    slug: "orbits",
    title: "Orbits & Gravitation",
    tagline: "Gravity as geometry: ellipses traced by falling forever.",
    domain: "classical-mechanics",
    collections: [],
    level: 2,
    blurb:
      "Every orbit is a fall that keeps missing. Watch Newton’s cannonball become Kepler’s ellipse as velocity, radius, and energy trade places around a central mass.",
    tags: ["newton", "gravity", "conic-sections", "energy"],
    equations: [
      "\\vec{F} = G\\,\\frac{m_1 m_2}{r^2}\\,\\hat{r}",
      "v_{\\text{circ}} = \\sqrt{\\frac{GM}{r}}",
      "v^2 = GM\\left(\\tfrac{2}{r}-\\tfrac{1}{a}\\right)",
    ],
    accent: "#53d6f2",
  },
  {
    slug: "projectile-motion",
    title: "Projectile Motion",
    tagline: "Launch angles, parabolas, drag, and the perfect arc.",
    domain: "classical-mechanics",
    collections: ["foundations"],
    level: 1,
    blurb:
      "One burst of velocity, then gravity takes over. Compare the ideal parabola with an air-dragged descent and discover why forty-five degrees only wins in a vacuum.",
    tags: ["kinematics", "drag", "parabola"],
    equations: [
      "R=\\frac{v_0^2\\sin 2\\theta}{g}",
      "\\vec{a} = \\vec{g} - k\\left|\\vec{v}\\right|\\vec{v}",
    ],
    accent: "#b48cf2",
  },
  {
    slug: "wave-interference",
    title: "Wave Interference",
    tagline: "Superposition made visible: bright lines where waves agree.",
    domain: "waves-optics",
    collections: ["foundations"],
    level: 1,
    blurb:
      "Light through two slits argues with itself. The fringes on the far wall map exactly where the waves agree, cancel, and everything in between.",
    tags: ["superposition", "young", "fringes"],
    equations: [
      "d\\sin\\theta = m\\lambda",
      "\\beta \\approx \\frac{\\lambda L}{d}",
    ],
    accent: "#7ef0b0",
  },
  {
    slug: "double-pendulum",
    title: "Double Pendulum",
    tagline: "Tiny nudges, wild divergences: chaos you can steer.",
    domain: "chaos-complexity",
    collections: [],
    level: 2,
    blurb:
      "Two arms, two hinges, endless surprises. Nudge the start by a hair and watch a neighboring trajectory peel away until prediction gives up entirely.",
    tags: ["chaos", "rk4", "sensitivity"],
    equations: ["H = T + V", "\\delta\\theta \\sim e^{\\lambda t}"],
    accent: "#ffd27a",
  },
  {
    slug: "harmonic-oscillator",
    title: "Harmonic Oscillator",
    tagline: "Spring, mass, repeat: the rhythm beneath all wobbles.",
    domain: "classical-mechanics",
    collections: ["foundations"],
    level: 1,
    blurb:
      "Displace, release, repeat. Damped and driven motion in one system — the template behind bells, bridges, circuits, and every small wiggle near equilibrium.",
    tags: ["shm", "damping", "resonance"],
    equations: [
      "x(t) = A\\,e^{-\\gamma t}\\cos(\\omega' t)",
      "\\omega_0 = \\sqrt{k/m}",
    ],
    accent: "#f2708a",
  },
  {
    slug: "special-relativity",
    title: "Special Relativity",
    tagline: "One clock, two frames, and light keeping its promise.",
    domain: "relativity",
    collections: [],
    level: 2,
    blurb:
      "A photon bounces between mirrors on a passing train. Because light refuses to change speed, time itself must stretch — watch γ grow as β approaches 1.",
    tags: ["light-clock", "gamma", "time-dilation", "lorentz"],
    equations: [
      "\\gamma = \\frac{1}{\\sqrt{1-\\beta^2}}",
      "\\Delta t = \\gamma\\,\\Delta\\tau",
      "L = \\frac{L_0}{\\gamma}",
    ],
    accent: "#ff6b6b",
  },
  {
    slug: "twin-paradox",
    title: "Twin Paradox",
    tagline: "Race your twin across spacetime and age less.",
    domain: "relativity",
    collections: ["paradoxes"],
    level: 3,
    blurb:
      "Two worldlines leave the same event and reunite later, yet their clocks disagree. The traveling twin’s tilted path through Minkowski space simply measures shorter.",
    tags: ["minkowski", "proper-time", "worldlines", "paradox"],
    equations: [
      "\\tau = \\int \\sqrt{1-\\beta^2}\\,dt",
      "s^2 = c^2t^2 - x^2",
      "\\Delta\\tau_{\\text{home}} > \\Delta\\tau_{\\text{travel}}",
    ],
    accent: "#ff9e64",
  },
  {
    slug: "quantum-double-slit",
    title: "Quantum Double-Slit",
    tagline: "One particle at a time builds an interference pattern.",
    domain: "quantum",
    collections: [],
    level: 2,
    blurb:
      "Fire electrons singly and each lands as a dot; thousands later, fringes emerge from nowhere classical. Peek at which slit each passes and the fringes quietly vanish.",
    tags: ["monte-carlo", "superposition", "measurement", "fringes"],
    equations: [
      "|\\psi|^2 = |\\psi_1 + \\psi_2|^2",
      "\\Delta y = \\frac{\\lambda L}{d}",
      "P(y) \\propto \\cos^2\\!\\left(\\frac{\\pi d y}{\\lambda L}\\right)",
    ],
    accent: "#2dd4bf",
  },
  {
    slug: "quantum-tunneling",
    title: "Quantum Tunneling",
    tagline: "A wavepacket walks through a wall it cannot climb.",
    domain: "quantum",
    collections: [],
    level: 3,
    blurb:
      "Split-step evolution of a Gaussian packet meeting a repulsive barrier taller than its energy. Part of the probability simply appears on the far side — R + T always sums to one.",
    tags: ["schrodinger", "split-step", "fft", "barrier"],
    equations: [
      "i\\hbar\\frac{\\partial\\psi}{\\partial t} = -\\frac{\\hbar^2}{2m}\\psi'' + V\\psi",
      "E = \\frac{\\hbar^2 k_0^2}{2m} < V_0",
      "R + T = 1",
    ],
    accent: "#a3e635",
  },
  {
    slug: "heisenberg-uncertainty",
    title: "Heisenberg Uncertainty",
    tagline: "Squeeze a wave here and it smears there.",
    domain: "quantum",
    collections: [],
    level: 2,
    blurb:
      "Sharpen a wavepacket’s position and its momentum spectrum blooms wide, live from a real Fourier transform. The product Δx·Δp refuses to fall below half a quantum of action.",
    tags: ["fourier", "gaussian", "phase-space", "minimum"],
    equations: [
      "\\Delta x\\,\\Delta p \\geq \\frac{\\hbar}{2}",
      "\\phi(p) = \\frac{1}{\\sqrt{2\\pi\\hbar}}\\int e^{-ipx/\\hbar}\\psi(x)\\,dx",
      "\\sigma_p^2 = \\langle p^2\\rangle - \\langle p\\rangle^2",
    ],
    accent: "#818cf8",
  },
  {
    slug: "fourier-sound",
    title: "Fourier Sound",
    tagline: "Stack pure tones, sculpt any waveform.",
    domain: "waves-optics",
    collections: [],
    level: 2,
    blurb:
      "Every musical timbre is a recipe of harmonics. Slide the spectral tilt, mute the evens like a clarinet, detune the stack — and watch beats ripple through the oscilloscope.",
    tags: ["additive-synthesis", "harmonics", "spectrum", "beats"],
    equations: [
      "y(t) = \\sum_{n=1}^{N} A_n \\sin(2\\pi n f t)",
      "A_n \\propto n^{-p}",
      "f_n = n f (1 + b(n-1))",
    ],
    accent: "#e879f9",
  },
  {
    slug: "olbers-paradox",
    title: "Olbers’ Paradox",
    tagline: "Infinite stars should set the night ablaze. Why dark?",
    domain: "astrophysics-cosmology",
    collections: ["paradoxes"],
    level: 3,
    blurb:
      "Every shell of stars contributes equally, so an eternal universe should bathe us in blinding light. Dim each star all you like — the darkness needs a beginning, not dimming.",
    tags: ["cosmology", "flux", "horizon", "paradox"],
    equations: [
      "\\Delta F = n L\\,dr",
      "F = \\int_0^{R} n L\\,dr = nLR",
      "R_{\\text{age}} < \\infty \\Rightarrow \\text{dark sky}",
    ],
    accent: "#93c5fd",
  },
  {
    slug: "zeno-achilles",
    title: "Zeno & Achilles",
    tagline: "Infinitely many steps, one finite afternoon.",
    domain: "classical-mechanics",
    collections: ["paradoxes"],
    level: 1,
    blurb:
      "Achilles must first reach where the tortoise was, then where it slid to, forever. Watch the gaps shrink by a fixed ratio while the stopwatch converges to an ordinary finish.",
    tags: ["series", "limits", "convergence", "paradox"],
    equations: [
      "g_{n} = g_0 r^{n},\\quad r = \\frac{v_T}{v_A}",
      "1 + r + r^2 + \\cdots = \\frac{1}{1-r}",
      "t^{*} = \\frac{g_0}{v_A - v_T}",
    ],
    accent: "#f9a8d4",
  },
  {
    slug: "maxwell-demon",
    title: "Maxwell’s Demon",
    tagline: "A tiny gatekeeper who seems to beat entropy.",
    domain: "thermo-statistical",
    collections: ["paradoxes"],
    level: 3,
    blurb:
      "A trapdoor sorts fast molecules from slow and one side heats while the other chills — apparent free order. The ledger hidden in the demon’s memory is where the second law hides.",
    tags: ["entropy", "statistical", "information", "paradox"],
    equations: [
      "\\frac{T_L}{T_R} = \\frac{\\langle v^2 \\rangle_L}{\\langle v^2 \\rangle_R}",
      "\\Delta S \\sim k_B \\ln W",
      "\\dot S_{\\text{total}} \\geq 0",
    ],
    accent: "#4ade80",
  },
  {
    slug: "three-body",
    title: "Three-Body Problem",
    tagline: "Two bodies dance; a third turns it to chaos.",
    domain: "chaos-complexity",
    collections: ["famous-problems"],
    level: 3,
    blurb:
      "In the rotating frame of two orbiting suns, five gravity wells called Lagrange points anchor the landscape. Launch a mote among them and watch the Jacobi constant fight sensitive dependence.",
    tags: ["lagrange", "cr3bp", "jacobi", "chaos"],
    equations: [
      "\\ddot{x} = 2\\dot{y} + \\Omega_x,\\quad \\ddot{y} = -2\\dot{x} + \\Omega_y",
      "C = 2\\Omega - v^2",
      "\\Omega = \\frac{1-\\mu}{r_1} + \\frac{\\mu}{r_2} + \\tfrac{1}{2}n^2(x^2+y^2)",
    ],
    accent: "#f97316",
  },
  {
    slug: "brachistochrone",
    title: "Brachistochrone",
    tagline: "The curve of fastest descent bends below the straight.",
    domain: "classical-mechanics",
    collections: ["famous-problems"],
    level: 2,
    blurb:
      "Straight looks shortest; the cycloid dips early and wins. Three beads race on rails, converting height into exactly the speed Galileo and Bernoulli argued over.",
    tags: ["cycloid", "calculus-of-variations", "energy", "race"],
    equations: [
      "v = \\sqrt{2g(y_0 - y)}",
      "t = \\int \\frac{ds}{\\sqrt{2g(y_0-y)}}",
      "x = a(\\theta - \\sin\\theta),\\; y = a(1-\\cos\\theta)",
    ],
    accent: "#c084fc",
  },
  {
    slug: "coupled-modes",
    title: "Coupled Oscillators",
    tagline: "Push one mass, watch energy learn to share.",
    domain: "classical-mechanics",
    collections: [],
    level: 2,
    blurb:
      "Two masses, three springs: every motion is a blend of a symmetric and an antisymmetric mode. Their frequency mismatch pumps energy back and forth in clean, predictable beats.",
    tags: ["normal-modes", "beats", "coupling", "energy-transfer"],
    equations: [
      "\\omega_{+} = \\sqrt{\\frac{k}{m}},\\quad \\omega_{-} = \\sqrt{\\frac{3k}{m}}",
      "q_{\\pm} = \\tfrac{1}{2}(x_1 \\pm x_2)",
      "T_{\\text{beat}} = \\frac{2\\pi}{|\\omega_- - \\omega_+|}",
    ],
    accent: "#5eead4",
  },
  {
    slug: "electric-fields",
    title: "Electric Fields",
    tagline: "Charge layouts drawn as fields you can probe.",
    domain: "electromagnetism",
    collections: [],
    level: 2,
    blurb:
      "Positive, negative, arranged how you like — the field is already there. Trace its lines outward and drag a test probe anywhere to feel direction and strength.",
    tags: ["coulomb", "field-lines", "superposition", "probe"],
    equations: [
      "\\vec{E} = k\\,\\frac{q}{r^2}\\,\\hat{r}",
      "\\vec{F} = q\\vec{E}",
      "\\vec{E}_{\\text{net}} = \\sum_i \\vec{E}_i",
    ],
    accent: "#f0abfc",
  },
  {
    slug: "magnetic-dipole",
    title: "Magnetic Dipole",
    tagline: "One dipole’s field map, read by a compass lattice.",
    domain: "electromagnetism",
    collections: [],
    level: 2,
    blurb:
      "A bar magnet’s field fills space with a pattern of loops. Grids of tiny compasses snap into alignment and sketch the dipole’s closed field lines for you.",
    tags: ["dipole", "field-map", "compass", "magnetism"],
    equations: [
      "\\vec{B} = \\frac{\\mu_0}{4\\pi}\\frac{3(\\vec{m}\\cdot\\hat{r})\\hat{r} - \\vec{m}}{r^3}",
      "\\vec{\\tau} = \\vec{m} \\times \\vec{B}",
      "\\nabla \\cdot \\vec{B} = 0",
    ],
    accent: "#d946ef",
  },
  {
    slug: "electromagnetic-induction",
    title: "Electromagnetic Induction",
    tagline: "A falling magnet, a coil, and Faraday’s living ledger.",
    domain: "electromagnetism",
    collections: [],
    level: 2,
    blurb:
      "Drop a magnet through a coil and the flux needle leaps — one way in, the other way out. The induced EMF fights every change that tries to create it.",
    tags: ["faraday", "lenz", "flux", "emf"],
    equations: [
      "\\Phi = \\int \\vec{B} \\cdot d\\vec{A}",
      "\\varepsilon = -N\\frac{d\\Phi}{dt}",
      "\\text{Lenz: induced current opposes } d\\Phi",
    ],
    accent: "#c026d3",
  },
  {
    slug: "lc-circuit",
    title: "LC Circuit",
    tagline: "Capacitor and coil trade energy in perfect rhythm.",
    domain: "electromagnetism",
    collections: [],
    level: 2,
    blurb:
      "Charge a capacitor, close the switch, and watch electricity behave like a frictionless spring: field energy sloshes between plate and coil without ever fading.",
    tags: ["oscillator", "shm", "resonance", "energy"],
    equations: [
      "\\omega_0 = \\frac{1}{\\sqrt{LC}}",
      "q(t) = Q\\cos(\\omega_0 t)",
      "U_E + U_B = \\tfrac{1}{2}\\frac{Q^2}{C}",
    ],
    accent: "#14b8a6",
  },
  {
    slug: "ideal-gas",
    title: "Ideal Gas",
    tagline: "Piston, particles, and pressure you can watch build.",
    domain: "thermo-statistical",
    collections: ["foundations"],
    level: 1,
    blurb:
      "A box of bouncing molecules is a pressure gauge. Compress it, heat it, count the wall impacts — the ideal gas law is statistics wearing a piston’s face.",
    tags: ["kinetic-theory", "pressure", "boyle", "temperature"],
    equations: [
      "PV = nRT",
      "\\langle E_k \\rangle = \\tfrac{3}{2}k_B T",
      "v_{\\text{rms}} = \\sqrt{\\frac{3k_B T}{m}}",
    ],
    accent: "#fbbf24",
  },
  {
    slug: "carnot-cycle",
    title: "Carnot Cycle",
    tagline: "Two isotherms, two adiabats, one perfect engine.",
    domain: "thermo-statistical",
    collections: ["famous-problems"],
    level: 3,
    blurb:
      "The most efficient engine physics permits traces a four-stroke loop in the PV plane. Every real engine pays tribute to the gap between its output and Carnot’s.",
    tags: ["entropy", "efficiency", "heat-engine", "cycle"],
    equations: [
      "\\eta = 1 - \\frac{T_c}{T_h}",
      "PV^{\\gamma} = \\text{const}",
      "W = \\oint P\\,dV",
    ],
    accent: "#d97706",
  },
  {
    slug: "diffusion-random-walk",
    title: "Diffusion & Random Walks",
    tagline: "Ten thousand drunk walkers draw a Gaussian.",
    domain: "thermo-statistical",
    collections: [],
    level: 2,
    blurb:
      "Every molecule jitters left and right with no plan at all. Yet an ensemble of them spreads as a widening bell curve whose width grows like the square root of time.",
    tags: ["brownian", "gaussian", "einstein", "variance"],
    equations: [
      "\\langle x^2 \\rangle = 2Dt",
      "x_{\\text{rms}} = \\sqrt{2Dt}",
      "c(x,t) = \\frac{n}{\\sqrt{4\\pi Dt}} e^{-x^2/4Dt}",
    ],
    accent: "#94a3b8",
  },
  {
    slug: "kepler-laws",
    title: "Kepler’s Laws",
    tagline: "Equal areas, stretched ellipses, clockwork periods.",
    domain: "astrophysics-cosmology",
    collections: ["famous-problems"],
    level: 2,
    blurb:
      "Three laws written from naked-eye data, later proven by Newton. Watch a planet sweep equal areas in equal times and keep time across its whole ellipse.",
    tags: ["ellipse", "equal-area", "harmonics-law", "orbit"],
    equations: [
      "\\frac{dA}{dt} = \\text{constant}",
      "T^2 = \\frac{4\\pi^2 a^3}{GM}",
      "r = \\frac{a(1-e^2)}{1 + e\\cos\\theta}",
    ],
    accent: "#facc15",
  },
  {
    slug: "hohmann-transfer",
    title: "Hohmann Transfer",
    tagline: "Two burns on the cheapest road between orbits.",
    domain: "astrophysics-cosmology",
    collections: [],
    level: 3,
    blurb:
      "Raise an ellipse that kisses both circles and you have the fuel-minimal climb. Two precisely timed burns, priced by vis-viva before a single drop of propellant.",
    tags: ["delta-v", "maneuver", "vis-viva", "orbit"],
    equations: [
      "v^2 = GM\\left(\\frac{2}{r} - \\frac{1}{a}\\right)",
      "\\Delta v_1 = v_{p,t} - v_{c,1}",
      "\\Delta v_{\\text{total}} = \\Delta v_1 + \\Delta v_2",
    ],
    accent: "#4f46e5",
  },
  {
    slug: "cosmological-redshift",
    title: "Cosmological Redshift",
    tagline: "Space itself stretches the light moving through it.",
    domain: "astrophysics-cosmology",
    collections: [],
    level: 3,
    blurb:
      "Galaxies are not fleeing through space; the space between them grows. A comoving grid stretches underfoot and every wavelength riding it lengthens by exactly the same factor.",
    tags: ["hubble", "scale-factor", "redshift", "expansion"],
    equations: [
      "1 + z = \\frac{\\lambda_{\\text{obs}}}{\\lambda_{\\text{emit}}} = \\frac{a_0}{a_{\\text{emit}}}",
      "v = H_0 d",
      "a(t) \\text{ scales all proper distances}",
    ],
    accent: "#e11d48",
  },
  {
    slug: "snells-law",
    title: "Snell’s Law",
    tagline: "Light bends where speeds change — until it won’t.",
    domain: "waves-optics",
    collections: ["foundations"],
    level: 1,
    blurb:
      "A ray crossing into glass pivots toward the normal, and past a critical angle it refuses to leave at all. Total internal reflection runs your fiber-optic world.",
    tags: ["refraction", "tir", "critical-angle", "index"],
    equations: [
      "n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2",
      "\\theta_c = \\arcsin\\!\\left(\\frac{n_2}{n_1}\\right)",
      "n = \\frac{c}{v}",
    ],
    accent: "#7dd3fc",
  },
  {
    slug: "thin-lenses",
    title: "Thin Lenses",
    tagline: "Three rays decide where every image lives.",
    domain: "waves-optics",
    collections: ["foundations"],
    level: 1,
    blurb:
      "Parallel ray through focus, focus through parallel, center straight through. Slide an object along the axis and watch images flip between real and virtual.",
    tags: ["lens", "focal", "real-virtual", "magnification"],
    equations: [
      "\\frac{1}{f} = \\frac{1}{d_o} + \\frac{1}{d_i}",
      "m = -\\frac{d_i}{d_o}",
      "\\frac{1}{f} = (n-1)\\left(\\frac{1}{R_1} - \\frac{1}{R_2}\\right)",
    ],
    accent: "#0ea5e9",
  },
  {
    slug: "doppler-effect",
    title: "Doppler Effect",
    tagline: "Wavefronts bunch ahead, stretch behind.",
    domain: "waves-optics",
    collections: [],
    level: 2,
    blurb:
      "A moving source keeps emitting on schedule, but each crest starts closer to you than the last — or farther. Pitch rises approaching, sags receding, snaps at Mach one.",
    tags: ["frequency-shift", "wavefronts", "sound", "motion"],
    equations: [
      "f' = f\\,\\frac{v \\pm v_o}{v \\mp v_s}",
      "\\lambda' = \\lambda - v_s T",
      "v_s = v \\Rightarrow \\text{wavefront pile-up}",
    ],
    accent: "#67e8f9",
  },
  {
    slug: "standing-waves",
    title: "Standing Waves",
    tagline: "A string picks only the notes its length allows.",
    domain: "waves-optics",
    collections: ["foundations"],
    level: 1,
    blurb:
      "Waves bouncing between fixed ends agree with themselves only at special frequencies. Nodes pin the string still while antinodes swing widest — harmony as geometry.",
    tags: ["harmonics", "nodes", "resonance", "string"],
    equations: [
      "f_n = \\frac{n v}{2L}",
      "y(x,t) = 2A\\sin(kx)\\cos(\\omega t)",
      "\\lambda_n = \\frac{2L}{n}",
    ],
    accent: "#34d399",
  },
  {
    slug: "angular-momentum",
    title: "Angular Momentum",
    tagline: "Arms in, spin up: the skater’s secret.",
    domain: "classical-mechanics",
    collections: [],
    level: 2,
    blurb:
      "No outside twist means spin stays put. Pull mass toward the axis and moment of inertia collapses — so rotation rate must surge to carry the same angular momentum.",
    tags: ["conservation", "inertia", "rotation", "skater"],
    equations: [
      "L = I\\omega = \\text{constant}",
      "I = \\sum m r^2",
      "K_{\\text{rot}} = \\tfrac{1}{2}I\\omega^2",
    ],
    accent: "#0d9488",
  },
  {
    slug: "collision-lab",
    title: "Collision Lab",
    tagline: "Momentum always balances; kinetic energy negotiates.",
    domain: "classical-mechanics",
    collections: ["foundations"],
    level: 1,
    blurb:
      "Two gliders meet and part. The momentum ledger closes perfectly every time, while kinetic energy survives fully only when restitution equals one.",
    tags: ["momentum", "restitution", "elastic", "conservation"],
    equations: [
      "m_1 u_1 + m_2 u_2 = m_1 v_1 + m_2 v_2",
      "e = \\frac{v_2 - v_1}{u_1 - u_2}",
      "\\Delta K = -\\tfrac{1}{2}\\mu (1-e^2)(u_1-u_2)^2",
    ],
    accent: "#f87171",
  },
  {
    slug: "logistic-map",
    title: "Logistic Map",
    tagline: "One line of math breeding infinite order and chaos.",
    domain: "chaos-complexity",
    collections: [],
    level: 2,
    blurb:
      "A population updated by a single parabola cascades from steady state to doubling cycles to full chaos as r rises. The cobweb plot makes each iteration visible.",
    tags: ["bifurcation", "feigenbaum", "cobweb", "period-doubling"],
    equations: [
      "x_{n+1} = r\\,x_n(1-x_n)",
      "x^{*} = 1 - \\frac{1}{r}",
      "\\delta = 4.6692\\ldots",
    ],
    accent: "#65a30d",
  },
];

export function getTopic(slug: string): TopicMeta | undefined {
  return TOPICS.find((topic) => topic.slug === slug);
}

export function domainLabel(domain: Domain): string {
  return DOMAINS.find((d) => d.id === domain)?.label ?? domain;
}

export function relatedTopics(slug: TopicSlug, count: number = 2): TopicMeta[] {
  const self = TOPICS.find((topic) => topic.slug === slug);
  if (!self) return [];
  const overlap = (pick: (topic: TopicMeta) => number): number => pick(self);
  const sharedTags = (topic: TopicMeta): number =>
    overlap((s) => topic.tags.filter((tag) => s.tags.includes(tag)).length);
  const sharedCollections = (topic: TopicMeta): number =>
    overlap(
      (s) =>
        topic.collections.filter((c) => s.collections.includes(c)).length
    );
  return TOPICS.map((topic, index) => ({
    topic,
    index,
    sameDomain: topic.domain === self.domain,
    sharedCollections: sharedCollections(topic),
    sharedTags: sharedTags(topic),
  }))
    .filter((entry) => entry.topic.slug !== slug)
    .sort(
      (a, b) =>
        Number(b.sameDomain) - Number(a.sameDomain) ||
        b.sharedCollections - a.sharedCollections ||
        b.sharedTags - a.sharedTags ||
        a.index - b.index,
    )
    .slice(0, Math.max(0, count))
    .map((entry) => entry.topic);
}
