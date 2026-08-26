import type { AnatomyPart } from "./types";

export const collisionLabAnatomy: Record<number, AnatomyPart[]> = {
  0: [
    {
      tex: String.raw`m_1`,
      label: "Left glider mass",
      meaning:
        "Set by the Mass m₁ slider; two kilograms sliding right on the air track.",
      value: "2.0",
      unit: "kg",
    },
    {
      tex: String.raw`u_1`,
      label: "Incoming velocity",
      meaning:
        "Before-contact speed shown as the left glider’s arrow length before the click.",
      value: "+3.0",
      unit: "m/s",
    },
    { tex: String.raw`+`, glue: true },
    {
      tex: String.raw`m_2`,
      label: "Right glider mass",
      meaning:
        "Set by the Mass m₂ slider; half the partner here.",
      value: "1.0",
      unit: "kg",
    },
    {
      tex: String.raw`u_2`,
      label: "Its incoming velocity",
      meaning:
        "Negative means heading left toward its oncoming rival.",
      value: "−1.0",
      unit: "m/s",
    },
    { tex: String.raw`=`, glue: true },
    {
      tex: String.raw`m_1`,
      label: "Left glider again",
      meaning:
        "Same cart after contact, carrying whatever momentum it kept.",
      value: "2.0",
      unit: "kg",
    },
    {
      tex: String.raw`v_1`,
      label: "Outgoing velocity",
      meaning:
        "The heavy glider slows to a crawl after handing momentum across.",
      value: "+0.6",
      unit: "m/s",
    },
    { tex: String.raw`+`, glue: true },
    {
      tex: String.raw`m_2`,
      label: "Right glider again",
      meaning:
        "Unchanged mass, changed motion — the ledger’s last line.",
      value: "1.0",
      unit: "kg",
    },
    {
      tex: String.raw`v_2`,
      label: "Outgoing velocity",
      meaning:
        "Speeds off rightward; both sides of the momentum ledger panel total 5.0 kg·m/s every time.",
      value: "+3.8",
      unit: "m/s",
    },
  ],
  1: [
    {
      tex: String.raw`e`,
      label: "Restitution coefficient",
      meaning:
        "The Restitution e slider: one bounces elastically, zero leaves the gliders stuck together drifting as one.",
      value: "0.80",
    },
    { tex: String.raw`=`, glue: true },
    {
      tex: String.raw`\frac{v_2 - v_1}{u_1 - u_2}`,
      label: "Separation over closing speed",
      meaning:
        "They part at 3.2 m/s after meeting at 4.0 m/s, so a fifth of the relative bounce was lost to squash.",
      value: "3.2 / 4.0",
    },
  ],
  2: [
    {
      tex: String.raw`\Delta K`,
      label: "Kinetic energy change",
      meaning:
        "How much the energy ledger dips across the impact — heat, sound, and permanent dent in the bumpers.",
      value: "−1.92",
      unit: "J",
    },
    { tex: String.raw`=`, glue: true },
    { tex: String.raw`-\tfrac{1}{2}`, glue: true },
    {
      tex: String.raw`\mu`,
      label: "Reduced mass",
      meaning:
        "The pairing’s effective inertia, m₁m₂ over their sum — two-thirds of a kilogram here.",
      value: "0.67",
      unit: "kg",
    },
    {
      tex: String.raw`(1-e^2)`,
      label: "Elasticity factor",
      meaning:
        "Vanishes for a perfect bouncer where nothing is lost; at e = 0.80 only 0.36 of the loss budget survives.",
      value: "0.36",
    },
    {
      tex: String.raw`(u_1-u_2)^2`,
      label: "Closing speed squared",
      meaning:
        "Hard collisions waste energy quadratically — meet at four meters per second and losses ride on sixteen.",
      value: "16.0",
      unit: "m²/s²",
    },
  ],
};
