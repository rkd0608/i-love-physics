import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";
import { getTopic } from "@/lib/topics";

export const alt = "Kepler’s Laws: equal areas, stretched ellipses, clockwork periods";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const topic = getTopic("kepler-laws");

export default function OgImage() {
  return renderOg(
    topic?.title ?? "Kepler’s Laws",
    topic?.tagline ?? "Equal areas, stretched ellipses, clockwork periods.",
    "#facc15"
  );
}
