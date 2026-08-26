import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";
import { getTopic } from "@/lib/topics";

export const alt = "Doppler Effect: wavefronts bunch ahead, stretch behind";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const topic = getTopic("doppler-effect");

export default function OgImage() {
  return renderOg(
    topic?.title ?? "Doppler Effect",
    topic?.tagline ?? "Wavefronts bunch ahead, stretch behind.",
    "#67e8f9"
  );
}
