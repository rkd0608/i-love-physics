import type { AnatomyPart } from "./types";

export const heisenbergUncertaintyAnatomy: Record<number, AnatomyPart[]> = {
  0: [
    {
      tex: String.raw`\Delta x`,
      label: "Position spread",
      meaning:
        "Standard deviation of the violet |ψ(x)|² density, drawn as its shaded one-sigma band.",
      value: "σx = 1.00 at the default slider",
      unit: "ħ-units of length",
    },
    {
      tex: String.raw`\,\Delta p`,
      label: "Momentum spread",
      meaning:
        "Width of the mirrored cyan spectrum, forced upward whenever σx is squeezed narrower.",
      value: "Δp = 0.50 for the default minimum packet",
      unit: "ħ-units of momentum",
    },
    { tex: String.raw` \geq `, glue: true },
    {
      tex: String.raw`\frac{\hbar}{2}`,
      label: "Quantum floor",
      meaning:
        "The product readout sits exactly on this bound for the unchirped Gaussian and can never dip below it.",
      value: "0.5 with ħ = 1",
      unit: "ħ-units of action",
    },
  ],
  1: [
    {
      tex: String.raw`\phi(p)`,
      label: "Momentum amplitude",
      meaning:
        "The spectrum plotted on the right half of the canvas, peaked at p = k₀ with width Δp.",
      value: "centered at p = k₀ = 0 by default",
      unit: "ħ-units of momentum",
    },
    { tex: String.raw` = `, glue: true },
    {
      tex: String.raw`\frac{1}{\sqrt{2\pi\hbar}}`,
      label: "Fourier normalization",
      meaning:
        "Keeps every transform round trip unitary so both densities integrate to exactly one.",
      value: "1/√(2π) ≈ 0.399 for ħ = 1",
      unit: "dimensionless",
    },
    { tex: String.raw`\int`, glue: true },
    {
      tex: String.raw` e^{-ipx/\hbar}`,
      label: "Phase kernel",
      meaning:
        "Every position contributes a plane wave; the chirp α misaligns their phases and widens the spectrum.",
      value: "accumulates −px radians of phase",
      unit: "dimensionless phase",
    },
    {
      tex: String.raw`\psi(x)\,dx`,
      label: "Position amplitude",
      meaning:
        "The violet wavefunction being decomposed, normalized so Σ|ψ|²dx = 1 across the grid.",
      value: "ψ(0) ≈ 0.63 at σx = 1",
      unit: "ħ-units of amplitude",
    },
  ],
  2: [
    {
      tex: String.raw`\sigma_p^2`,
      label: "Momentum variance",
      meaning:
        "Squared width of the momentum peak, what the readout reports as Δp after square-rooting.",
      value: "0.25 at the default sliders",
      unit: "ħ-units squared",
    },
    { tex: String.raw` = `, glue: true },
    {
      tex: String.raw`\langle p^2\rangle`,
      label: "Mean square momentum",
      meaning:
        "Average of p² weighted by |φ(p)|² over the whole spectrum.",
      value: "0.25 at k₀ = 0, rising to 9.25 at k₀ = 3",
      unit: "ħ-units squared",
    },
    { tex: String.raw` - `, glue: true },
    {
      tex: String.raw`\langle p\rangle^2`,
      label: "Mean momentum squared",
      meaning:
        "Subtracting the spectrum’s center leaves pure spread, untouched by overall drift.",
      value: "k₀² = 0 at the default centering",
      unit: "ħ-units squared",
    },
  ],
};
