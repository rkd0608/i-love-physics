import type { AnatomyPart } from "./types";

export const zenoAchillesAnatomy: Record<number, AnatomyPart[]> = {
  0: [
    {
      tex: String.raw`g_n`,
      label: "Gap after n dashes",
      meaning:
        "Each dashed segment in Zeno mode obeys this law; after two steps only 2.4 m separate runner from tortoise.",
      value: "2.4",
      unit: "m",
    },
    { tex: String.raw`=`, glue: true },
    {
      tex: String.raw`g_0`,
      label: "Head start",
      meaning:
        "Set by the Head start g₀ slider — how far ahead of Achilles the tortoise begins at the gun.",
      value: "60",
      unit: "m",
    },
    {
      tex: String.raw`r^n`,
      label: "Shrink factor",
      meaning:
        "Ratio raised to the dash count; the logarithmic inset watches it collapse step by step toward machine epsilon.",
      value: "0.040 at n = 2",
    },
    { tex: String.raw`,`, glue: true },
    { tex: String.raw`\quad`, glue: true },
    {
      tex: String.raw`r`,
      label: "Speed ratio",
      meaning:
        "Tortoise speed divided by Achilles speed; a slower tortoise shrinks every future gap faster.",
      value: "0.20",
    },
    { tex: String.raw`=`, glue: true },
    {
      tex: String.raw`\frac{v_T}{v_A}`,
      label: "Ratio formula",
      meaning:
        "One point two meters per second against six point zero fixes the entire staircase of gaps in advance.",
      value: "0.20",
    },
  ],
  1: [
    {
      tex: String.raw`1`,
      label: "First dash",
      meaning:
        "The full head start — Achilles’ opening sprint to wherever the tortoise used to be.",
      value: "1",
    },
    { tex: String.raw`+`, glue: true },
    {
      tex: String.raw`r`,
      label: "Second dash share",
      meaning:
        "One fifth of the previous gap, the distance left when he arrives where it just was.",
      value: "0.20",
    },
    { tex: String.raw`+`, glue: true },
    {
      tex: String.raw`r^2`,
      label: "Third dash share",
      meaning:
        "One twenty-fifth — by now the dashed segments on screen are already vanishing.",
      value: "0.040",
    },
    { tex: String.raw`+`, glue: true },
    { tex: String.raw`\cdots`, glue: true },
    { tex: String.raw`=`, glue: true },
    {
      tex: String.raw`\frac{1}{1-r}`,
      label: "Geometric sum",
      meaning:
        "Infinitely many dashes total just 1.25 gaps; times the 60 m head start at 6 m/s, that is the ordinary finish below.",
      value: "1.25",
    },
  ],
  2: [
    {
      tex: String.raw`t^{*}`,
      label: "Catch-up time",
      meaning:
        "Where the stopwatch converges no matter how finely you slice Zeno steps — the flag falls at twelve and a half seconds.",
      value: "12.5",
      unit: "s",
    },
    { tex: String.raw`=`, glue: true },
    {
      tex: String.raw`\frac{g_0}{v_A - v_T}`,
      label: "Closing-rate formula",
      meaning:
        "Sixty meters closed at 4.8 m/s net; the infinite regress dissolves into plain kinematics.",
      value: "60 / 4.8",
      unit: "s",
    },
  ],
};
