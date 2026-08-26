import type { AnatomyPart } from "./types";

export const coupledModesAnatomy: Record<number, AnatomyPart[]> = {
  0: [
    {
      tex: String.raw`\omega_{+}`,
      label: "Symmetric frequency",
      meaning:
        "Both masses sway together and the middle spring never stretches, so the pair rings as if the coupler were absent.",
      value: "2.83",
      unit: "rad/s",
    },
    { tex: String.raw`=`, glue: true },
    {
      tex: String.raw`\sqrt{\frac{k}{m}}`,
      label: "One-spring root",
      meaning:
        "Eight newtons per meter acting on each one-kilogram mass, wall spring only.",
      value: "8",
      unit: "s⁻²",
    },
    { tex: String.raw`,`, glue: true },
    { tex: String.raw`\quad`, glue: true },
    {
      tex: String.raw`\omega_{-}`,
      label: "Antisymmetric frequency",
      meaning:
        "Masses counter-move so the middle spring stretches twice as hard — the stiffer pattern rings faster in the sim.",
      value: "4.90",
      unit: "rad/s",
    },
    { tex: String.raw`=`, glue: true },
    {
      tex: String.raw`\sqrt{\frac{3k}{m}}`,
      label: "Three-spring root",
      meaning:
        "Each mass effectively feels its own wall spring plus two halves of the center coupler.",
      value: "24",
      unit: "s⁻²",
    },
  ],
  1: [
    {
      tex: String.raw`q_{\pm}`,
      label: "Normal coordinates",
      meaning:
        "The two patterns whose amplitudes show up in the Mode ghosts bars; every wiggle of the pair is a blend of just these.",
      value: "0.08 and 0.02",
      unit: "m",
    },
    { tex: String.raw`=`, glue: true },
    {
      tex: String.raw`\tfrac{1}{2}`,
      label: "One half",
      meaning:
        "Halving turns plain sums and differences into honest averages of the two positions.",
      value: "0.5",
    },
    { tex: String.raw`(`, glue: true },
    {
      tex: String.raw`x_1`,
      label: "First mass position",
      meaning:
        "Left displacement, set by the Pull mass 1 slider before release.",
      value: "0.10",
      unit: "m",
    },
    { tex: String.raw`\pm`, glue: true },
    {
      tex: String.raw`x_2`,
      label: "Second mass position",
      meaning:
        "Right displacement, set by the Pull mass 2 slider; same sign feeds the symmetric ghost, opposite the antisymmetric one.",
      value: "0.06",
      unit: "m",
    },
    { tex: String.raw`)`, glue: true },
  ],
  2: [
    {
      tex: String.raw`T_{\text{beat}}`,
      label: "Beat period",
      meaning:
        "Time for a full slosh: one mass goes quiet while the other swings hardest, then they trade places again.",
      value: "3.03",
      unit: "s",
    },
    { tex: String.raw`=`, glue: true },
    {
      tex: String.raw`\frac{2\pi}{|\omega_- - \omega_+|}`,
      label: "Circle over mode split",
      meaning:
        "The 2.07 rad/s gap between modes sets the drumbeat of energy exchange; raise Stiffness k and the beats quicken.",
      value: "2.07",
      unit: "rad/s",
    },
  ],
};
