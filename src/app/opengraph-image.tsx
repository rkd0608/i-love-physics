import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";

export const alt = "i love physics: cinematic interactive physics simulations";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OgImage() {
  return renderOg("i love physics", "Cinematic physics you can grab.", "#53d6f2");
}
