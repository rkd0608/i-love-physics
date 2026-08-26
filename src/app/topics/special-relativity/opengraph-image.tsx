import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";
import { getTopic } from "@/lib/topics";

export const alt = "Special Relativity: the light clock, gamma, and the invariant speed";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const topic = getTopic("special-relativity");

export default function OgImage() {
  return renderOg(
    topic?.title ?? "Special Relativity",
    topic?.tagline ?? "One clock, two frames, and light keeping its promise.",
    "#ff6b6b"
  );
}
