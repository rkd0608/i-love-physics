import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";
import { getTopic } from "@/lib/topics";

export const alt = "Angular Momentum: arms in, spin up — the figure-skater spin-up";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const topic = getTopic("angular-momentum");

export default function OgImage() {
  return renderOg(
    topic?.title ?? "Angular Momentum",
    topic?.tagline ?? "Arms in, spin up: the skater’s secret.",
    "#0d9488"
  );
}
