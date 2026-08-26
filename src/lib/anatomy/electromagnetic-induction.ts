import type { AnatomyPart } from "./types";

export const electromagneticInductionAnatomy: Record<number, AnatomyPart[]> = {
  61: [
    {
      tex: String.raw`\Phi`,
      label: "Flux through the coil",
      meaning: "The dashed overlay curve that peaks exactly as the magnet passes the coil’s centre.",
      value: "2.8×10⁻⁵",
      unit: "Wb",
    },
    { tex: " = ", glue: true },
    { tex: String.raw`\int `, glue: true },
    {
      tex: String.raw`\vec{B} \cdot d\vec{A}`,
      label: "Piercing field",
      meaning: "Only threads perpendicular to the loop count — about ten milliteslas averaged over the coil’s 2.8×10⁻³ m² face.",
      value: "0.01",
      unit: "T",
    },
  ],
  62: [
    {
      tex: String.raw`\varepsilon`,
      label: "Induced EMF",
      meaning: "The oscilloscope spike as the magnet enters, mirrored on exit with a dead zero between.",
      value: "0.028",
      unit: "V",
    },
    { tex: " = ", glue: true },
    { tex: "-", glue: true },
    {
      tex: "N",
      label: "Coil turns",
      meaning: "Turns wound on the copper ring — slide “Coil turns N” from 1 to 50 and the surge grows fiftyfold.",
      value: "50",
      unit: "turns",
    },
    {
      tex: String.raw`\frac{d\Phi}{dt}`,
      label: "Flux rate",
      meaning: "The steepness of the flux trace at each instant, sharpest at entry and exit.",
      value: "5.6×10⁻⁴",
      unit: "V",
    },
  ],
  63: [
    {
      tex: String.raw`\text{induced } I`,
      label: "Lenz current",
      meaning: "The circulating arrow around the winding that flips direction precisely at the centre crossing.",
      value: "5.6×10⁻⁴",
      unit: "A",
    },
    { tex: String.raw` \text{ opposes } `, glue: true },
    {
      tex: String.raw`d\Phi`,
      label: "Flux change",
      meaning: "Whichever way the flux needle moves, this push always argues against that move.",
      value: "2.8×10⁻⁵",
      unit: "Wb",
    },
  ],
};
