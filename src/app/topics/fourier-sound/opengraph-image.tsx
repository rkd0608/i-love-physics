import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";
import { getTopic } from "@/lib/topics";

export const alt = "Fourier Sound: stacked harmonics, spectrum, beats";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const topic = getTopic("fourier-sound");

export default function OgImage() {
  return renderOg(
    topic?.title ?? "Fourier Sound",
    topic?.tagline ?? "Stack pure tones, sculpt any waveform.",
    "#e879f9"
  );
}
