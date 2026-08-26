import type { AnatomyPart } from "./types";

export const olbersParadoxAnatomy: Record<number, AnatomyPart[]> = {
  0: [
    {
      tex: String.raw`\Delta F`,
      label: "Flux step per shell",
      meaning:
        "Each lit shell nudges the cumulative flux bar up by the same amount, however distant it is.",
      value: "one equal bar step per shell",
      unit: "flux steps",
    },
    { tex: String.raw` = `, glue: true },
    {
      tex: String.raw`n`,
      label: "Star count",
      meaning:
        "The sky generator packs more stars into far shells, with counts growing as r² so density cancels dimming.",
      value: "≈ 17 stars in the shell at r = 210 px",
      unit: "stars per shell",
    },
    {
      tex: String.raw` L\,dr`,
      label: "Luminosity × thickness",
      meaning:
        "Brighter stars or thicker shells add proportionally more light to the bar.",
      value: "shells 34 px thick in this sim",
      unit: "px of shell depth",
    },
  ],
  1: [
    {
      tex: String.raw`F`,
      label: "Total flux",
      meaning:
        "Height of the cumulative bar after stacking every shell inside the horizon.",
      value: "6 equal steps with the horizon at 6 of 12 shells",
      unit: "flux steps",
    },
    { tex: String.raw` = `, glue: true },
    { tex: String.raw`\int_0^{R}`, glue: true },
    {
      tex: String.raw` n L\,dr`,
      label: "Shell contribution",
      meaning:
        "Doubling a shell’s distance doubles its stars but quarters each star’s light, so the integrand never fades.",
      value: "identical for every shell on the chart",
      unit: "flux per shell",
    },
    { tex: String.raw` = `, glue: true },
    {
      tex: String.raw`nLR`,
      label: "Runaway growth",
      meaning:
        "Flux grows in lockstep with horizon radius R — an infinite R would flood every line of sight with stellar surface.",
      value: "∝ R: 6 steps at hr = 6, 12 at hr = 12",
      unit: "flux steps",
    },
  ],
  2: [
    {
      tex: String.raw`R_{\text{age}}`,
      label: "Age horizon",
      meaning:
        "Shells beyond the horizon radius are drawn dashed and hollow because their light has not had time to arrive.",
      value: "hr = 6 of 12 shells lit by default",
      unit: "shell count",
    },
    { tex: String.raw` < `, glue: true },
    {
      tex: String.raw`\infty`,
      label: "Infinite-radius limit",
      meaning:
        "Only an eternal universe would let the integral above climb forever without a cap.",
      value: "the bar never flattens while shells keep lighting",
      unit: "shell count",
    },
    { tex: String.raw` \Rightarrow `, glue: true },
    {
      tex: String.raw`\text{dark sky}`,
      label: "Night verdict",
      meaning:
        "A finite lookback time caps the visible shells, which is exactly why the simulated night stays dark.",
      value: "only 6 of 12 shells contribute light",
      unit: "of 12 shells",
    },
  ],
};
