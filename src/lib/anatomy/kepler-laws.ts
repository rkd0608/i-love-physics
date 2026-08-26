import type { AnatomyPart } from "./types";

export const keplerLawsAnatomy: Record<number, AnatomyPart[]> = {
  0: [
    {
      tex: String.raw`\frac{dA}{dt}`,
      label: "Areal velocity",
      meaning:
        "How fast the sun–planet wedge sweeps area, with the HUD showing measured and theoretical values agreeing.",
      value: "≈ 4930 px²/s at a = 160, e = 0.5",
      unit: "px²/s",
    },
    { tex: String.raw` = `, glue: true },
    {
      tex: String.raw`\text{constant}`,
      label: "Conserved value",
      meaning:
        "The same rate near fast perihelion arcs and slow aphelion arcs is the equal-areas law in action.",
      value: "πab/T ≈ 4930 everywhere on the ellipse",
      unit: "px²/s",
    },
  ],
  1: [
    {
      tex: String.raw`T^2`,
      label: "Period squared",
      meaning:
        "One full lap of the planet; the comparison table lists it for the main and ghost orbits.",
      value: "T = 14.13 s at a = 160 px, so T² ≈ 200 s²",
      unit: "s²",
    },
    { tex: String.raw` = `, glue: true },
    {
      tex: String.raw`\frac{4\pi^2 a^3}{GM}`,
      label: "Mass–axis law",
      meaning:
        "Doubling the semi-major axis stretches the period by 2^{3/2} ≈ 2.83, Kepler’s third law in one line.",
      value: "GM = 810000 px³/s² in this sim’s units",
      unit: "s² per px³",
    },
  ],
  2: [
    {
      tex: String.raw`r`,
      label: "Sun distance",
      meaning:
        "Radial distance from the focus where the glowing sun sits, tracked by the P and A tick marks at the extremes.",
      value: "80 px at perihelion, 240 px at aphelion",
      unit: "px",
    },
    { tex: String.raw` = `, glue: true },
    {
      tex: String.raw`\frac{a(1-e^2)}{1 + e\cos\theta}`,
      label: "Conic orbit",
      meaning:
        "One polar formula draws every bound conic; e = 0.5 gives the ellipse on screen and e = 0 would be a circle.",
      value: "numerator a(1 − e²) = 120 px at defaults",
      unit: "px",
    },
  ],
};
