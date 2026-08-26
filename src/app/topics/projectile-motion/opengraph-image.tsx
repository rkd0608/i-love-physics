import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";
import { getTopic } from "@/lib/topics";

export const alt = "Projectile Motion: quadratic drag vs. vacuum";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const topic = getTopic("projectile-motion");

export default function OgImage() {
  return renderOg(
    topic?.title ?? "Projectile Motion",
    topic?.tagline ?? "Quadratic drag vs. the vacuum ghost",
    "#b48cf2"
  );
}
