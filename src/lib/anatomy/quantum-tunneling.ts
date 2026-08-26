import type { AnatomyPart } from "./types";

export const quantumTunnelingAnatomy: Record<number, AnatomyPart[]> = {
  0: [
    {
      tex: String.raw`i\hbar\frac{\partial\psi}{\partial t}`,
      label: "Time evolution side",
      meaning:
        "Sets how fast the packet’s phase clock spins — the split-step engine rotates ψ by exactly this rule each frame.",
      value: "phase rate E = 8 at the default k₀",
      unit: "ħ-units",
    },
    { tex: String.raw` = `, glue: true },
    {
      tex: String.raw`-\frac{\hbar^2}{2m}\psi''`,
      label: "Kinetic term",
      meaning:
        "Curvature of ψ is what makes the free packet spread and coast at its central wavenumber k₀ = 4.",
      value: "8 for E = k₀²/2 with ħ = m = 1",
      unit: "ħ-units of energy",
    },
    { tex: String.raw` + `, glue: true },
    {
      tex: String.raw`V\psi`,
      label: "Potential term",
      meaning:
        "Inside the barrier V₀ = 10 exceeds E = 8, flipping the sign of curvature so oscillation becomes exponential decay.",
      value: "V₀ = 10 on the height slider",
      unit: "ħ-units of energy",
    },
  ],
  1: [
    {
      tex: String.raw`E`,
      label: "Packet energy",
      meaning:
        "The dashed energy line drawn across the canvas; here it sits below the wall top, the tunneling regime.",
      value: "8",
      unit: "ħ-units of energy",
    },
    { tex: String.raw` = `, glue: true },
    {
      tex: String.raw`\frac{\hbar^2 k_0^2}{2m}`,
      label: "Dispersion energy",
      meaning:
        "With ħ = m = 1 this reduces to k₀²/2, printed live under the canvas as you drag the momentum slider.",
      value: "4²/2 = 8 at k₀ = 4",
      unit: "ħ-units of energy",
    },
    { tex: String.raw` < `, glue: true },
    {
      tex: String.raw`V_0`,
      label: "Barrier height V₀",
      meaning:
        "Top of the amber wall; any packet energy below it is classically forbidden yet still leaks through.",
      value: "10 on a slider spanning 0 to 20",
      unit: "ħ-units of energy",
    },
  ],
  2: [
    {
      tex: String.raw`R`,
      label: "Reflected share",
      meaning:
        "Probability that ricochets off the near face and streams back the way it came.",
      value: "≈ 0.98 at the default settings",
      unit: "probability fraction",
    },
    { tex: String.raw` + `, glue: true },
    {
      tex: String.raw`T`,
      label: "Transmitted share",
      meaning:
        "Leakage through the wall, collapsing exponentially as e^{−2wκ} with κ = √(2(V₀ − E)) = 2.00 at defaults.",
      value: "e^{−2·1·2} ≈ 1.8×10⁻² for w = 1",
      unit: "probability fraction",
    },
    { tex: String.raw` = `, glue: true },
    {
      tex: String.raw`1`,
      label: "Total probability",
      meaning:
        "Split-step propagation stays exactly unitary and the absorbing skirt returns its catch, so nothing is ever lost.",
      value: "Σ|ψ|² + absorbed reads 1.0000 in the HUD",
      unit: "probability",
    },
  ],
};
