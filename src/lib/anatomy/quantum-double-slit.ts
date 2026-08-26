import type { AnatomyPart } from "./types";

export const quantumDoubleSlitAnatomy: Record<number, AnatomyPart[]> = {
  0: [
    {
      tex: String.raw`|\psi|^2`,
      label: "Detection probability",
      meaning:
        "Each particle lands at a single spot with chance |ψ|², so the film fills in fringes dot by dot.",
      value: "normalized crest height of 1",
      unit: "probability density",
    },
    { tex: String.raw` = `, glue: true },
    {
      tex: String.raw`|\psi_1`,
      label: "Slit-one amplitude",
      meaning:
        "The wave from the left slit alone would paint one smooth hump with no stripes at all.",
      value: "|ψ₁|² ≈ 0.25 of a joint crest at d = 120 px",
      unit: "probability density",
    },
    { tex: String.raw` + `, glue: true },
    {
      tex: String.raw`\psi_2|^2`,
      label: "Slit-two amplitude",
      meaning:
        "Adding the twin wave before squaring creates the cross term — switch on the which-path camera and this addition dies.",
      value: "matches ψ₁ by symmetry at d = 120 px",
      unit: "probability density",
    },
  ],
  1: [
    {
      tex: String.raw`\Delta y`,
      label: "Fringe spacing",
      meaning:
        "Neighboring bright bands sit this far apart on the wall a distance L behind the slit plate.",
      value: "≈ 36 px at the default sliders",
      unit: "px",
    },
    { tex: String.raw` = `, glue: true },
    {
      tex: String.raw`\frac{\lambda L}{d}`,
      label: "Wavelength lever arm",
      meaning:
        "Longer waves or a farther wall stretch the pattern, while wider slit separation squeezes it.",
      value: "24 × 180 / 120 = 36 with λ = 24, L ≈ 180, d = 120",
      unit: "px",
    },
  ],
  2: [
    {
      tex: String.raw`P(y)`,
      label: "Landing probability",
      meaning:
        "Relative chance that a single fired particle arrives at height y on the detection wall.",
      value: "sweeps from 0 to 1 across each fringe",
      unit: "relative probability",
    },
    { tex: String.raw` \propto `, glue: true },
    {
      tex: String.raw`\cos^2\!\left(\frac{\pi d y}{\lambda L}\right)`,
      label: "Interference factor",
      meaning:
        "Probability vanishes wherever the two path lengths differ by half a wavelength.",
      value: "first dark notch at y ≈ 18 px from center",
      unit: "dimensionless factor",
    },
  ],
};
