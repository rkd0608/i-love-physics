import type { AnatomyPart } from "./types";

export const diffusionRandomWalkAnatomy: Record<number, AnatomyPart[]> = {
  73: [
    {
      tex: String.raw`\langle x^2 \rangle`,
      label: "Mean squared spread",
      meaning:
        "The ensemble’s variance, which the lab’s footnote checks against the walkers’ measured scatter every few frames.",
      value: "6×10⁻⁸",
      unit: "m²",
    },
    { tex: String.raw` = `, glue: true },
    {
      tex: String.raw`2Dt`,
      label: "Twice diffusivity × time",
      meaning:
        "A dye molecule in water with D = 5×10⁻¹⁰ m²/s spreads to this mean square in one minute — N steps of size s simply add their squares.",
      value: "6×10⁻⁸",
      unit: "m²",
    },
  ],
  74: [
    {
      tex: String.raw`x_{\text{rms}}`,
      label: "Root-mean-square reach",
      meaning:
        "The typical walker’s distance from home after sixty seconds — diffusion is patient because this grows as √t.",
      value: "2.45×10⁻⁴",
      unit: "m",
    },
    { tex: String.raw` = `, glue: true },
    {
      tex: String.raw`\sqrt{2Dt}`,
      label: "Square root of the variance",
      meaning:
        "The same D = 5×10⁻¹⁰ m²/s and t = 60 s from the footnote prediction, now under one radical.",
      value: "6×10⁻⁸",
      unit: "m²",
    },
  ],
  75: [
    {
      tex: String.raw`c(x,t)`,
      label: "Concentration profile",
      meaning:
        "The dashed white overlay drawn live against the binned histogram of ten thousand coin-flip walkers.",
      value: "1.63×10⁷",
      unit: "1/m",
    },
    { tex: String.raw` = `, glue: true },
    {
      tex: String.raw`\frac{n}{\sqrt{4\pi Dt}}`,
      label: "Peak prefactor",
      meaning:
        "Ten thousand conserved walkers divided by a width that grows as √t, so the crest at x = 0 sinks like 1/√t while area under the bell stays fixed.",
      value: "1.63×10⁷",
      unit: "1/m",
    },
    {
      tex: String.raw` e^{-x^2/4Dt}`,
      label: "Gaussian falloff",
      meaning:
        "One x_rms off center the factor has already sunk to e^(−1/2) ≈ 0.61 of the peak.",
      value: "0.607",
      unit: "dimensionless",
    },
  ],
};
