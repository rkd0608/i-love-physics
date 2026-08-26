import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";
import { getTopic } from "@/lib/topics";

export const alt = "Double Pendulum: RK4 chaos with a ghost twin";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const topic = getTopic("double-pendulum");

export default function OgImage() {
  return renderOg(
    topic?.title ?? "Double Pendulum",
    topic?.tagline ?? "Chaos you can measure, not just watch",
    "#ffd27a"
  );
}
