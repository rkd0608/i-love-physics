import type { AnatomyPart } from "./types";

export const electricFieldsAnatomy: Record<number, AnatomyPart[]> = {
  55: [
    {
      tex: String.raw`\vec{E}`,
      label: "Field vector",
      meaning: "The live probe arrow’s length and heading wherever you sweep it across the charge map.",
      value: "8990",
      unit: "V/m",
    },
    { tex: " = ", glue: true },
    {
      tex: "k",
      label: "Coulomb constant",
      meaning: "The fixed conversion between charge geometry and field strength, identical in every sandbox session.",
      value: "8.99×10⁹",
      unit: "N·m²/C²",
    },
    { tex: String.raw`\,`, glue: true },
    {
      tex: String.raw`\frac{q}{r^2}`,
      label: "Source term",
      meaning: "Drag a charge twice as close to the probe and this quotient quadruples, whipping the arrow around.",
      value: "1.0×10⁻⁶",
      unit: "C/m²",
    },
    { tex: String.raw`\,`, glue: true },
    {
      tex: String.raw`\hat{r}`,
      label: "Radial direction",
      meaning: "Rotates the computed strength onto the line running from the selected charge out to the probe.",
      value: "1",
      unit: "dimensionless",
    },
  ],
  56: [
    {
      tex: String.raw`\vec{F}`,
      label: "Force on charge",
      meaning: "How hard a freshly dropped charge gets kicked the instant it joins the map.",
      value: "2.25×10⁻⁵",
      unit: "N",
    },
    { tex: " = ", glue: true },
    {
      tex: "q",
      label: "Test charge",
      meaning: "The shift-click positive charge you sprinkle onto empty space to feel an existing field.",
      value: "2.5×10⁻⁹",
      unit: "C",
    },
    {
      tex: String.raw`\vec{E}`,
      label: "Local field",
      meaning: "The same probe-arrow strength the map already paints under your cursor.",
      value: "8990",
      unit: "V/m",
    },
  ],
  57: [
    {
      tex: String.raw`\vec{E}_{\text{net}}`,
      label: "Net field",
      meaning: "The single resultant arrow drawn at the probe after every nearby charge weighs in.",
      value: "12400",
      unit: "V/m",
    },
    { tex: " = ", glue: true },
    { tex: String.raw`\sum_i `, glue: true },
    {
      tex: String.raw`\vec{E}_i`,
      label: "Per-charge contribution",
      meaning: "Each draggable charge’s private inverse-square arrow, roughly six thousand volts per metre apiece in the dipole preset.",
      value: "6200",
      unit: "V/m",
    },
  ],
};
