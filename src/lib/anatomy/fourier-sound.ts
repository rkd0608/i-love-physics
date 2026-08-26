import type { AnatomyPart } from "./types";

export const fourierSoundAnatomy: Record<number, AnatomyPart[]> = {
  0: [
    {
      tex: String.raw`y(t)`,
      label: "Waveform",
      meaning: "Pressure-style trace scrolling through the oscilloscope pane, rebuilt from 1024 samples per window.",
      value: "±1",
    },
    { tex: "=", glue: true },
    {
      tex: String.raw`\sum_{n=1}^{N}`,
      label: "Harmonic stack",
      meaning: "Adds partials 1 through the Harmonics N slider, eight bars lit at the default.",
      value: "8",
      unit: "partials",
    },
    {
      tex: String.raw`A_n`,
      label: "Partial amplitude",
      meaning: "Height of spectrum bar n under the Spectral tilt p law, which parks bar 8 at 0.125 when p = 1.",
      value: "0.125",
    },
    {
      tex: String.raw`\sin(2\pi n f t)`,
      label: "Harmonic sine",
      meaning: "Pure tone at n times the Fundamental f slider, sweeping 220 Hz up through 1760 Hz across the stack.",
      value: "220 to 1760",
      unit: "Hz",
    },
  ],
  1: [
    {
      tex: String.raw`A_n`,
      label: "Amplitude of partial n",
      meaning: "Bar height in the twelve-slot spectrum, dimmed to a stub whenever Odd harmonics only or a low N silences it.",
      value: "0.125",
    },
    { tex: String.raw`\propto`, glue: true },
    {
      tex: String.raw`n^{-p}`,
      label: "Tilt law",
      meaning: "Power-law rolloff tuned by the Spectral tilt p slider, where p = 1 halves each rising harmonic and p near 0 buzzes.",
      value: "1.0",
    },
  ],
  2: [
    {
      tex: String.raw`f_n`,
      label: "Detuned partial",
      meaning: "Actual frequency of bar n once stretch pushes it sharp of the exact harmonic series into gentle beating.",
      value: "1764.9",
      unit: "Hz",
    },
    { tex: "=", glue: true },
    {
      tex: String.raw`n`,
      label: "Harmonic number",
      meaning: "Index of the partial being retuned, the eighth of twelve bars here.",
      value: "8",
    },
    {
      tex: String.raw`f`,
      label: "Fundamental f",
      meaning: "Fundamental f slider grounding the whole series at 220 Hz.",
      value: "220",
      unit: "Hz",
    },
    {
      tex: String.raw`(1 + b(n-1))`,
      label: "Stretch factor",
      meaning: "Detune b widens with n − 1, so 0.0004 lifts the top partial by a factor of 1.0028 like a stiff piano string.",
      value: "1.0028",
    },
  ],
};
