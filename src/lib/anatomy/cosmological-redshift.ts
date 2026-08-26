import type { AnatomyPart } from "./types";

export const cosmologicalRedshiftAnatomy: Record<number, AnatomyPart[]> = {
  0: [
    {
      tex: String.raw`1 + z`,
      label: "Stretch factor",
      meaning:
        "How much the photon train lengthened in transit; the corner label prints this ratio directly.",
      value: "≈ 1.22 for light leaving χ = 400 at t = 0 with H₀ = 0.05",
      unit: "dimensionless",
    },
    { tex: String.raw` = `, glue: true },
    {
      tex: String.raw`\frac{\lambda_{\text{obs}}}{\lambda_{\text{emit}}}`,
      label: "Wavelength ratio",
      meaning:
        "The emitted violet wave of λ = 20 px arrives shifted toward the deep red end of the lane.",
      value: "20 px stretches to ≈ 24.4 px in flight",
      unit: "dimensionless ratio",
    },
  ],
  1: [
    {
      tex: String.raw`v`,
      label: "Recession speed",
      meaning:
        "How fast the emitter galaxy drifts away from the Milky Way observer on the expanding grid.",
      value: "20 px/s at χ = 400 and a ≈ 1",
      unit: "px/s",
    },
    { tex: String.raw` = `, glue: true },
    {
      tex: String.raw`H_0`,
      label: "Hubble rate H₀",
      meaning:
        "The expansion slider; space grows linearly so the scale factor reads a = 1 + H₀t.",
      value: "0.05 per second by default",
      unit: "1/s",
    },
    {
      tex: String.raw` d`,
      label: "Comoving distance",
      meaning:
        "Grid separation of the chosen emitter from the observer, labeled χ next to the galaxy.",
      value: "χ = 400 px at the default slider",
      unit: "px",
    },
  ],
  2: [
    {
      tex: String.raw`a(t)`,
      label: "Scale factor",
      meaning:
        "Size of space relative to today, shown growing steadily in the upper-left readout.",
      value: "a = 1 + 0.05t in sim time",
      unit: "dimensionless",
    },
    {
      tex: String.raw`\,\lambda`,
      label: "Photon wavelength",
      meaning:
        "Crests painted into expanding space are forced to stretch exactly as the grid does.",
      value: "λ = 20 px when emitted",
      unit: "px",
    },
    { tex: String.raw` \approx `, glue: true },
    {
      tex: String.raw`\text{const}`,
      label: "Comoving invariant",
      meaning:
        "This product stays fixed along the flight, which is why redshift equals the ratio of scale factors.",
      value: "≈ 20 px held for the whole journey while a ≈ 1 early on",
      unit: "px",
    },
  ],
};
