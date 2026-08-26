import type { AnatomyPart } from "./types";

export const snellsLawAnatomy: Record<number, AnatomyPart[]> = {
  0: [
    {
      tex: String.raw`n_1`,
      label: "Index n₁",
      meaning: "Refractive index of the upper tinted medium from the Index n₁ slider, water’s 1.33 by default.",
      value: "1.33",
    },
    {
      tex: String.raw`\sin\theta_1`,
      label: "Incident sine",
      meaning: "Sine of the Angle θ₁ slider, aimed 35° off the dashed normal at the default.",
      value: "0.574",
    },
    { tex: "=", glue: true },
    {
      tex: String.raw`n_2`,
      label: "Index n₂",
      meaning: "Index of the lower tinted medium from the Index n₂ slider, glass’s 1.50 by default.",
      value: "1.50",
    },
    {
      tex: String.raw`\sin\theta_2`,
      label: "Refracted sine",
      meaning: "Sine of the transmitted ray’s bend, reported as θ₂ = 30.6° in the footnote for those defaults.",
      value: "0.509",
    },
  ],
  1: [
    {
      tex: String.raw`\theta_c`,
      label: "Critical angle",
      meaning: "Incident angle beyond which the amber TOTAL INTERNAL REFLECTION badge lights and the refracted ray vanishes.",
      value: "62.5",
      unit: "°",
    },
    { tex: "=", glue: true },
    {
      tex: String.raw`\arcsin(n_2/n_1)`,
      label: "Dense-to-rare ratio",
      meaning: "Exists only while n₁ > n₂, so the Critical angle demo sweeps glass 1.50 toward water 1.33 at a ratio of 0.887.",
      value: "0.887",
    },
  ],
  2: [
    {
      tex: String.raw`n`,
      label: "Refractive index",
      meaning: "Speed tax a material charges light, dialed per medium by the two index sliders.",
      value: "1.50",
    },
    { tex: "=", glue: true },
    {
      tex: String.raw`c`,
      label: "Vacuum light speed",
      meaning: "The universal speed limit light enjoys in empty space.",
      value: "3.00×10⁸",
      unit: "m/s",
    },
    { tex: "/", glue: true },
    {
      tex: String.raw`v`,
      label: "Medium light speed",
      meaning: "Slower crawl through glass whose mismatch steers rays at the interface above.",
      value: "2.00×10⁸",
      unit: "m/s",
    },
  ],
};
