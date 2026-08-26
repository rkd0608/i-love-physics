import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";
import { getTopic } from "@/lib/topics";

export const alt =
  "Quantum Double-Slit: one particle at a time builds an interference pattern";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const topic = getTopic("quantum-double-slit");

export default function OgImage() {
  return renderOg(
    topic?.title ?? "Quantum Double-Slit",
    topic?.tagline ?? "One particle at a time builds an interference pattern",
    "#2dd4bf"
  );
}
