import type { AnatomyPart } from "./types";

export const waveInterferenceAnatomy: Record<number, AnatomyPart[]> = {
  0: [
    {
      tex: String.raw`A(p,t)`,
      label: "Field at p",
      meaning: "Net displacement the canvas paints at pixel p and time t, bounded by ±1 after normalization.",
      value: "±1",
    },
    { tex: "=", glue: true },
    {
      tex: String.raw`A_1`,
      label: "Amplitude from S₁",
      meaning: "Arrival height of the circular wave from source S₁, the pulsing cyan dot.",
      value: "1",
    },
    {
      tex: String.raw`\sin(k r_1 - \omega t)`,
      label: "Phase of wave 1",
      meaning: "Cycle position of the S₁ crest after crossing r₁ pixels at k = 2π/λ ≈ 0.13 rad/px with λ = 48 px.",
      value: "0 to 2π",
      unit: "rad",
    },
    { tex: "+", glue: true },
    {
      tex: String.raw`A_2`,
      label: "Amplitude from S₂",
      meaning: "Arrival height of the matching wave from source S₂, the green dot across the Separation d.",
      value: "1",
    },
    {
      tex: String.raw`\sin(k r_2 - \omega t)`,
      label: "Phase of wave 2",
      meaning: "Cycle position of the S₂ crest along its own path r₂, advancing at ω = 2π rad/s on the default Speed.",
      value: "0 to 2π",
      unit: "rad",
    },
  ],
  1: [
    {
      tex: String.raw`\Delta`,
      label: "Path difference",
      meaning: "Extra distance one wave covers over the other, mapped as bright and dark radial fringes on screen.",
      value: "96",
      unit: "px",
    },
    { tex: "=", glue: true },
    {
      tex: String.raw`\lvert r_1 - r_2 \rvert`,
      label: "Distance gap",
      meaning: "Straight subtraction of the two source-to-pixel distances recomputed for every cell of the field.",
      value: "96",
      unit: "px",
    },
    { tex: "=", glue: true },
    {
      tex: String.raw`m\lambda`,
      label: "Whole wavelengths",
      meaning: "Second-order construction at the Wavelength λ slider’s 48 px, one of roughly ⌊2d/λ⌋ = 6 bright fringes for Separation d = 160 px.",
      value: "2 × 48",
      unit: "px",
    },
  ],
  2: [
    {
      tex: String.raw`\Delta`,
      label: "Nodal gap",
      meaning: "Path difference that parks a pixel on a dark nodal line where a crest meets a trough.",
      value: "24",
      unit: "px",
    },
    { tex: "=", glue: true },
    {
      tex: String.raw`\left(m + \tfrac{1}{2}\right)`,
      label: "Half-integer order",
      meaning: "Orders halfway between bright fringes, where m = 0 gives the first nodal circle flanking the center line.",
      value: "0.5",
    },
    {
      tex: String.raw`\lambda`,
      label: "Wavelength λ",
      meaning: "Current Wavelength λ slider setting spacing successive nodal rings.",
      value: "48",
      unit: "px",
    },
  ],
  3: [
    {
      tex: String.raw`I`,
      label: "Intensity",
      meaning: "Pixel brightness that the Intensity view toggle renders through the green ramp.",
      value: "up to 4",
      unit: "I₀",
    },
    { tex: String.raw`\propto`, glue: true },
    {
      tex: String.raw`\langle A^2 \rangle`,
      label: "Time-averaged square",
      meaning: "Cycle average of squared amplitude, four times a lone wave’s value wherever crests reinforce.",
      value: "4",
      unit: "A₀²",
    },
  ],
};
