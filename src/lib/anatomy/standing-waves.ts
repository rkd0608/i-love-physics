import type { AnatomyPart } from "./types";

export const standingWavesAnatomy: Record<number, AnatomyPart[]> = {
  0: [
    {
      tex: String.raw`f_n`,
      label: "Harmonic frequency",
      meaning: "Ringing rate of mode n quoted in the footnote, 0.30 Hz for the third mode on a 500 px string.",
      value: "0.30",
      unit: "Hz",
    },
    { tex: "=", glue: true },
    {
      tex: String.raw`\frac{n v}{2L}`,
      label: "Motion over geometry",
      meaning: "n loops at the Wave speed v slider of 100 px/s divided by the 1000 px there-and-back span between the fixed ends.",
      value: "300 / 1000",
      unit: "px/s per px",
    },
  ],
  1: [
    {
      tex: String.raw`y(x,t)`,
      label: "String profile",
      meaning: "Displacement evaluated in closed form at every pixel each frame, never integrated.",
      value: "±32",
      unit: "px",
    },
    { tex: "=", glue: true },
    {
      tex: String.raw`2A`,
      label: "Envelope swing",
      meaning: "Full breathing width of the dashed envelope, twice the Amplitude A slider’s 16 px.",
      value: "32",
      unit: "px",
    },
    {
      tex: String.raw`\sin(kx)`,
      label: "Mode shape",
      meaning: "Spatial skeleton with zeros at the violet node dots and extremes under each amber star, k = nπ/L ≈ 0.019 rad/px.",
      value: "0.019",
      unit: "rad/px",
    },
    {
      tex: String.raw`\cos(\omega t)`,
      label: "Breathing clock",
      meaning: "Every point swells and shrinks in phase at ω = 2πf₃ ≈ 1.885 rad/s instead of traveling.",
      value: "1.885",
      unit: "rad/s",
    },
  ],
  2: [
    {
      tex: String.raw`\lambda_n`,
      label: "Mode wavelength",
      meaning: "Wavelength the end pins force onto harmonic n, printed as λ₃ = 2L/3 in the footnote.",
      value: "333.3",
      unit: "px",
    },
    { tex: "=", glue: true },
    {
      tex: String.raw`2L`,
      label: "Pinned span doubled",
      meaning: "Out-and-back measure between the hatched fixed walls.",
      value: "1000",
      unit: "px",
    },
    { tex: "/", glue: true },
    {
      tex: String.raw`n`,
      label: "Loop count",
      meaning: "Antinode loops sharing the span, so three loops carve 2L into thirds.",
      value: "3",
    },
  ],
};
