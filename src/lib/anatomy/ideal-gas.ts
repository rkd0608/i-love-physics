import type { AnatomyPart } from "./types";

export const idealGasAnatomy: Record<number, AnatomyPart[]> = {
  67: [
    {
      tex: String.raw`PV`,
      label: "Pressure–volume product",
      meaning:
        "What the chamber’s rolling gauge computes: piston impacts summed into a pressure reading, times the volume left open — about one atmosphere pushing on 24.6 liters.",
      value: "2494",
      unit: "J",
    },
    { tex: String.raw` = `, glue: true },
    {
      tex: String.raw`nRT`,
      label: "Moles × gas constant × Temperature T",
      meaning:
        "One mole of dilute gas held at the lab’s 300 K carries exactly this much push-capacity, so both sides balance at 2494 J.",
      value: "2494",
      unit: "J",
    },
  ],
  68: [
    {
      tex: String.raw`\langle E_k \rangle`,
      label: "Mean kinetic energy",
      meaning:
        "Every sweep of the “Temperature T” slider rescales the molecules’ velocities until their average impact energy lands at this value.",
      value: "6.21×10⁻²¹",
      unit: "J",
    },
    { tex: String.raw` = `, glue: true },
    {
      tex: String.raw`\tfrac{3}{2}`,
      label: "Three-halves factor",
      meaning:
        "Three translational degrees of freedom, each holding half a k_BT of jostle for a free-flying molecule.",
      value: "1.5",
      unit: "dimensionless",
    },
    {
      tex: String.raw`k_B `,
      label: "Boltzmann constant",
      meaning:
        "The exchange rate between kelvin and joules per molecule, the conversion the simulation performs implicitly on every rebound.",
      value: "1.381×10⁻²³",
      unit: "J/K",
    },
    {
      tex: String.raw`T`,
      label: "Temperature T",
      meaning:
        "The slider that heats without touching positions — at its 300 K setting a molecule averages this mean kinetic energy.",
      value: "300",
      unit: "K",
    },
  ],
  69: [
    {
      tex: String.raw`v_{\text{rms}}`,
      label: "Root-mean-square speed",
      meaning:
        "The speed the “Temperature T” slider targets directly when it reheats the chamber in one velocity rescale.",
      value: "517",
      unit: "m/s",
    },
    { tex: String.raw` = `, glue: true },
    {
      tex: String.raw`\sqrt{\frac{3k_B T}{m}}`,
      label: "Thermal-speed radical",
      meaning:
        "Triple thermal energy over molecular mass — for nitrogen’s m = 4.65×10⁻²⁶ kg at 300 K the radicand is 2.67×10⁵, whose square root is 517 m/s.",
      value: "2.67×10⁵",
      unit: "m²/s²",
    },
  ],
};
