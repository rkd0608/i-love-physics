import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";
import { getTopic } from "@/lib/topics";

export const alt = "Hohmann Transfer: two burns on the cheapest road between orbits";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const topic = getTopic("hohmann-transfer");

export default function OgImage() {
  return renderOg(
    topic?.title ?? "Hohmann Transfer",
    topic?.tagline ?? "Two burns on the cheapest road between orbits.",
    "#4f46e5"
  );
}
