import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";
import { getTopic } from "@/lib/topics";

export const alt = "Thin Lenses: three principal rays decide where every image lives";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const topic = getTopic("thin-lenses");

export default function OgImage() {
  return renderOg(
    topic?.title ?? "Thin Lenses",
    topic?.tagline ?? "Three rays decide where every image lives",
    "#0ea5e9"
  );
}
