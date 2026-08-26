import type { AnatomyPart } from "./types";

export const hohmannTransferAnatomy: Record<number, AnatomyPart[]> = {
  0: [
    {
      tex: String.raw`v^2`,
      label: "Speed squared",
      meaning:
        "Vis-viva prices the speed at any point of any conic around the star, ellipse or circle alike.",
      value: "v ≈ 0.1188 px/s at the transfer periapsis",
      unit: "px²/s²",
    },
    { tex: String.raw` = `, glue: true },
    {
      tex: String.raw`GM`,
      label: "Gravitational parameter",
      meaning:
        "The star’s strength; this sim sets GM = 1 so circular speed is just √(1/r).",
      value: "1",
      unit: "px³/s²",
    },
    {
      tex: String.raw`\left(\frac{2}{r} - \frac{1}{a}\right)`,
      label: "Vis-viva bracket",
      meaning:
        "Compares your current distance r with the semi-major axis a of the conic you are riding.",
      value: "2/100 − 1/170 ≈ 0.01412 at the first burn",
      unit: "px⁻¹",
    },
  ],
  1: [
    {
      tex: String.raw`\Delta v_1`,
      label: "First burn",
      meaning:
        "Prograde kick fired on the inner circular orbit that lifts the apoapsis out to meet the outer orbit.",
      value: "≈ 0.0188 px/s at the default orbits",
      unit: "px/s",
    },
    { tex: String.raw` = `, glue: true },
    {
      tex: String.raw`v_{p,t}`,
      label: "Transfer periapsis speed",
      meaning:
        "How fast the spacecraft must already be moving on the transfer ellipse as it crosses r₁.",
      value: "√(2/100 − 1/170) ≈ 0.1188 px/s",
      unit: "px/s",
    },
    { tex: String.raw` - `, glue: true },
    {
      tex: String.raw`v_{c,1}`,
      label: "Inner circular speed",
      meaning:
        "Speed on the starting circle that you are accelerating away from.",
      value: "√(1/100) = 0.1000 px/s at r₁ = 100",
      unit: "px/s",
    },
  ],
  2: [
    {
      tex: String.raw`\Delta v_{\text{total}}`,
      label: "Mission budget",
      meaning:
        "The full cost shown in the ledger before launch, spent across exactly two impulses.",
      value: "≈ 0.0339 px/s for r₁ = 100 → r₂ = 240",
      unit: "px/s",
    },
    { tex: String.raw` = `, glue: true },
    {
      tex: String.raw`\Delta v_1`,
      label: "Departure burn",
      meaning:
        "Spent deep in the gravity well where each unit of Δv buys the most apoapsis.",
      value: "≈ 0.0188 px/s",
      unit: "px/s",
    },
    { tex: String.raw` + `, glue: true },
    {
      tex: String.raw`\Delta v_2`,
      label: "Circularization burn",
      meaning:
        "At apoapsis it raises the slow ellipse speed of 0.0495 up to the outer circle’s 0.0645.",
      value: "≈ 0.0150 px/s",
      unit: "px/s",
    },
  ],
};
