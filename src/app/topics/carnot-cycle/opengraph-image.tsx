import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";
import { getTopic } from "@/lib/topics";

export const alt = "Carnot Cycle: two isotherms, two adiabats, one perfect engine";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const topic = getTopic("carnot-cycle");

export default function OgImage() {
  return renderOg(
    topic?.title ?? "Carnot Cycle",
    topic?.tagline ?? "Two isotherms, two adiabats, one perfect engine.",
    "#d97706"
  );
}
