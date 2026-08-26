import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";
import { getTopic } from "@/lib/topics";

export const alt =
  "Coupled Oscillators: two masses, three springs, beats of energy transfer";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const topic = getTopic("coupled-modes");

export default function OgImage() {
  return renderOg(
    topic?.title ?? "Coupled Oscillators",
    topic?.tagline ?? "Energy learning to share",
    "#5eead4"
  );
}
