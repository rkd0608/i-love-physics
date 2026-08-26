import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";
import { getTopic } from "@/lib/topics";

export const alt = "Snell’s Law: light bends where speeds change — until it won’t.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const topic = getTopic("snells-law");

export default function OgImage() {
  return renderOg(
    topic?.title ?? "Snell’s Law",
    topic?.tagline ?? "Light bends where speeds change — until it won’t.",
    "#7dd3fc"
  );
}
