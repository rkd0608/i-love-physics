import type { Domain, TopicSlug } from "@/lib/topics";

export interface GlossaryTerm {
  term: string;
  domain: Domain;
  definition: string;
  math?: string;
  seeAlso?: TopicSlug[];
}

export const GLOSSARY_TERMS: readonly GlossaryTerm[] = [
  {
    term: "Angular momentum",
    domain: "classical-mechanics",
    definition:
      "The rotational analogue of momentum, conserved whenever no net external torque acts on a system.",
    math: String.raw`L = I\,\omega`,
    seeAlso: ["angular-momentum", "kepler-laws"],
  },
  {
    term: "Center of mass",
    domain: "classical-mechanics",
    definition:
      "The weighted average position of a system’s mass, which moves as if every external force were applied at that single point.",
    seeAlso: ["collision-lab"],
  },
  {
    term: "Coefficient of restitution",
    domain: "classical-mechanics",
    definition:
      "A number between zero and one measuring bounce liveliness: the ratio of separating to approaching relative speed of the colliding bodies.",
    seeAlso: ["collision-lab"],
  },
  {
    term: "Conservative force",
    domain: "classical-mechanics",
    definition:
      "A force such as gravity or an ideal spring whose work depends only on the endpoints of the path, guaranteeing a potential energy function.",
    seeAlso: ["brachistochrone"],
  },
  {
    term: "Friction",
    domain: "classical-mechanics",
    definition:
      "A contact force opposing relative sliding, proportional to the normal force through a material-dependent coefficient.",
    seeAlso: ["brachistochrone"],
  },
  {
    term: "Impulse",
    domain: "classical-mechanics",
    definition:
      "The accumulated force over a collision’s duration, equal to the change in momentum it produces.",
    seeAlso: ["collision-lab"],
  },
  {
    term: "Inertia",
    domain: "classical-mechanics",
    definition:
      "The tendency of a body to keep its state of motion until a net external force intervenes; measured quantitatively by mass.",
    seeAlso: ["projectile-motion"],
  },
  {
    term: "Kinetic energy",
    domain: "classical-mechanics",
    definition:
      "The energy of motion, transformed by work done on the body and exchanged in collisions.",
    math: String.raw`K = \tfrac{1}{2}mv^2`,
    seeAlso: ["collision-lab"],
  },
  {
    term: "Moment of inertia",
    domain: "classical-mechanics",
    definition:
      "Rotational sluggishness: how far mass sits from the axis matters as much as how much there is.",
    math: String.raw`I = \sum m\,r^2`,
    seeAlso: ["angular-momentum"],
  },
  {
    term: "Momentum",
    domain: "classical-mechanics",
    definition:
      "Mass in motion — conserved in every collision when no outside force acts on the colliding pair.",
    math: String.raw`\vec{p} = m\,\vec{v}`,
    seeAlso: ["collision-lab"],
  },
  {
    term: "Simple harmonic motion",
    domain: "classical-mechanics",
    definition:
      "Oscillation with a restoring force proportional to displacement, producing sinusoidal motion at a natural frequency set by stiffness and mass.",
    math: String.raw`\omega_0 = \sqrt{k/m}`,
    seeAlso: ["harmonic-oscillator", "coupled-modes"],
  },
  {
    term: "Torque",
    domain: "classical-mechanics",
    definition:
      "The rotational effect of a force: lever arm times the force component perpendicular to it.",
    math: String.raw`\vec{\tau} = \vec{r} \times \vec{F}`,
    seeAlso: ["angular-momentum"],
  },
  {
    term: "Work–energy theorem",
    domain: "classical-mechanics",
    definition:
      "Net work done on a body equals its change in kinetic energy, whatever route the forces took.",
    math: String.raw`W_{\text{net}} = \Delta K`,
    seeAlso: ["brachistochrone"],
  },

  {
    term: "Amplitude",
    domain: "waves-optics",
    definition:
      "The size of a wave’s maximum excursion from equilibrium, setting loudness or brightness but not pitch or color.",
    seeAlso: ["fourier-sound"],
  },
  {
    term: "Beat frequency",
    domain: "waves-optics",
    definition:
      "The throbbing rate heard when two tones of nearby frequencies sound together, matching the difference between them.",
    seeAlso: ["fourier-sound", "coupled-modes"],
  },
  {
    term: "Diffraction",
    domain: "waves-optics",
    definition:
      "The spreading of waves around edges and through gaps, strongest when the opening rivals the wavelength.",
    math: String.raw`\sin\theta \approx \lambda/a`,
    seeAlso: ["wave-interference"],
  },
  {
    term: "Dispersion",
    domain: "waves-optics",
    definition:
      "The dependence of wave speed on frequency, which spreads a pulse apart and splits white light into a spectrum.",
    seeAlso: ["snells-law", "fourier-sound"],
  },
  {
    term: "Frequency",
    domain: "waves-optics",
    definition:
      "Cycles per second of any repeating oscillation, measured in hertz.",
    math: String.raw`f = 1/T`,
    seeAlso: ["standing-waves", "doppler-effect"],
  },
  {
    term: "Interference",
    domain: "waves-optics",
    definition:
      "The pattern produced where overlapping waves add crest-to-crest or cancel trough-to-crest.",
    math: String.raw`d\sin\theta = m\lambda`,
    seeAlso: ["wave-interference"],
  },
  {
    term: "Refractive index",
    domain: "waves-optics",
    definition:
      "The factor by which light slows in a medium, setting how sharply rays bend at interfaces.",
    math: String.raw`n = c/v`,
    seeAlso: ["snells-law", "thin-lenses"],
  },
  {
    term: "Resonance",
    domain: "waves-optics",
    definition:
      "The dramatic response of a system driven near its natural frequency, storing input energy cycle after cycle.",
    seeAlso: ["harmonic-oscillator", "standing-waves"],
  },
  {
    term: "Superposition",
    domain: "waves-optics",
    definition:
      "The rule that overlapping waves simply add their displacements point by point, then carry on unchanged.",
    seeAlso: ["wave-interference", "standing-waves"],
  },
  {
    term: "Wavelength",
    domain: "waves-optics",
    definition:
      "The distance between successive crests, tied to speed and frequency by v = fλ.",
    seeAlso: ["standing-waves"],
  },
  {
    term: "Wavenumber",
    domain: "waves-optics",
    definition:
      "Spatial frequency — radians of phase per metre — describing how rapidly a wave alternates across space.",
    math: String.raw`k = 2\pi/\lambda`,
    seeAlso: ["fourier-sound"],
  },

  {
    term: "Ampère’s law",
    domain: "electromagnetism",
    definition:
      "A current’s magnetic field circulates around it, with the field’s line integral set by the enclosed current.",
    math: String.raw`\oint \vec{B}\cdot d\vec{l} = \mu_0 I_{\text{enc}}`,
    seeAlso: ["magnetic-dipole"],
  },
  {
    term: "Capacitance",
    domain: "electromagnetism",
    definition:
      "Charge stored per volt across a capacitor, fixed by geometry and the insulating material between plates.",
    math: String.raw`C = Q/V`,
    seeAlso: ["lc-circuit"],
  },
  {
    term: "Coulomb’s law",
    domain: "electromagnetism",
    definition:
      "Point charges attract or repel along the line joining them, with strength falling as the square of their separation.",
    math: String.raw`F = k_e\,\frac{q_1 q_2}{r^2}`,
    seeAlso: ["electric-fields"],
  },
  {
    term: "Electric field",
    domain: "electromagnetism",
    definition:
      "Force per unit charge defined at every point in space, ready to act on any charge placed there.",
    math: String.raw`\vec{E} = \vec{F}/q`,
    seeAlso: ["electric-fields"],
  },
  {
    term: "Electromotive force",
    domain: "electromagnetism",
    definition:
      "Energy delivered per unit charge by a source or a changing magnetic flux; despite the name, it drives current rather than pushing mechanically.",
    math: String.raw`\varepsilon = -N\,\frac{d\Phi}{dt}`,
    seeAlso: ["electromagnetic-induction"],
  },
  {
    term: "Field line",
    domain: "electromagnetism",
    definition:
      "A curve tangent to the field everywhere, whose density encodes strength; electric lines run positive to negative while magnetic lines close on themselves.",
    seeAlso: ["electric-fields", "magnetic-dipole"],
  },
  {
    term: "Inductance",
    domain: "electromagnetism",
    definition:
      "A coil’s resistance to changing current — flux linked per ampere — storing magnetic energy as the flow builds.",
    math: String.raw`U = \tfrac{1}{2}LI^2`,
    seeAlso: ["lc-circuit"],
  },
  {
    term: "Lenz’s law",
    domain: "electromagnetism",
    definition:
      "Induced currents always oppose the change in flux that produces them, nature’s bookkeeping for energy conservation.",
    seeAlso: ["electromagnetic-induction"],
  },
  {
    term: "Magnetic dipole moment",
    domain: "electromagnetism",
    definition:
      "The measure of a loop’s or magnet’s strength in a field; the field exerts a torque trying to align the moment with itself.",
    seeAlso: ["magnetic-dipole"],
  },
  {
    term: "Magnetic flux",
    domain: "electromagnetism",
    definition:
      "The amount of magnetic field threading a surface, whose rate of change drives an induced EMF.",
    math: String.raw`\Phi_B = \int \vec{B}\cdot d\vec{A}`,
    seeAlso: ["electromagnetic-induction"],
  },
  {
    term: "Permeability",
    domain: "electromagnetism",
    definition:
      "How readily a medium carries magnetic field lines, amplifying or weakening the field a given current produces.",
    seeAlso: ["magnetic-dipole"],
  },
  {
    term: "Permittivity",
    domain: "electromagnetism",
    definition:
      "How strongly a medium resists electric field formation, weakening the force between charges embedded within it.",
    seeAlso: ["electric-fields"],
  },

  {
    term: "Adiabatic process",
    domain: "thermo-statistical",
    definition:
      "Compression or expansion with no heat exchanged, trading work directly for temperature change.",
    math: String.raw`PV^{\gamma} = \text{const}`,
    seeAlso: ["carnot-cycle"],
  },
  {
    term: "Brownian motion",
    domain: "thermo-statistical",
    definition:
      "The erratic jitter of small particles bombarded unevenly by surrounding molecules — the visible fingerprint of molecular chaos.",
    seeAlso: ["diffusion-random-walk"],
  },
  {
    term: "Carnot efficiency",
    domain: "thermo-statistical",
    definition:
      "The maximum fraction of heat any engine cycling between two temperatures can convert into work.",
    math: String.raw`\eta = 1 - T_c/T_h`,
    seeAlso: ["carnot-cycle"],
  },
  {
    term: "Enthalpy",
    domain: "thermo-statistical",
    definition:
      "Internal energy plus pressure times volume — the bookkeeping quantity for processes held at constant pressure.",
    math: String.raw`H = U + PV`,
    seeAlso: ["ideal-gas"],
  },
  {
    term: "Entropy",
    domain: "thermo-statistical",
    definition:
      "The logarithmic count of microscopic arrangements behind a macroscopic state; isolated systems evolve toward larger counts.",
    math: String.raw`S = k_B \ln W`,
    seeAlso: ["maxwell-demon", "carnot-cycle"],
  },
  {
    term: "Heat capacity",
    domain: "thermo-statistical",
    definition:
      "The energy needed to raise a body’s temperature by one degree, larger when energy hides in extra degrees of freedom.",
    seeAlso: ["ideal-gas"],
  },
  {
    term: "Isothermal process",
    domain: "thermo-statistical",
    definition:
      "Compression or expansion slow enough that temperature stays pinned by a heat reservoir throughout.",
    seeAlso: ["carnot-cycle", "ideal-gas"],
  },
  {
    term: "Maxwell–Boltzmann distribution",
    domain: "thermo-statistical",
    definition:
      "The characteristic spread of molecular speeds in a gas, rising steeply from zero and trailing off in a long tail set by temperature.",
    seeAlso: ["ideal-gas"],
  },
  {
    term: "Mean free path",
    domain: "thermo-statistical",
    definition:
      "The average distance a molecule flies between collisions, shrinking as the gas becomes more crowded.",
    seeAlso: ["diffusion-random-walk"],
  },
  {
    term: "Partition function",
    domain: "thermo-statistical",
    definition:
      "The Boltzmann-weighted sum over a system’s possible energies, from which every thermodynamic quantity can in principle be derived.",
    math: String.raw`Z = \sum_i e^{-E_i/k_B T}`,
    seeAlso: ["ideal-gas"],
  },
  {
    term: "Thermal equilibrium",
    domain: "thermo-statistical",
    definition:
      "The settled condition in which exchanging bodies share one temperature; the basis of what a thermometer measures.",
    seeAlso: ["ideal-gas"],
  },

  {
    term: "Event",
    domain: "relativity",
    definition:
      "A single point in spacetime — a place and a time together — the atomic unit of relativistic bookkeeping.",
    seeAlso: ["twin-paradox"],
  },
  {
    term: "Invariant interval",
    domain: "relativity",
    definition:
      "The spacetime separation every observer agrees on, mixing squares of time and distance into one signed quantity.",
    math: String.raw`s^2 = c^2t^2 - x^2`,
    seeAlso: ["special-relativity", "twin-paradox"],
  },
  {
    term: "Length contraction",
    domain: "relativity",
    definition:
      "Moving objects shorten along their direction of travel by exactly the factor their clocks slow down.",
    math: String.raw`L = L_0/\gamma`,
    seeAlso: ["special-relativity"],
  },
  {
    term: "Lorentz factor",
    domain: "relativity",
    definition:
      "The universal stretch factor of special relativity, growing without bound as speed approaches light speed.",
    math: String.raw`\gamma = \frac{1}{\sqrt{1-\beta^2}}`,
    seeAlso: ["special-relativity"],
  },
  {
    term: "Mass–energy equivalence",
    domain: "relativity",
    definition:
      "Rest mass is frozen energy; releasing even a single gram unlocks kiloton-scale output.",
    math: String.raw`E = mc^2`,
    seeAlso: ["special-relativity"],
  },
  {
    term: "Minkowski spacetime",
    domain: "relativity",
    definition:
      "The flat four-dimensional stage on which space and time coordinates mix under rotation-like boosts between frames.",
    seeAlso: ["twin-paradox", "special-relativity"],
  },
  {
    term: "Proper time",
    domain: "relativity",
    definition:
      "Time read by a clock carried along a worldline — the least aging any route between two events can record.",
    seeAlso: ["twin-paradox", "special-relativity"],
  },
  {
    term: "Relativity of simultaneity",
    domain: "relativity",
    definition:
      "Observers in relative motion disagree about whether distant events happened at the same time.",
    seeAlso: ["special-relativity"],
  },
  {
    term: "Time dilation",
    domain: "relativity",
    definition:
      "A moving clock ticks slower by the Lorentz factor compared with clocks at rest in the observer’s frame.",
    seeAlso: ["special-relativity", "twin-paradox"],
  },
  {
    term: "Worldline",
    domain: "relativity",
    definition:
      "The full history of an object traced as a curve through spacetime, tilted less steeply than light’s path for anything massive.",
    seeAlso: ["twin-paradox"],
  },

  {
    term: "Decoherence",
    domain: "quantum",
    definition:
      "The leakage of quantum phase information into an environment, turning superpositions into everyday either-or outcomes without any observer.",
    seeAlso: ["quantum-double-slit"],
  },
  {
    term: "Eigenvalue",
    domain: "quantum",
    definition:
      "One of the definite results an observable can return, paired with a state the measuring action leaves unchanged.",
    seeAlso: ["heisenberg-uncertainty"],
  },
  {
    term: "Entanglement",
    domain: "quantum",
    definition:
      "Correlations stronger than any classical scheme allows, binding the outcomes of distant particles into one indivisible state.",
    seeAlso: ["quantum-double-slit"],
  },
  {
    term: "Measurement problem",
    domain: "quantum",
    definition:
      "The unresolved question of why and how definite outcomes emerge from smooth quantum evolution upon observation.",
    seeAlso: ["quantum-double-slit"],
  },
  {
    term: "Operator",
    domain: "quantum",
    definition:
      "An action on a wavefunction — differentiate, multiply, rotate — whose algebraic properties encode measurable quantities like position or momentum.",
    seeAlso: ["heisenberg-uncertainty"],
  },
  {
    term: "Orbital",
    domain: "quantum",
    definition:
      "A stationary energy state of an electron bound in an atom, pictured as a cloud of probable positions around the nucleus.",
  },
  {
    term: "Planck constant",
    domain: "quantum",
    definition:
      "The quantum of action fixing the scale at which energy arrives in discrete lumps.",
    math: String.raw`E = h\nu`,
  },
  {
    term: "Probability amplitude",
    domain: "quantum",
    definition:
      "A complex number whose squared magnitude gives the chance of finding a particle somewhere; amplitudes add first and square afterward, enabling interference.",
    math: String.raw`P = |\psi|^2`,
    seeAlso: ["quantum-double-slit"],
  },
  {
    term: "Quantum superposition",
    domain: "quantum",
    definition:
      "A single state combining alternatives — paths, spins, energies — until measurement forces a definite outcome.",
    seeAlso: ["quantum-double-slit"],
  },
  {
    term: "Spin",
    domain: "quantum",
    definition:
      "Intrinsic angular momentum carried by particles independent of any physical rotation, quantized in half-integer or integer units.",
  },
  {
    term: "Uncertainty principle",
    domain: "quantum",
    definition:
      "Position and momentum cannot both be sharp; squeezing one inevitably widens the other.",
    math: String.raw`\Delta x\,\Delta p \geq \hbar/2`,
    seeAlso: ["heisenberg-uncertainty"],
  },
  {
    term: "Quantum tunneling",
    domain: "quantum",
    definition:
      "The appearance of particles inside classically forbidden regions, powered by the finite width of quantum wavefunctions.",
    math: String.raw`T \approx e^{-2\kappa a}`,
    seeAlso: ["quantum-tunneling"],
  },

  {
    term: "Attractor",
    domain: "chaos-complexity",
    definition:
      "The long-run pattern a system settles onto — a point, a loop, or something stranger — regardless of fine details of the start.",
    seeAlso: ["logistic-map"],
  },
  {
    term: "Bifurcation",
    domain: "chaos-complexity",
    definition:
      "A qualitative split in behavior triggered by easing one parameter past a threshold, doubling rhythms or spawning new equilibria.",
    math: String.raw`r_{\infty} \approx 3.57`,
    seeAlso: ["logistic-map"],
  },
  {
    term: "Deterministic chaos",
    domain: "chaos-complexity",
    definition:
      "Random-looking evolution produced by fixed rules and exact initial data, with no dice anywhere in the machinery.",
    seeAlso: ["double-pendulum", "logistic-map"],
  },
  {
    term: "Limit cycle",
    domain: "chaos-complexity",
    definition:
      "A closed trajectory in phase space that neighboring paths wind toward — the signature of stable self-sustained oscillation.",
    seeAlso: ["logistic-map"],
  },
  {
    term: "Lyapunov exponent",
    domain: "chaos-complexity",
    definition:
      "The exponential rate at which neighboring trajectories pull apart; a positive value is the defining mark of chaos.",
    math: String.raw`\delta(t) \approx \delta_0\,e^{\lambda t}`,
    seeAlso: ["double-pendulum"],
  },
  {
    term: "Nonlinearity",
    domain: "chaos-complexity",
    definition:
      "Feedback in which outputs steer inputs, making the whole behave unlike the sum of its parts and ruling out simple superposition of solutions.",
    seeAlso: ["three-body"],
  },
  {
    term: "Period doubling",
    domain: "chaos-complexity",
    definition:
      "The cascade in which a steady rhythm halves its period again and again on the road to full chaos.",
    seeAlso: ["logistic-map"],
  },
  {
    term: "Phase space",
    domain: "chaos-complexity",
    definition:
      "The abstract arena whose axes span all of a system’s variables, one point per complete state, trajectories tracing out possible futures.",
    seeAlso: ["three-body", "double-pendulum"],
  },
  {
    term: "Sensitive dependence",
    domain: "chaos-complexity",
    definition:
      "Exponential divergence of initially close states — the butterfly effect — capping how far ahead any forecast can reach.",
    seeAlso: ["double-pendulum", "three-body"],
  },
  {
    term: "Strange attractor",
    domain: "chaos-complexity",
    definition:
      "A fractal set that trajectories never leave yet never repeat on, folding structure into infinitely fine detail.",
    seeAlso: ["double-pendulum"],
  },

  {
    term: "Astronomical unit",
    domain: "astrophysics-cosmology",
    definition:
      "The mean Earth–Sun distance, about 150 million kilometres, serving as the yardstick inside the solar system.",
  },
  {
    term: "Escape velocity",
    domain: "astrophysics-cosmology",
    definition:
      "The launch speed at which kinetic energy exactly cancels gravitational binding, letting a body coast away forever.",
    math: String.raw`v_{\text{esc}} = \sqrt{2GM/r}`,
    seeAlso: ["orbits", "hohmann-transfer"],
  },
  {
    term: "Hubble parameter",
    domain: "astrophysics-cosmology",
    definition:
      "The present fractional expansion rate of the universe, joining recession speed and distance through a single number.",
    math: String.raw`v = H_0 d`,
    seeAlso: ["cosmological-redshift"],
  },
  {
    term: "Lagrange point",
    domain: "astrophysics-cosmology",
    definition:
      "One of five co-rotating sweet spots where gravitational pulls and centrifugal effects balance, parking spacecraft with minimal fuel.",
    seeAlso: ["three-body", "hohmann-transfer"],
  },
  {
    term: "Light-year",
    domain: "astrophysics-cosmology",
    definition:
      "The distance light crosses in one year, roughly 9.5 trillion kilometres.",
  },
  {
    term: "Parallax",
    domain: "astrophysics-cosmology",
    definition:
      "The apparent shift of a nearby star against the background sky as Earth circles the Sun, converting directly into distance.",
  },
  {
    term: "Parsec",
    domain: "astrophysics-cosmology",
    definition:
      "The distance at which Earth’s orbit subtends one arcsecond of parallax — about 3.26 light-years — the professional yardstick of stellar astronomy.",
  },
  {
    term: "Redshift",
    domain: "astrophysics-cosmology",
    definition:
      "The stretching of light to longer wavelengths, caused by recession through space, gravity, or the expansion of space itself.",
    math: String.raw`1+z = \lambda_{\text{obs}}/\lambda_{\text{emit}}`,
    seeAlso: ["cosmological-redshift"],
  },
  {
    term: "Scale factor",
    domain: "astrophysics-cosmology",
    definition:
      "The growing function multiplying all comoving distances, recording how large the universe is at each moment of cosmic time.",
    seeAlso: ["cosmological-redshift"],
  },
  {
    term: "Semi-major axis",
    domain: "astrophysics-cosmology",
    definition:
      "Half of an orbit’s longest diameter — the single parameter that fixes its period through Kepler’s third law.",
    seeAlso: ["kepler-laws", "hohmann-transfer"],
  },
  {
    term: "Vis-viva equation",
    domain: "astrophysics-cosmology",
    definition:
      "The living-force relation giving orbital speed from current distance and the ellipse’s semi-major axis alone.",
    math: String.raw`v^2 = GM\left(\frac{2}{r}-\frac{1}{a}\right)`,
    seeAlso: ["hohmann-transfer", "kepler-laws"],
  },
];
