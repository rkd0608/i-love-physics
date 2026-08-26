import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";
import { getTopic } from "@/lib/topics";

export const alt = "Twin Paradox: the kinked worldline ages less";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const topic = getTopic("twin-paradox");

export default function OgImage() {
  return renderOg(
    topic?.title ?? "Twin Paradox",
    topic?.tagline ?? "Race your twin across spacetime and age less.",
    "#ff9e64"
  );
}
