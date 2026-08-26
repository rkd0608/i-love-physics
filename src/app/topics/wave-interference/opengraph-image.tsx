import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";
import { getTopic } from "@/lib/topics";

export const alt = "Wave Interference: two-source field simulation";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const topic = getTopic("wave-interference");

export default function OgImage() {
  return renderOg(
    topic?.title ?? "Wave Interference",
    topic?.tagline ?? "Two sources, one field of fringes",
    "#7ef0b0"
  );
}
