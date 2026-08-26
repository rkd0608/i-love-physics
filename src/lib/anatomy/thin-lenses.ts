import type { AnatomyPart } from "./types";

export const thinLensesAnatomy: Record<number, AnatomyPart[]> = {
  0: [
    {
      tex: String.raw`\frac{1}{f}`,
      label: "Focal power",
      meaning: "Inverse of the Focal length f slider, 120 px by default, measuring how hard the lens bends rays.",
      value: "0.0083",
      unit: "px⁻¹",
    },
    { tex: "=", glue: true },
    {
      tex: String.raw`\frac{1}{d_o}`,
      label: "Object term",
      meaning: "Reciprocal of the Object distance d_o slider, which holds the amber arrow 250 px left of the lens.",
      value: "0.0040",
      unit: "px⁻¹",
    },
    { tex: "+", glue: true },
    {
      tex: String.raw`\frac{1}{d_i}`,
      label: "Image term",
      meaning: "Reciprocal image distance the sim solves to 230.8 px, landing the red arrow on the far side with a REAL badge.",
      value: "0.0043",
      unit: "px⁻¹",
    },
  ],
  1: [
    {
      tex: String.raw`m`,
      label: "Magnification",
      meaning: "Image height per object height, printed as m = −0.923× in the footnote for the default geometry.",
      value: "−0.923",
      unit: "×",
    },
    { tex: "=", glue: true },
    {
      tex: String.raw`-\frac{d_i}{d_o}`,
      label: "Signed distance ratio",
      meaning: "The minus sign flips the image arrow upside down whenever d_i is positive, so real images invert while virtual ones stand upright.",
      value: "−230.8 / 250",
    },
  ],
  2: [
    {
      tex: String.raw`\frac{1}{f}`,
      label: "Focal power",
      meaning: "Bending strength the grind delivers, focusing crown glass at about 57.7 mm here.",
      value: "0.0173",
      unit: "mm⁻¹",
    },
    { tex: "=", glue: true },
    {
      tex: String.raw`(n-1)`,
      label: "Glass contrast",
      meaning: "Bending survives only because glass slows light relative to air, contributing 0.52 for crown glass.",
      value: "0.52",
    },
    {
      tex: String.raw`\left(\frac{1}{R_1} - \frac{1}{R_2}\right)`,
      label: "Curvature term",
      meaning: "Front surface curved at +60 mm against a back surface at −60 mm on a symmetric biconvex blank.",
      value: "0.0333",
      unit: "mm⁻¹",
    },
  ],
};
