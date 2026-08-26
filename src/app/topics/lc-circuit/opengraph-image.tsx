import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";
import { getTopic } from "@/lib/topics";

export const alt =
  "LC Circuit: energy sloshing between a charged capacitor and a coil";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const topic = getTopic("lc-circuit");

export default function OgImage() {
  return renderOg(
    topic?.title ?? "LC Circuit",
    topic?.tagline ?? "A spring made of pure fields",
    "#14b8a6"
  );
}
