import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";
import { getTopic } from "@/lib/topics";

export const alt = "Standing Waves: harmonics pinned by boundary conditions";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const topic = getTopic("standing-waves");

export default function OgImage() {
  return renderOg(
    topic?.title ?? "Standing Waves",
    topic?.tagline ?? "A string picks only the notes its length allows.",
    "#34d399"
  );
}
