import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";
import { getTopic } from "@/lib/topics";

export const alt = "Diffusion & Random Walks: ten thousand drunk walkers drawing a Gaussian bell";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const topic = getTopic("diffusion-random-walk");

export default function OgImage() {
  return renderOg(
    topic?.title ?? "Diffusion & Random Walks",
    topic?.tagline ?? "Ten thousand drunk walkers draw a Gaussian.",
    "#94a3b8"
  );
}
