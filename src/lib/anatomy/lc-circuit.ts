import type { AnatomyPart } from "./types";

export const lcCircuitAnatomy: Record<number, AnatomyPart[]> = {
  64: [
    {
      tex: String.raw`\omega_0`,
      label: "Natural frequency",
      meaning: "Sets the tempo of the energy bars’ seesaw and of the scope strip’s sine.",
      value: "2",
      unit: "rad/s",
    },
    { tex: " = ", glue: true },
    {
      tex: String.raw`\frac{1}{\sqrt{LC}}`,
      label: "Root-LC reciprocal",
      meaning: "With C parked at 0.5 F and L at 0.5 H the product under the root is 0.25, so a full slosh takes about π seconds.",
      value: "2",
      unit: "rad/s",
    },
  ],
  65: [
    {
      tex: "q(t)",
      label: "Plate charge",
      meaning: "The glyph row on the top wire, thickening and thinning every half-cycle.",
      value: "0.002",
      unit: "C",
    },
    { tex: " = ", glue: true },
    {
      tex: "Q",
      label: "Initial charge",
      meaning: "How far you charged the plates before closing the switch.",
      value: "0.002",
      unit: "C",
    },
    { tex: String.raw`\cos`, glue: true },
    {
      tex: String.raw`(\omega_0 t)`,
      label: "Phase clock",
      meaning: "A quarter-cycle in — π⁄4 s here — leaves the plates empty and the coil glowing brightest.",
      value: "2",
      unit: "rad/s",
    },
  ],
  66: [
    {
      tex: String.raw`U_E`,
      label: "Electric energy",
      meaning: "The left energy bar, tallest when the plate glyphs are densest.",
      value: "4.0×10⁻⁶",
      unit: "J",
    },
    { tex: " + ", glue: true },
    {
      tex: String.raw`U_B`,
      label: "Magnetic energy",
      meaning: "The right bar, tallest exactly when the current arrows burn brightest.",
      value: "4.0×10⁻⁶",
      unit: "J",
    },
    { tex: " = ", glue: true },
    { tex: String.raw`\tfrac{1}{2}`, glue: true },
    {
      tex: String.raw`\frac{Q^2}{C}`,
      label: "Total stored energy",
      meaning: "The fixed ceiling both bars together touch at every instant of the trade.",
      value: "4.0×10⁻⁶",
      unit: "J",
    },
  ],
};
