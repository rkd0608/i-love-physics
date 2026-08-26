import type { AnatomyPart } from "./types";

export const carnotCycleAnatomy: Record<number, AnatomyPart[]> = {
  70: [
    {
      tex: String.raw`\eta`,
      label: "Efficiency",
      meaning:
        "The fraction of heat drawn from “Hot temp T_h” that emerges as work each cycle — the ceiling readout the lab tracks.",
      value: "0.5",
      unit: "dimensionless",
    },
    { tex: String.raw` = `, glue: true },
    {
      tex: String.raw`1`,
      label: "Perfect-conversion bound",
      meaning:
        "Efficiency would reach this unity only for a cold reservoir at absolute zero, where the T_c/T_H term vanishes.",
      value: "1",
      unit: "dimensionless",
    },
    { tex: String.raw` - `, glue: true },
    {
      tex: String.raw`\frac{T_c}{T_h}`,
      label: "Reservoir ratio",
      meaning:
        "“Cold temp T_c” over “Hot temp T_h” — at 300 K and 600 K exactly half the heat must be dumped, capping η at 50%.",
      value: "0.5",
      unit: "dimensionless",
    },
  ],
  71: [
    {
      tex: String.raw`PV^{\gamma}`,
      label: "Adiabat invariant",
      meaning:
        "Held fixed along the two insulated strokes, with γ = 5⁄3 ≈ 1.667 stiffening the curve for this monatomic gas.",
      value: "670",
      unit: "Pa·m^(5/3)",
    },
    { tex: String.raw` = `, glue: true },
    {
      tex: String.raw`\text{const}`,
      label: "Stroke constant",
      meaning:
        "One number per adiabat — starting from 1 atm and 49.2 liters (one mole at 600 K), every point of the stroke keeps this product at 670.",
      value: "670",
      unit: "Pa·m^(5/3)",
    },
  ],
  72: [
    {
      tex: String.raw`W`,
      label: "Net work per cycle",
      meaning:
        "Half of the 1000 J taken from “Hot temp T_h” at the η = 50% setting comes out as usable work.",
      value: "500",
      unit: "J",
    },
    { tex: String.raw` = `, glue: true },
    {
      tex: String.raw`\oint P\,dV`,
      label: "Enclosed loop area",
      meaning:
        "The shaded PV-plane region the four strokes trace; raising “Compression ratio” fattens this area to 500 J without moving η.",
      value: "500",
      unit: "J",
    },
  ],
};
