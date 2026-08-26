import type { TopicSlug } from "@/lib/topics";

export interface EquationEntry {
  tex: string;
  note: string;
}

export interface EquationGroup {
  slug: TopicSlug;
  title: string;
  accent: string;
  entries: EquationEntry[];
}

export const EQUATION_INDEX: readonly EquationGroup[] = [
  {
    slug: "orbits",
    title: "Orbits",
    accent: "#53d6f2",
    entries: [
      {
        tex: String.raw`\vec{F} = G\,\frac{m_1 m_2}{r^2}\,\hat{r}`,
        note: "Newtonian gravity: attraction grows with mass, fades with the square of distance.",
      },
      {
        tex: String.raw`v^2 = GM\left(\frac{2}{r} - \frac{1}{a}\right)`,
        note: "Vis-viva: orbital speed from distance r and semi-major axis a at any point of the ellipse.",
      },
      {
        tex: String.raw`L = \lvert\vec{r}\times\vec{v}\rvert`,
        note: "Angular momentum is conserved along the orbit, forcing equal areas in equal times.",
      },
      {
        tex: String.raw`v_{\text{esc}} = \sqrt{\frac{2GM}{r}}`,
        note: "Escape speed: kinetic energy exactly cancels the negative gravitational potential.",
      },
    ],
  },
  {
    slug: "projectile-motion",
    title: "Projectile Motion",
    accent: "#b48cf2",
    entries: [
      {
        tex: String.raw`y = x\tan\theta - \frac{g x^2}{2 v_0^2 \cos^2\theta}`,
        note: "Vacuum trajectory: a parabola set entirely by launch speed and angle.",
      },
      {
        tex: String.raw`R = \frac{v_0^2 \sin 2\theta}{g}`,
        note: "Maximum range on level ground, achieved at forty-five degrees without air.",
      },
      {
        tex: String.raw`\vec{a} = \vec{g} - k\lvert\vec{v}\rvert\vec{v}`,
        note: "Quadratic drag: air resistance scales with the square of speed and fights the motion.",
      },
      {
        tex: String.raw`h_{\max} = \frac{v_0^2 \sin^2\theta}{2 g}`,
        note: "Apex height of the vacuum arc, where vertical velocity momentarily vanishes.",
      },
    ],
  },
  {
    slug: "wave-interference",
    title: "Wave Interference",
    accent: "#7ef0b0",
    entries: [
      {
        tex: String.raw`A(p,t) = A_1\sin(k r_1 - \omega t) + A_2\sin(k r_2 - \omega t)`,
        note: "Superposition: every point simply adds the two waves that arrive there.",
      },
      {
        tex: String.raw`\Delta = \lvert r_1 - r_2 \rvert = m\lambda`,
        note: "Constructive fringes appear wherever the path difference is a whole wavelength.",
      },
      {
        tex: String.raw`\Delta = \left(m + \tfrac{1}{2}\right)\lambda`,
        note: "Destructive nodal lines sit halfway between, where crests meet troughs.",
      },
      {
        tex: String.raw`I \propto \langle A^2 \rangle`,
        note: "Intensity follows time-averaged amplitude squared, brightening antinodes fourfold.",
      },
    ],
  },
  {
    slug: "double-pendulum",
    title: "Double Pendulum",
    accent: "#ffd27a",
    entries: [
      {
        tex: String.raw`\ddot{\theta}_1 = f_1(\theta_1,\theta_2,\omega_1,\omega_2)`,
        note: "Each arm drives the other: the Lagrangian yields two coupled second-order equations.",
      },
      {
        tex: String.raw`\delta\theta(t) \sim e^{\lambda t}`,
        note: "Tiny initial differences grow exponentially, the signature of deterministic chaos.",
      },
      {
        tex: String.raw`E = \tfrac{1}{2}ml^2\left(2\omega_1^2 + \omega_2^2 + 2\omega_1\omega_2\cos(\theta_1-\theta_2)\right) - mgl\,(2\cos\theta_1 + \cos\theta_2)`,
        note: "Energy conservation doubles as an accuracy probe for the RK4 integrator.",
      },
    ],
  },
  {
    slug: "harmonic-oscillator",
    title: "Harmonic Oscillator",
    accent: "#f2708a",
    entries: [
      {
        tex: String.raw`\omega_0 = \sqrt{\frac{k}{m}}`,
        note: "Natural frequency: stiffness versus inertia sets the clock of oscillation.",
      },
      {
        tex: String.raw`x(t) = e^{-\gamma t}\left[x_0\cos(\omega' t) + \frac{v_0 + \gamma x_0}{\omega'}\sin(\omega' t)\right]`,
        note: "Exact underdamped motion: an exponential envelope over a shifted sinusoid.",
      },
      {
        tex: String.raw`\omega' = \sqrt{\omega_0^2 - \gamma^2}`,
        note: "Damping lowers the ringing frequency below the undamped natural value.",
      },
      {
        tex: String.raw`Q = \frac{\omega_0}{2\gamma}`,
        note: "Quality factor counts how many radians pass before energy falls by e.",
      },
    ],
  },
  {
    slug: "special-relativity",
    title: "Special Relativity",
    accent: "#ff6b6b",
    entries: [
      {
        tex: String.raw`\gamma = \frac{1}{\sqrt{1-\beta^2}},\quad \beta = \frac{v}{c}`,
        note: "The Lorentz factor diverges as speed approaches light speed.",
      },
      {
        tex: String.raw`\Delta t_{\text{lab}} = \gamma\,\Delta\tau`,
        note: "Moving clocks tick slow: the lab sees γ seconds per proper second.",
      },
      {
        tex: String.raw`L = \frac{L_0}{\gamma}`,
        note: "Moving rods contract along the direction of motion by the same factor.",
      },
    ],
  },
  {
    slug: "twin-paradox",
    title: "Twin Paradox",
    accent: "#ff9e64",
    entries: [
      {
        tex: String.raw`\tau = \int \sqrt{dt^2 - dx^2/c^2}`,
        note: "Proper time is arc length along a worldline in Minkowski space.",
      },
      {
        tex: String.raw`s^2 = c^2t^2 - x^2`,
        note: "The invariant interval every inertial observer agrees on.",
      },
      {
        tex: String.raw`\tau_{\text{straight}} > \tau_{\text{kinked}}`,
        note: "Unlike Euclid, the straightest worldline logs the MOST time.",
      },
    ],
  },
  {
    slug: "quantum-double-slit",
    title: "Quantum Double-Slit",
    accent: "#2dd4bf",
    entries: [
      {
        tex: String.raw`|\psi|^2 = |\psi_1 + \psi_2|^2`,
        note: "Amplitudes add before squaring — the cross term is the interference.",
      },
      {
        tex: String.raw`\Delta y = \frac{\lambda L}{d}`,
        note: "Fringe spacing on a wall a distance L behind slits separated by d.",
      },
      {
        tex: String.raw`P(y) \propto \cos^2\!\left(\frac{\pi d y}{\lambda L}\right)`,
        note: "Where the phase difference is a half wavelength, probability vanishes.",
      },
    ],
  },
  {
    slug: "quantum-tunneling",
    title: "Quantum Tunneling",
    accent: "#a3e635",
    entries: [
      {
        tex: String.raw`i\hbar\frac{\partial\psi}{\partial t} = -\frac{\hbar^2}{2m}\psi'' + V\psi`,
        note: "The Schrödinger equation steers the whole wavefunction, wall and all.",
      },
      {
        tex: String.raw`E = \frac{\hbar^2 k_0^2}{2m} < V_0`,
        note: "Classically forbidden energy still leaks probability through the barrier.",
      },
      {
        tex: String.raw`R + T = 1`,
        note: "Probability is never lost — it only splits between reflection and transmission.",
      },
    ],
  },
  {
    slug: "heisenberg-uncertainty",
    title: "Heisenberg Uncertainty",
    accent: "#818cf8",
    entries: [
      {
        tex: String.raw`\Delta x\,\Delta p \geq \frac{\hbar}{2}`,
        note: "The irreducible tradeoff between knowing where and how fast.",
      },
      {
        tex: String.raw`\phi(p) = \frac{1}{\sqrt{2\pi\hbar}}\int e^{-ipx/\hbar}\psi(x)\,dx`,
        note: "Momentum amplitudes are the Fourier transform of position amplitudes.",
      },
      {
        tex: String.raw`\sigma_p^2 = \langle p^2\rangle - \langle p\rangle^2`,
        note: "Spread measured honestly as the standard deviation of |φ(p)|².",
      },
    ],
  },
  {
    slug: "fourier-sound",
    title: "Fourier Sound",
    accent: "#e879f9",
    entries: [
      {
        tex: String.raw`y(t) = \sum_{n=1}^{N} A_n \sin(2\pi n f t)`,
        note: "Any periodic tone as a stack of pure harmonics.",
      },
      {
        tex: String.raw`A_n \propto n^{-p}`,
        note: "Spectral tilt: high p sounds mellow, p near zero sounds buzzy.",
      },
      {
        tex: String.raw`f_n = n f (1 + b(n-1))`,
        note: "Stretch detuning nudges partials off the harmonic series into beating.",
      },
    ],
  },
  {
    slug: "olbers-paradox",
    title: "Olbers’ Paradox",
    accent: "#93c5fd",
    entries: [
      {
        tex: String.raw`\Delta F = n L\,dr`,
        note: "Each shell adds the same flux: more stars exactly cancel their distance.",
      },
      {
        tex: String.raw`F = \int_0^{R} n L\,dr = nLR`,
        note: "Flux grows without bound unless the universe has a horizon.",
      },
      {
        tex: String.raw`R_{\text{age}} < \infty \Rightarrow \text{dark sky}`,
        note: "A finite age caps visible shells — darkness proves the cosmos had a beginning.",
      },
    ],
  },
  {
    slug: "zeno-achilles",
    title: "Zeno & Achilles",
    accent: "#f9a8d4",
    entries: [
      {
        tex: String.raw`g_n = g_0 r^n,\quad r = \frac{v_T}{v_A}`,
        note: "Each Zeno step shrinks the gap by the fixed speed ratio.",
      },
      {
        tex: String.raw`1 + r + r^2 + \cdots = \frac{1}{1-r}`,
        note: "Infinitely many dashes fit inside one finite catch-up time.",
      },
      {
        tex: String.raw`t^{*} = \frac{g_0}{v_A - v_T}`,
        note: "The ordinary finishing time all those steps converge to.",
      },
    ],
  },
  {
    slug: "maxwell-demon",
    title: "Maxwell’s Demon",
    accent: "#4ade80",
    entries: [
      {
        tex: String.raw`\frac{T_L}{T_R} = \frac{\langle v^2 \rangle_L}{\langle v^2 \rangle_R}`,
        note: "Temperature from mean squared speed — sorting shifts the ratio.",
      },
      {
        tex: String.raw`\Delta S \sim k_B \ln W`,
        note: "Entropy counts arrangements; sorting shrinks W for the gas alone.",
      },
      {
        tex: String.raw`\dot S_{\text{total}} \geq 0`,
        note: "The demon’s memory erasure pays back every bit it appears to save.",
      },
    ],
  },
  {
    slug: "three-body",
    title: "Three-Body Problem",
    accent: "#f97316",
    entries: [
      {
        tex: String.raw`\ddot{x} = 2\dot{y} + \Omega_x,\quad \ddot{y} = -2\dot{x} + \Omega_y`,
        note: "In the rotating frame Coriolis terms join gravity in steering the mote.",
      },
      {
        tex: String.raw`C = 2\Omega - v^2`,
        note: "The Jacobi integral: an energy-like constant no chaotic path may change.",
      },
      {
        tex: String.raw`\Omega = \frac{1-\mu}{r_1} + \frac{\mu}{r_2} + \tfrac{1}{2}n^2(x^2+y^2)`,
        note: "Effective potential: two gravity wells plus centrifugal bowl.",
      },
    ],
  },
  {
    slug: "brachistochrone",
    title: "Brachistochrone",
    accent: "#c084fc",
    entries: [
      {
        tex: String.raw`v = \sqrt{2g(y_0 - y)}`,
        note: "Speed depends only on height lost, whatever path was taken.",
      },
      {
        tex: String.raw`t = \int \frac{ds}{\sqrt{2g(y_0-y)}}`,
        note: "Descent time as a path integral — the quantity to minimize.",
      },
      {
        tex: String.raw`x = a(\theta - \sin\theta),\; y = a(1 - \cos\theta)`,
        note: "The winning cycloid, traced by a point on a rolling wheel.",
      },
    ],
  },
  {
    slug: "coupled-modes",
    title: "Coupled Oscillators",
    accent: "#5eead4",
    entries: [
      {
        tex: String.raw`\omega_{+} = \sqrt{\frac{k}{m}},\quad \omega_{-} = \sqrt{\frac{3k}{m}}`,
        note: "Symmetric masses feel one spring; antisymmetric feel three.",
      },
      {
        tex: String.raw`q_{\pm} = \tfrac{1}{2}(x_1 \pm x_2)`,
        note: "Normal coordinates: any motion decomposes into these two patterns.",
      },
      {
        tex: String.raw`T_{\text{beat}} = \frac{2\pi}{|\omega_- - \omega_+|}`,
        note: "Energy sloshes between masses at the beat of the mode split.",
      },
    ],
  },
  {
    slug: "electric-fields",
    title: "Electric Fields",
    accent: "#f0abfc",
    entries: [
      { tex: String.raw`\vec{E} = k\,\frac{q}{r^2}\,\hat{r}`, note: "A point charge fills space with an inverse-square field." },
      { tex: String.raw`\vec{F} = q\vec{E}`, note: "The field is the force a unit charge would feel, waiting in place." },
      { tex: String.raw`\vec{E}_{\text{net}} = \sum_i \vec{E}_i`, note: "Fields superpose vectorially — no negotiation between charges." },
    ],
  },
  {
    slug: "magnetic-dipole",
    title: "Magnetic Dipole",
    accent: "#d946ef",
    entries: [
      { tex: String.raw`\vec{B} = \frac{\mu_0}{4\pi}\frac{3(\vec{m}\cdot\hat{r})\hat{r} - \vec{m}}{r^3}`, note: "Dipole field falls as 1/r³ — steep near, faint far." },
      { tex: String.raw`\vec{\tau} = \vec{m} \times \vec{B}`, note: "Torque twists compass needles into alignment with B." },
      { tex: String.raw`\nabla \cdot \vec{B} = 0`, note: "No magnetic monopoles: field lines close on themselves." },
    ],
  },
  {
    slug: "electromagnetic-induction",
    title: "Electromagnetic Induction",
    accent: "#c026d3",
    entries: [
      { tex: String.raw`\Phi = \int \vec{B} \cdot d\vec{A}`, note: "Flux counts field threads passing through the coil's loop." },
      { tex: String.raw`\varepsilon = -N\frac{d\Phi}{dt}`, note: "Faraday: N turns multiply the EMF from changing flux." },
      { tex: String.raw`\text{induced } I \text{ opposes } d\Phi`, note: "Lenz's sign rule: nature resists changes in flux, never abets them." },
    ],
  },
  {
    slug: "lc-circuit",
    title: "LC Circuit",
    accent: "#14b8a6",
    entries: [
      { tex: String.raw`\omega_0 = \frac{1}{\sqrt{LC}}`, note: "Capacitance and inductance set a natural frequency like k and m." },
      { tex: String.raw`q(t) = Q\cos(\omega_0 t)`, note: "Charge oscillates forever in the ideal lossless circuit." },
      { tex: String.raw`U_E + U_B = \tfrac{1}{2}\frac{Q^2}{C}`, note: "Electric and magnetic energy trade places, sum constant." },
    ],
  },
  {
    slug: "ideal-gas",
    title: "Ideal Gas",
    accent: "#fbbf24",
    entries: [
      { tex: String.raw`PV = nRT`, note: "Pressure times volume tracks temperature for any dilute gas." },
      { tex: String.raw`\langle E_k \rangle = \tfrac{3}{2}k_B T`, note: "Temperature IS mean molecular kinetic energy per degree." },
      { tex: String.raw`v_{\text{rms}} = \sqrt{\frac{3k_B T}{m}}`, note: "Lighter or hotter molecules race faster on average." },
    ],
  },
  {
    slug: "carnot-cycle",
    title: "Carnot Cycle",
    accent: "#d97706",
    entries: [
      { tex: String.raw`\eta = 1 - \frac{T_c}{T_h}`, note: "No engine between two reservoirs can beat this efficiency." },
      { tex: String.raw`PV^{\gamma} = \text{const}`, note: "Adiabats stiffen with heat-capacity ratio γ." },
      { tex: String.raw`W = \oint P\,dV`, note: "Net work is the area enclosed by the loop in the PV plane." },
    ],
  },
  {
    slug: "diffusion-random-walk",
    title: "Diffusion & Random Walks",
    accent: "#94a3b8",
    entries: [
      { tex: String.raw`\langle x^2 \rangle = 2Dt`, note: "Einstein: squared spread grows linearly with time." },
      { tex: String.raw`x_{\text{rms}} = \sqrt{2Dt}`, note: "Distance traveled scales as √t — diffusion is patient." },
      { tex: String.raw`c(x,t) = \frac{n}{\sqrt{4\pi Dt}} e^{-x^2/4Dt}`, note: "Many random steps sum to a spreading Gaussian." },
    ],
  },
  {
    slug: "kepler-laws",
    title: "Kepler’s Laws",
    accent: "#facc15",
    entries: [
      { tex: String.raw`\frac{dA}{dt} = \text{constant}`, note: "Equal areas in equal times — angular momentum in disguise." },
      { tex: String.raw`T^2 = \frac{4\pi^2 a^3}{GM}`, note: "Period squared tracks semi-major axis cubed across all orbits." },
      { tex: String.raw`r = \frac{a(1-e^2)}{1 + e\cos\theta}`, note: "Every conic section written as one polar equation." },
    ],
  },
  {
    slug: "hohmann-transfer",
    title: "Hohmann Transfer",
    accent: "#4f46e5",
    entries: [
      { tex: String.raw`v^2 = GM\left(\frac{2}{r} - \frac{1}{a}\right)`, note: "Vis-viva prices every point of the transfer ellipse." },
      { tex: String.raw`\Delta v_1 = v_{p,t} - v_{c,1}`, note: "First burn lifts apoapsis to meet the outer orbit." },
      { tex: String.raw`\Delta v_{\text{total}} = \Delta v_1 + \Delta v_2`, note: "Two burns, budgeted entirely before launch." },
    ],
  },
  {
    slug: "cosmological-redshift",
    title: "Cosmological Redshift",
    accent: "#e11d48",
    entries: [
      { tex: String.raw`1 + z = \frac{\lambda_{\text{obs}}}{\lambda_{\text{emit}}}`, note: "Redshift measures how much space grew during transit." },
      { tex: String.raw`v = H_0 d`, note: "Hubble flow: recession speed proportional to distance." },
      { tex: String.raw`a(t)\,\lambda \approx \text{const}`, note: "Comoving wavelengths stretch exactly with the scale factor." },
    ],
  },
  {
    slug: "snells-law",
    title: "Snell’s Law",
    accent: "#7dd3fc",
    entries: [
      { tex: String.raw`n_1 \sin\theta_1 = n_2 \sin\theta_2`, note: "One line of trigonometry bends every ray in optics." },
      { tex: String.raw`\theta_c = \arcsin(n_2/n_1)`, note: "Beyond this angle light cannot leave the denser medium." },
      { tex: String.raw`n = c/v`, note: "Index of refraction is light's speed tax per material." },
    ],
  },
  {
    slug: "thin-lenses",
    title: "Thin Lenses",
    accent: "#0ea5e9",
    entries: [
      { tex: String.raw`\frac{1}{f} = \frac{1}{d_o} + \frac{1}{d_i}`, note: "Object and image distances conjugate through the focal length." },
      { tex: String.raw`m = -\frac{d_i}{d_o}`, note: "Magnification follows distance ratio; sign flips orientation." },
      { tex: String.raw`\frac{1}{f} = (n-1)\left(\frac{1}{R_1} - \frac{1}{R_2}\right)`, note: "The lensmaker's formula: curvature plus glass sets focus." },
    ],
  },
  {
    slug: "doppler-effect",
    title: "Doppler Effect",
    accent: "#67e8f9",
    entries: [
      { tex: String.raw`f' = f\,\frac{v \pm v_o}{v \mp v_s}`, note: "Relative motion along the line of sight shifts pitch." },
      { tex: String.raw`\lambda' = \lambda - v_s T`, note: "Approaching sources stamp crests closer together." },
      { tex: String.raw`v_s = v \Rightarrow \text{pile-up}`, note: "At Mach one all wavefronts arrive together — the sonic boom." },
    ],
  },
  {
    slug: "standing-waves",
    title: "Standing Waves",
    accent: "#34d399",
    entries: [
      { tex: String.raw`f_n = \frac{n v}{2L}`, note: "Only whole numbers of half-wavelengths fit on the string." },
      { tex: String.raw`y(x,t) = 2A\sin(kx)\cos(\omega t)`, note: "Opposing traveling waves fuse into a breathing pattern." },
      { tex: String.raw`\lambda_n = 2L/n`, note: "Node spacing fixes each harmonic's wavelength geometrically." },
    ],
  },
  {
    slug: "angular-momentum",
    title: "Angular Momentum",
    accent: "#0d9488",
    entries: [
      { tex: String.raw`L = I\omega = \text{constant}`, note: "With no external torque, spin persists unchanged." },
      { tex: String.raw`I = \sum m r^2`, note: "Moment of inertia weights mass by distance from the axis." },
      { tex: String.raw`K_{\text{rot}} = \tfrac{1}{2}I\omega^2`, note: "Pulling arms inward raises KE — work done against inertia." },
    ],
  },
  {
    slug: "collision-lab",
    title: "Collision Lab",
    accent: "#f87171",
    entries: [
      { tex: String.raw`m_1 u_1 + m_2 u_2 = m_1 v_1 + m_2 v_2`, note: "Momentum conservation closes perfectly in every collision." },
      { tex: String.raw`e = \frac{v_2 - v_1}{u_1 - u_2}`, note: "Restitution coefficient: 1 elastic, 0 perfectly sticky." },
      { tex: String.raw`\Delta K = -\tfrac{1}{2}\mu(1-e^2)(u_1-u_2)^2`, note: "Energy lost scales with closing speed squared." },
    ],
  },
  {
    slug: "logistic-map",
    title: "Logistic Map",
    accent: "#65a30d",
    entries: [
      { tex: String.raw`x_{n+1} = r\,x_n(1 - x_n)`, note: "One parabola iterated: population growth with crowding." },
      { tex: String.raw`x^{*} = 1 - \frac{1}{r}`, note: "Steady state above r=1, losing stability at r=3." },
      { tex: String.raw`\delta = 4.6692\ldots`, note: "Feigenbaum's constant governs every period-doubling cascade." },
    ],
  },
];
