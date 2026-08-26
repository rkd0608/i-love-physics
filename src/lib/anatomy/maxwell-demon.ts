import type { AnatomyPart } from "./types";

export const maxwellDemonAnatomy: Record<number, AnatomyPart[]> = {
  43: [
    {
      tex: String.raw`\frac{T_L}{T_R}`,
      label: "Left-over-right temperature ratio",
      meaning:
        "Starts at 1 and sinks while “Demon sorting” runs, as the left chamber fades to a slow cyan trickle and the right blazes amber.",
      value: "0.15",
      unit: "dimensionless",
    },
    { tex: String.raw` = `, glue: true },
    {
      tex: String.raw`\frac{\langle v^2 \rangle_L}{\langle v^2 \rangle_R}`,
      label: "Mean-squared-speed ratio",
      meaning:
        "The lab weighs ⟨v²⟩ in each chamber every fifteen frames — a cold class near 100 px/s against “Hot speed” near 260 px/s gives (100/260)² ≈ 0.15.",
      value: "0.15",
      unit: "dimensionless",
    },
  ],
  44: [
    {
      tex: String.raw`\Delta S`,
      label: "Entropy change of the gas alone",
      meaning:
        "Filing two hundred molecules by speed class lowers the box’s entropy even though nothing cools or heats overall.",
      value: "−1.9×10⁻²¹",
      unit: "J/K",
    },
    { tex: String.raw` \sim `, glue: true },
    {
      tex: String.raw`k_B \ln W`,
      label: "Boltzmann’s logarithm of arrangements",
      meaning:
        "Mixed chambers allow about 2²⁰⁰ assignments and full sorting nearly one, so ln W drops by roughly 139 nats and k_B times that is the 1.9×10⁻²¹ J/K the demon seems to erase.",
      value: "−1.9×10⁻²¹",
      unit: "J/K",
    },
  ],
  45: [
    {
      tex: String.raw`\dot S_{\text{total}}`,
      label: "Entropy production of gas plus demon",
      meaning:
        "The box’s loss is repaid by heat dumped when the demon’s which-molecule-when memory is wiped at Landauer’s k_BT ln 2 per bit.",
      value: "0",
      unit: "J/(K·s)",
    },
    { tex: String.raw` \geq `, glue: true },
    {
      tex: String.raw`0`,
      label: "Reversible floor",
      meaning:
        "Exactly zero only for a perfect gatekeeper; every real run of the lab sits strictly above it.",
      value: "0",
      unit: "dimensionless",
    },
  ],
};
