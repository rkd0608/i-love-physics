import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";
import { getTopic } from "@/lib/topics";

export const alt = "Cosmological Redshift: space itself stretches the light moving through it";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const topic = getTopic("cosmological-redshift");

export default function OgImage() {
  return renderOg(
    topic?.title ?? "Cosmological Redshift",
    topic?.tagline ?? "Space itself stretches the light moving through it",
    "#e11d48"
  );
}
