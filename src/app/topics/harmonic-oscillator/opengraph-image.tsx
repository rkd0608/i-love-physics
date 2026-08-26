import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";
import { getTopic } from "@/lib/topics";

export const alt = "Harmonic Oscillator: damped SHM with strip chart";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const topic = getTopic("harmonic-oscillator");

export default function OgImage() {
  return renderOg(
    topic?.title ?? "Harmonic Oscillator",
    topic?.tagline ?? "Damped SHM in closed form",
    "#f2708a"
  );
}
