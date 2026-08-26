import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";
import { getTopic } from "@/lib/topics";

export const alt = "Three-Body Problem: chaos in the rotating frame";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const topic = getTopic("three-body");

export default function OgImage() {
  return renderOg(
    topic?.title ?? "Three-Body Problem",
    topic?.tagline ?? "Chaos in the rotating frame",
    "#f97316"
  );
}
