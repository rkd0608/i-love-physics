import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";
import { getTopic } from "@/lib/topics";

export const alt =
  "Brachistochrone: straight, arc and cycloid rails race a falling bead";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const topic = getTopic("brachistochrone");

export default function OgImage() {
  return renderOg(
    topic?.title ?? "Brachistochrone",
    topic?.tagline ?? "The curve of fastest descent bends below the straight",
    "#c084fc"
  );
}
