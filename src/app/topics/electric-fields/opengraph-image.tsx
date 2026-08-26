import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";
import { getTopic } from "@/lib/topics";

export const alt = "Electric Fields: draggable charge layouts drawn as field lines and equipotentials";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const topic = getTopic("electric-fields");

export default function OgImage() {
  return renderOg(
    topic?.title ?? "Electric Fields",
    topic?.tagline ?? "Charge layouts drawn as fields you can probe.",
    "#f0abfc"
  );
}
