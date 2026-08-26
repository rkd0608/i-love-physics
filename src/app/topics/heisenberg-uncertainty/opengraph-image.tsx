import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";
import { getTopic } from "@/lib/topics";

export const alt = "Heisenberg Uncertainty: squeeze a wave here and it smears there";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const topic = getTopic("heisenberg-uncertainty");

export default function OgImage() {
  return renderOg(
    topic?.title ?? "Heisenberg Uncertainty",
    topic?.tagline ?? "Squeeze a wave here and it smears there",
    "#818cf8"
  );
}
