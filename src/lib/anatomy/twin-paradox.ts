import type { AnatomyPart } from "./types";

export const twinParadoxAnatomy: Record<number, AnatomyPart[]> = {
  22: [
    {
      tex: String.raw`\tau`,
      label: "Proper time along the worldline",
      meaning:
        "The age a clock banks on its own path — the traveling twin logs 4.8 years over the round trip at “Outbound speed β” = 0.8 while home waits 8.",
      value: "4.8",
      unit: "yr",
    },
    { tex: String.raw` = `, glue: true },
    { tex: String.raw`\int `, glue: true },
    {
      tex: String.raw`\sqrt{dt^2 - dx^2/c^2}`,
      label: "Minkowski arc element",
      meaning:
        "Each coasting leg contributes only √(1−β²) = 0.6 aged years per home-year — shrink “Trip half-length τ” and the two totals merge.",
      value: "0.6",
      unit: "dimensionless",
    },
  ],
  23: [
    {
      tex: String.raw`s^2`,
      label: "Invariant interval squared",
      meaning:
        "Departure to turnaround: every observer, whatever their coordinates, computes the same 5.76 light-years squared for the leg.",
      value: "5.76",
      unit: "ly²",
    },
    { tex: String.raw` = `, glue: true },
    {
      tex: String.raw`c^2t^2`,
      label: "Time term",
      meaning:
        "Four home-years of outbound coasting contribute 16 ly² to every frame’s ledger.",
      value: "16",
      unit: "ly²",
    },
    { tex: String.raw` - `, glue: true },
    {
      tex: String.raw`x^2`,
      label: "Space term",
      meaning:
        "The 3.2 light-year excursion reached at turnaround subtracts 10.24 ly², leaving √5.76 = 2.4 years of traveler age.",
      value: "10.24",
      unit: "ly²",
    },
  ],
  24: [
    {
      tex: String.raw`\tau_{\text{straight}}`,
      label: "Home twin’s elapsed time",
      meaning:
        "One unbroken inertial worldline from departure to reunion banks the full eight years.",
      value: "8",
      unit: "yr",
    },
    { tex: String.raw` > `, glue: true },
    {
      tex: String.raw`\tau_{\text{kinked}}`,
      label: "Traveling twin’s elapsed time",
      meaning:
        "Two legs at β = 0.8 stitched by the instantaneous turnaround bank only 2 × 2.4 = 4.8 years.",
      value: "4.8",
      unit: "yr",
    },
  ],
};
