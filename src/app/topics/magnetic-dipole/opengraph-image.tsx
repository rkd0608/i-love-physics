import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";
import { getTopic } from "@/lib/topics";

export const alt = "Magnetic Dipole: one dipole’s field map, read by a compass lattice";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const topic = getTopic("magnetic-dipole");

export default function OgImage() {
  return renderOg(
    topic?.title ?? "Magnetic Dipole",
    topic?.tagline ?? "One dipole’s field map, read by a compass lattice.",
    "#d946ef"
  );
}
