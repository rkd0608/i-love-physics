import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";
import { getTopic } from "@/lib/topics";

export const alt = "Collision Lab: momentum always balances, kinetic energy negotiates";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const topic = getTopic("collision-lab");

export default function OgImage() {
  return renderOg(
    topic?.title ?? "Collision Lab",
    topic?.tagline ?? "Momentum always balances; kinetic energy negotiates.",
    "#f87171"
  );
}
