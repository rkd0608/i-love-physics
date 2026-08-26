import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";
import { getTopic } from "@/lib/topics";

export const alt = "Orbits: Newtonian gravity playground";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const topic = getTopic("orbits");

export default function OgImage() {
  return renderOg(
    topic?.title ?? "Orbits",
    topic?.tagline ?? "Newtonian gravity playground",
    "#53d6f2"
  );
}
