import type { AnatomyPart } from "./types";

export const specialRelativityAnatomy: Record<number, AnatomyPart[]> = {
  19: [
    {
      tex: String.raw`\gamma`,
      label: "Lorentz factor",
      meaning:
        "The multiplier behind every dilation and contraction in the lab — at “Speed β” set to 0.8 it reads 1.667.",
      value: "1.667",
      unit: "dimensionless",
    },
    { tex: String.raw` = `, glue: true },
    {
      tex: String.raw`\frac{1}{\sqrt{1-\beta^2}}`,
      label: "Light-clock stretch",
      meaning:
        "The moving photon’s slanted diagonal over the resting clock’s vertical bounce — 1/√(1−0.64) = 1.667 at β = 0.8.",
      value: "1.667",
      unit: "dimensionless",
    },
    { tex: String.raw`,\quad `, glue: true },
    {
      tex: String.raw`\beta`,
      label: "Speed β",
      meaning:
        "The slider’s fraction of light speed; 0.8 means 240,000 km/s, and γ swells past seven only near 0.99.",
      value: "0.8",
      unit: "dimensionless",
    },
    { tex: String.raw` = `, glue: true },
    {
      tex: String.raw`\frac{v}{c}`,
      label: "Speed over light speed",
      meaning:
        "Any v below the 299,792 km/s promise light keeps maps into the open interval from 0 to 1.",
      value: "0.8",
      unit: "dimensionless",
    },
  ],
  20: [
    {
      tex: String.raw`\Delta t_{\text{lab}}`,
      label: "Lab-frame elapsed time",
      meaning:
        "What your resting clock logs while the moving clock completes one of its stretched tick rows — 1.667 s per proper second at β = 0.8.",
      value: "1.667",
      unit: "s",
    },
    { tex: String.raw` = `, glue: true },
    {
      tex: String.raw`\gamma`,
      label: "Lorentz factor",
      meaning:
        "The same 1.667 that γ takes at β = 0.8 appears here as the gap-widening rate between the two tick rows.",
      value: "1.667",
      unit: "dimensionless",
    },
    { tex: String.raw`\,`, glue: true },
    {
      tex: String.raw`\Delta\tau`,
      label: "Proper time on the moving clock",
      meaning:
        "One second of the traveler’s own bouncing-photon clock, which “Sync flashes” sets against yours.",
      value: "1",
      unit: "s",
    },
  ],
  21: [
    {
      tex: String.raw`L`,
      label: "Contracted length",
      meaning:
        "The squashed solid rod you see when “Length contraction” is toggled on at β = 0.8.",
      value: "6",
      unit: "m",
    },
    { tex: String.raw` = `, glue: true },
    {
      tex: String.raw`\frac{L_0}{\gamma}`,
      label: "Rest length over Lorentz factor",
      meaning:
        "A 10 m rod sliding by at β = 0.8 divides by 1.667 to leave 6.0 m along its motion, while any height across it stays untouched.",
      value: "6",
      unit: "m",
    },
  ],
};
