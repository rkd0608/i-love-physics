import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";
import { getTopic } from "@/lib/topics";

export const alt =
  "Maxwell’s Demon: a selective trapdoor heats one chamber while chilling the other";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const topic = getTopic("maxwell-demon");

export default function OgImage() {
  return renderOg(
    topic?.title ?? "Maxwell’s Demon",
    topic?.tagline ?? "A tiny gatekeeper who seems to beat entropy",
    "#4ade80"
  );
}
