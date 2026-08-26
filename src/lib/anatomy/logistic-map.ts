import type { AnatomyPart } from "./types";

export const logisticMapAnatomy: Record<number, AnatomyPart[]> = {
  103: [
    {
      tex: String.raw`x_{n+1}`,
      label: "Next generation",
      meaning: "The newest bar scrolling into the green time-series strip.",
      value: "0.51",
      unit: "population",
    },
    { tex: " = ", glue: true },
    {
      tex: "r",
      label: "Growth rate",
      meaning: "The Growth-rate slider, sitting at 3.2 where the cobweb settles into a two-beat flicker.",
      value: "3.2",
      unit: "dimensionless",
    },
    { tex: String.raw`\,`, glue: true },
    {
      tex: String.raw`x_n`,
      label: "Current population",
      meaning: "The brightest cobweb dot, bouncing between parabola and diagonal.",
      value: "0.8",
      unit: "population",
    },
    {
      tex: "(1 - x_n)",
      label: "Crowding brake",
      meaning: "The still-empty share of habitat; crowded populations squeeze their own growth.",
      value: "0.2",
      unit: "dimensionless",
    },
  ],
  104: [
    {
      tex: String.raw`x^{*}`,
      label: "Steady state",
      meaning: "The plateau the time-series flattens to whenever r sits below 3.",
      value: "0.6",
      unit: "population",
    },
    { tex: " = ", glue: true },
    { tex: "1", glue: true },
    { tex: " - ", glue: true },
    {
      tex: String.raw`\frac{1}{r}`,
      label: "Growth discount",
      meaning: "Bigger sliders shave a smaller slice — at r = 2.5 it is exactly 0.4 — lifting the plateau toward 1.",
      value: "0.4",
      unit: "dimensionless",
    },
  ],
  105: [
    {
      tex: String.raw`\delta`,
      label: "Feigenbaum’s constant",
      meaning: "Measure successive fork spacings on the bifurcation canvas and their ratio converges here.",
      value: "4.6692",
      unit: "dimensionless",
    },
    { tex: " = ", glue: true },
    {
      tex: String.raw`4.6692\ldots`,
      label: "The digits",
      meaning: "The cascade marks at r ≈ 3.449, 3.544, 3.570 pile toward chaos at this shrink rate.",
      value: "4.6692",
      unit: "dimensionless",
    },
  ],
};
