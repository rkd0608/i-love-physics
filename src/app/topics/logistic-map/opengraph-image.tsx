import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";
import { getTopic } from "@/lib/topics";

export const alt = "Logistic Map: bifurcation cascade, cobweb iterations, and the birth of chaos";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const topic = getTopic("logistic-map");

export default function OgImage() {
  return renderOg(
    topic?.title ?? "Logistic Map",
    topic?.tagline ?? "Chaos hiding inside one multiplication",
    "#65a30d"
  );
}
