import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";
import { getTopic } from "@/lib/topics";

export const alt = "Quantum Tunneling: a wavepacket crosses a wall it cannot climb";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const topic = getTopic("quantum-tunneling");

export default function OgImage() {
  return renderOg(
    topic?.title ?? "Quantum Tunneling",
    topic?.tagline ?? "A wavepacket walks through a wall it cannot climb",
    "#a3e635"
  );
}
