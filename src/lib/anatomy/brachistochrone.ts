import type { AnatomyPart } from "./types";

export const brachistochroneAnatomy: Record<number, AnatomyPart[]> = {
  0: [
    {
      tex: String.raw`v`,
      label: "Bead speed",
      meaning:
        "Identical for all three racers whenever they share a height — mid-race their velocity arrows flash equal lengths on different rails.",
      value: "6.26",
      unit: "m/s",
    },
    { tex: String.raw`=`, glue: true },
    {
      tex: String.raw`\sqrt{2g(y_0 - y)}`,
      label: "Energy speed",
      meaning:
        "Height lost times twice gravity, square-rooted — Galileo’s free-fall rule applied along whatever rail the bead rides.",
      value: "39.2",
      unit: "m²/s²",
    },
  ],
  1: [
    {
      tex: String.raw`t`,
      label: "Descent time",
      meaning:
        "The Finish times readout each rail posts when its bead reaches the shared endpoint; the cycloid stamps the podium first.",
      value: "1.14",
      unit: "s",
    },
    { tex: String.raw`=`, glue: true },
    { tex: String.raw`\int`, glue: true },
    {
      tex: String.raw`\frac{ds}{\sqrt{2g(y_0-y)}}`,
      label: "Path element over speed",
      meaning:
        "Every sluggish stretch of rail adds seconds, so dipping early buys speed exactly where it pays off most.",
      value: "1.14 cycloid versus 1.43 straight",
      unit: "s",
    },
  ],
  2: [
    {
      tex: String.raw`x`,
      label: "Cycloid abscissa",
      meaning:
        "Horizontal progress of the generating wheel’s rim; it spans the full four meters when θ reaches the flag.",
      value: "4.0",
      unit: "m",
    },
    { tex: String.raw`=`, glue: true },
    {
      tex: String.raw`a`,
      label: "Generatrix radius",
      meaning:
        "Radius of the rolling circle that fits your Span and Drop sliders — about a meter here.",
      value: "1.03",
      unit: "m",
    },
    { tex: String.raw`(`, glue: true },
    {
      tex: String.raw`\theta`,
      label: "Rolling angle",
      meaning:
        "How far the invisible wheel has turned; the whole winning rail lives between zero and 3.51 radians.",
      value: "3.51 at the flag",
      unit: "rad",
    },
    { tex: String.raw`-`, glue: true },
    {
      tex: String.raw`\sin\theta`,
      label: "Rollback correction",
      meaning:
        "Subtracting the sine makes x lag the naive roll, carving the dip below the straight ramp that wins the race.",
      value: "−0.354 at the flag",
    },
    { tex: String.raw`)`, glue: true },
    { tex: String.raw`,`, glue: true },
    { tex: String.raw`\;`, glue: true },
    {
      tex: String.raw`y`,
      label: "Cycloid ordinate",
      meaning:
        "Depth below the start, reaching the Drop setting of two meters at the shared endpoint.",
      value: "2.0",
      unit: "m",
    },
    { tex: String.raw`=`, glue: true },
    {
      tex: String.raw`a`,
      label: "Same wheel radius",
      meaning:
        "One identical a scales both coordinates, keeping the curve a true rolling-circle path for any span and drop you set.",
      value: "1.03",
      unit: "m",
    },
    {
      tex: String.raw`(1 - \cos\theta)`,
      label: "Rise factor",
      meaning:
        "One minus cosine climbs from zero to two over half a turn, delivering the full drop exactly once.",
      value: "1.93 at the flag",
    },
  ],
};
