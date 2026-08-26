import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";
import { getTopic } from "@/lib/topics";

export const alt = "Electromagnetic Induction: a falling magnet through a coil";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const topic = getTopic("electromagnetic-induction");

export default function OgImage() {
  return renderOg(
    topic?.title ?? "Electromagnetic Induction",
    topic?.tagline ?? "A falling magnet, a coil, and Faraday’s living ledger.",
    "#c026d3"
  );
}
