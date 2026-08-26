import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";
import { getTopic } from "@/lib/topics";

export const alt = "Zeno & Achilles: infinitely many dashes, one finite finish";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const topic = getTopic("zeno-achilles");

export default function OgImage() {
  return renderOg(
    topic?.title ?? "Zeno & Achilles",
    topic?.tagline ?? "Infinitely many steps, one finite afternoon.",
    "#f9a8d4"
  );
}
