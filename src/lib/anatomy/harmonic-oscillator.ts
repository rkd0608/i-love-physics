import type { AnatomyPart } from "./types";

export const harmonicOscillatorAnatomy: Record<number, AnatomyPart[]> = {
  0: [
    {
      tex: String.raw`\omega_0`,
      label: "Natural frequency",
      meaning:
        "The clock rate of the undamped wobble; stiffen Stiffness k or lighten Mass m and the strip chart scrolls faster.",
      value: "4.90",
      unit: "rad/s",
    },
    { tex: String.raw`=`, glue: true },
    {
      tex: String.raw`\sqrt{\frac{k}{m}}`,
      label: "Stiffness over inertia",
      meaning:
        "Twelve newtons per meter pushing half a kilogram rings about 0.78 times each second.",
      value: "24",
      unit: "s⁻²",
    },
  ],
  1: [
    {
      tex: String.raw`x(t)`,
      label: "Displacement",
      meaning:
        "The mass position traced on the strip chart between the hatched walls.",
      value: "0.08",
      unit: "m",
    },
    { tex: String.raw`=`, glue: true },
    {
      tex: String.raw`e^{-\gamma t}`,
      label: "Decay envelope",
      meaning:
        "The exponential lid over the whole wiggle; raise Damping γ and it slams shut within a cycle or two.",
      value: "0.45 at t = 1 s",
    },
    { tex: String.raw`\left[`, glue: true },
    {
      tex: String.raw`x_0\cos(\omega' t)`,
      label: "Release-position swing",
      meaning:
        "Starts at the pulled-back amplitude and rings at the damped rate ω′ rather than the ghost rate.",
      value: "0.08 at t = 0",
      unit: "m",
    },
    { tex: String.raw`+`, glue: true },
    {
      tex: String.raw`\frac{v_0 + \gamma x_0}{\omega'}\sin(\omega' t)`,
      label: "Initial-velocity swing",
      meaning:
        "Extra push from releasing a moving mass, nudged further by damping acting on where you released.",
      value: "0.05 at t = 0",
      unit: "m",
    },
    { tex: String.raw`\right]`, glue: true },
  ],
  2: [
    {
      tex: String.raw`\omega'`,
      label: "Damped frequency",
      meaning:
        "Slightly slower than the Undamped ghost, whose crests visibly pull ahead late in a run.",
      value: "4.83",
      unit: "rad/s",
    },
    { tex: String.raw`=`, glue: true },
    {
      tex: String.raw`\sqrt{\omega_0^2 - \gamma^2}`,
      label: "Corrected root",
      meaning:
        "Damping squared subtracted from natural frequency squared; push γ past ω₀ and ringing stops entirely — no real root, no oscillation.",
      value: "23.36",
      unit: "s⁻²",
    },
  ],
  3: [
    {
      tex: String.raw`Q`,
      label: "Quality factor",
      meaning:
        "Counts radians of swing before energy falls by e; near three here means the trace is gone after roughly one ring.",
      value: "3.06",
    },
    { tex: String.raw`=`, glue: true },
    {
      tex: String.raw`\frac{\omega_0}{2\gamma}`,
      label: "Frequency over damping",
      meaning:
        "High Q keeps many visible envelopes on the strip chart; low Q collapses to a dead thud.",
      value: "4.90 / 1.60",
    },
  ],
};
