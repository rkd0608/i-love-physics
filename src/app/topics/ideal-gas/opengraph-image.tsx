import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";
import { getTopic } from "@/lib/topics";

export const alt =
  "Ideal Gas: glowing molecules hammering a piston until measured pressure matches the external load";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const topic = getTopic("ideal-gas");

export default function OgImage() {
  return renderOg(
    topic?.title ?? "Ideal Gas",
    topic?.tagline ?? "Pressure is molecules doing statistics on a wall",
    "#fbbf24"
  );
}
