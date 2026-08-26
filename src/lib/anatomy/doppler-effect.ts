import type { AnatomyPart } from "./types";

export const dopplerEffectAnatomy: Record<number, AnatomyPart[]> = {
  0: [
    {
      tex: String.raw`f'`,
      label: "Observed frequency",
      meaning: "Crests per second the white observer dot intercepts, checked live against the measured f′ readout in the footnote.",
      value: "4.0",
      unit: "Hz",
    },
    { tex: "=", glue: true },
    {
      tex: String.raw`f`,
      label: "Emitted frequency f",
      meaning: "Emission frequency f slider stamping one circular crest every half second here.",
      value: "2.0",
      unit: "Hz",
    },
    {
      tex: String.raw`\frac{v \pm v_o}{v \mp v_s}`,
      label: "Approach factor",
      meaning: "Upper signs boost a closing pair and lower signs cut a receding one, so head-on motion at v = 100 and vₛ = 50 px/s doubles the pitch.",
      value: "2.0",
    },
  ],
  1: [
    {
      tex: String.raw`\lambda'`,
      label: "Bunched wavelength",
      meaning: "Tighter crest spacing stamped ahead of the moving source, visible as crowded cyan arcs.",
      value: "25",
      unit: "px",
    },
    { tex: "=", glue: true },
    {
      tex: String.raw`\lambda`,
      label: "Rest wavelength",
      meaning: "Ring spacing a parked source would leave, v over f = 100/2.",
      value: "50",
      unit: "px",
    },
    { tex: "-", glue: true },
    {
      tex: String.raw`v_s T`,
      label: "Chase distance",
      meaning: "Ground the Source speed vₛ slider gains during one period T = 0.5 s, letting it sneak up on its own crests.",
      value: "25",
      unit: "px",
    },
  ],
  2: [
    {
      tex: String.raw`v_s`,
      label: "Source speed",
      meaning: "Source speed vₛ slider cranked to the wave speed so the emitter keeps pace with its own leading crest.",
      value: "100",
      unit: "px/s",
    },
    { tex: "=", glue: true },
    {
      tex: String.raw`v`,
      label: "Wave speed",
      meaning: "Fixed expansion rate of every circular wavefront in the tank.",
      value: "100",
      unit: "px/s",
    },
    { tex: String.raw`\Rightarrow`, glue: true },
    {
      tex: String.raw`\text{pile-up}`,
      label: "Mach-one pile-up",
      meaning: "Wavefronts stack into a single shock front as the Mach cone opens to μ = 90° at M = 1.",
      value: "90",
      unit: "°",
    },
  ],
};
