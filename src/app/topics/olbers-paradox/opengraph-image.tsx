import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";
import { getTopic } from "@/lib/topics";

export const alt =
  "Olbers’ Paradox: why an infinite universe of stars still leaves a dark night sky";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const topic = getTopic("olbers-paradox");

export default function OgImage() {
  return renderOg(
    topic?.title ?? "Olbers’ Paradox",
    topic?.tagline ?? "Infinite stars should set the night ablaze. Why dark?",
    "#93c5fd"
  );
}
