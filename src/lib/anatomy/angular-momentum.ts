import type { AnatomyPart } from "./types";

export const angularMomentumAnatomy: Record<number, AnatomyPart[]> = {
  0: [
    {
      tex: String.raw`L`,
      label: "Angular momentum",
      meaning:
        "The ledger bar that refuses to move while the Friction toggle stays off, no matter how the skater reshapes.",
      value: "14.4",
      unit: "kg·m²/s",
    },
    { tex: String.raw`=`, glue: true },
    {
      tex: String.raw`I`,
      label: "Moment of inertia",
      meaning:
        "How spread-out the skater’s mass is; shrink the Arm radius slider and this collapses fast.",
      value: "2.4",
      unit: "kg·m²",
    },
    {
      tex: String.raw`\omega`,
      label: "Spin rate",
      meaning:
        "Rotation speed forced to surge whenever inertia drops, keeping the L bar pinned in place.",
      value: "6.0",
      unit: "rad/s",
    },
    { tex: String.raw`=`, glue: true },
    { tex: String.raw`\text{constant}`, glue: true },
  ],
  1: [
    {
      tex: String.raw`I`,
      label: "Moment of inertia",
      meaning:
        "Total rotational sluggishness — the translucent body disc plus the two riding hand masses.",
      value: "2.4",
      unit: "kg·m²",
    },
    { tex: String.raw`=`, glue: true },
    { tex: String.raw`\sum`, glue: true },
    {
      tex: String.raw`m`,
      label: "Each mass chunk",
      meaning:
        "The two one-kilogram gold hands on the arms; the central disc supplies the rest of the total.",
      value: "1.0",
      unit: "kg",
    },
    {
      tex: String.raw`r^2`,
      label: "Squared arm radius",
      meaning:
        "Distance from the spin axis squared — pull the hands halfway in and their share drops to a quarter.",
      value: "0.20",
      unit: "m²",
    },
  ],
  2: [
    {
      tex: String.raw`K_{\text{rot}}`,
      label: "Rotational kinetic energy",
      meaning:
        "The second ledger bar rises as arms pull in — energy you must supply by doing work against the fling.",
      value: "43.2",
      unit: "J",
    },
    { tex: String.raw`=`, glue: true },
    {
      tex: String.raw`\tfrac{1}{2}`,
      label: "One half",
      meaning:
        "The usual kinetic prefactor, now fed with spin instead of straight-line speed.",
      value: "0.5",
    },
    {
      tex: String.raw`I`,
      label: "Moment of inertia",
      meaning:
        "Shrinks as the gold hands slide inward along the Arm radius control.",
      value: "2.4",
      unit: "kg·m²",
    },
    {
      tex: String.raw`\omega^2`,
      label: "Spin squared",
      meaning:
        "Squaring amplifies the surge: a modest gain in ω buys a much larger jump in energy.",
      value: "36",
      unit: "rad²/s²",
    },
  ],
};
