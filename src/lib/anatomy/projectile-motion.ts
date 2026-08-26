import type { AnatomyPart } from "./types";

export const projectileMotionAnatomy: Record<number, AnatomyPart[]> = {
  0: [
    {
      tex: String.raw`y`,
      label: "Height",
      meaning:
        "How high the dashed vacuum ghost flies when the ball is 16 m downrange in the sim.",
      value: "9.72",
      unit: "m",
    },
    { tex: String.raw`=`, glue: true },
    {
      tex: String.raw`x`,
      label: "Horizontal distance",
      meaning:
        "Measured by the meter ticks along the ground, starting at the launcher muzzle.",
      value: "16",
      unit: "m",
    },
    {
      tex: String.raw`\tan\theta`,
      label: "Launch-angle slope",
      meaning:
        "Straight-line climb set by the Angle slider; at forty-five degrees it equals exactly one.",
      value: "1.00",
    },
    { tex: String.raw`-`, glue: true },
    {
      tex: String.raw`\frac{g x^2}{2 v_0^2 \cos^2\theta}`,
      label: "Gravity droop",
      meaning:
        "How far the vacuum ghost sags below the straight launch ray, growing with the square of downrange distance.",
      value: "6.28",
      unit: "m",
    },
  ],
  1: [
    {
      tex: String.raw`R`,
      label: "Vacuum range",
      meaning:
        "Where the dashed Vacuum ghost lands, flagged by the impact marker; raise Drag coefficient k and the real shot falls short of it.",
      value: "40.8",
      unit: "m",
    },
    { tex: String.raw`=`, glue: true },
    {
      tex: String.raw`\frac{v_0^2 \sin 2\theta}{g}`,
      label: "Range formula",
      meaning:
        "Twenty meters per second at forty-five degrees buys forty meters; sin 2θ peaks at one exactly there, which is why no other angle wins in vacuum.",
      value: "400",
      unit: "m²/s²",
    },
  ],
  2: [
    {
      tex: String.raw`\vec{a}`,
      label: "Acceleration",
      meaning:
        "What the integrator applies each animation frame; watch the velocity arrow tilt as drag bites harder on descent.",
      value: "4.5",
      unit: "m/s²",
    },
    { tex: String.raw`=`, glue: true },
    {
      tex: String.raw`\vec{g}`,
      label: "Gravity",
      meaning:
        "The steady downward pull identical for the real ball and its vacuum ghost alike.",
      value: "9.81",
      unit: "m/s²",
    },
    { tex: String.raw`-`, glue: true },
    {
      tex: String.raw`k`,
      label: "Drag coefficient",
      meaning:
        "The Drag coefficient k slider; set it to zero and the solid path snaps onto the dashed one.",
      value: "0.010",
      unit: "1/m",
    },
    { tex: String.raw`\lvert`, glue: true },
    {
      tex: String.raw`\vec{v}`,
      label: "Speed",
      meaning:
        "Air resistance grows with the square of this, so the fast-falling tail of the flight gets braked hardest.",
      value: "23",
      unit: "m/s",
    },
    { tex: String.raw`\rvert`, glue: true },
    {
      tex: String.raw`\vec{v}`,
      label: "Velocity direction",
      meaning:
        "The same arrow reused so the drag term always points opposite the motion, whatever way the ball heads.",
      value: "5.29",
      unit: "m/s²",
    },
  ],
  3: [
    {
      tex: String.raw`h_{\max}`,
      label: "Apex height",
      meaning:
        "Top of the dashed vacuum ghost, where vertical velocity momentarily reads zero before the fall begins.",
      value: "10.2",
      unit: "m",
    },
    { tex: String.raw`=`, glue: true },
    {
      tex: String.raw`\frac{v_0^2 \sin^2\theta}{2 g}`,
      label: "Vertical launch share over gravity",
      meaning:
        "Only the upward slice of launch speed matters here; steepen the Angle slider and the ghost climbs while range shrinks.",
      value: "200",
      unit: "m²/s²",
    },
  ],
};
