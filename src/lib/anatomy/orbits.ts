import type { AnatomyPart } from "./types";

export const orbitsAnatomy: Record<number, AnatomyPart[]> = {
  0: [
    {
      tex: String.raw`\vec{F}`,
      label: "Gravitational force",
      meaning:
        "The pull that bends every drag-launched planet’s trail around the golden central star.",
      value: "8700",
      unit: "N",
    },
    { tex: String.raw`=`, glue: true },
    {
      tex: String.raw`G`,
      label: "Gravitational constant",
      meaning:
        "Gravity’s universal coupling strength, tiny because everyday masses barely attract each other.",
      value: "6.674 × 10⁻¹¹",
      unit: "N·m²/kg²",
    },
    {
      tex: String.raw`\frac{m_1 m_2}{r^2}`,
      label: "Mass product over squared distance",
      meaning:
        "Double either mass and the pull doubles; double the gap and it falls to a quarter, which is why distant planets coast nearly straight.",
      value: "1.30 × 10¹⁴",
      unit: "kg²/m²",
    },
    {
      tex: String.raw`\hat{r}`,
      label: "Radial unit vector",
      meaning:
        "An arrow of length one along the line from star to planet, keeping the force pointed exactly between the two.",
      value: "1",
    },
  ],
  1: [
    {
      tex: String.raw`v^2`,
      label: "Orbital speed squared",
      meaning:
        "What the live vis-viva row under the canvas reports for the last planet you launched.",
      value: "5.89 × 10⁷",
      unit: "m²/s²",
    },
    { tex: String.raw`=`, glue: true },
    {
      tex: String.raw`GM`,
      label: "Standard gravitational parameter",
      meaning:
        "The star’s gravitational muscle; the playground sets GM to one, while Earth carries this value.",
      value: "3.986 × 10¹⁴",
      unit: "m³/s²",
    },
    { tex: String.raw`\left(`, glue: true },
    {
      tex: String.raw`\frac{2}{r}`,
      label: "Twice the inverse current distance",
      meaning:
        "Grows as the planet dives closer, which is why the velocity arrow lengthens sharply near the star.",
      value: "2.95 × 10⁻⁷",
      unit: "1/m",
    },
    { tex: String.raw`-`, glue: true },
    {
      tex: String.raw`\frac{1}{a}`,
      label: "Inverse semi-major axis",
      meaning:
        "a is the semi-major axis — half the longest diameter of the ellipse the Predicted path preview draws.",
      value: "1.48 × 10⁻⁷",
      unit: "1/m",
    },
    { tex: String.raw`\right)`, glue: true },
  ],
  2: [
    {
      tex: String.raw`L`,
      label: "Angular momentum",
      meaning:
        "Per kilogram of planet, conserved along the orbit — the reason trails sweep equal areas in equal times.",
      value: "5.19 × 10¹⁰",
      unit: "m²/s",
    },
    { tex: String.raw`=`, glue: true },
    { tex: String.raw`\lvert`, glue: true },
    {
      tex: String.raw`\vec{r}`,
      label: "Position from the star",
      meaning:
        "The r in the live readout: a longer lever arm from the star means proportionally more angular momentum.",
      value: "6.77 × 10⁶",
      unit: "m",
    },
    { tex: String.raw`\times`, glue: true },
    {
      tex: String.raw`\vec{v}`,
      label: "Velocity",
      meaning:
        "Only the sideways part of the velocity arrow counts; plunging straight at the star contributes nothing.",
      value: "7.67 × 10³",
      unit: "m/s",
    },
    { tex: String.raw`\rvert`, glue: true },
  ],
  3: [
    {
      tex: String.raw`v_{\text{esc}}`,
      label: "Escape speed",
      meaning:
        "Launch faster than this during a drag and the planet gets the green rim, leaving the star forever.",
      value: "10.9",
      unit: "km/s",
    },
    { tex: String.raw`=`, glue: true },
    {
      tex: String.raw`\sqrt{\frac{2GM}{r}}`,
      label: "Square root of twice the binding depth",
      meaning:
        "Kinetic energy exactly cancelling the negative gravitational potential; bodies at or above it wear the escaper ring in the sim.",
      value: "1.18 × 10⁸",
      unit: "m²/s²",
    },
  ],
};
