import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

export function renderOg(
  title: string,
  tagline: string,
  accent: string
): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #060a17 0%, #0a0f22 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div
            style={{
              width: "22px",
              height: "22px",
              borderRadius: "999px",
              background: accent,
            }}
          />
          <div
            style={{
              color: "#e6ebff",
              fontSize: "34px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            i love physics
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              color: "#ffffff",
              fontSize: "88px",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
            }}
          >
            {title}
          </div>
          <div style={{ color: "#8b93b8", fontSize: "38px", lineHeight: 1.3 }}>
            {tagline}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "64px", height: "4px", background: accent }} />
          <div style={{ color: "#53d6f2", fontSize: "26px" }}>
            interactive simulations · live equations
          </div>
        </div>
      </div>
    ),
    OG_SIZE
  );
}
