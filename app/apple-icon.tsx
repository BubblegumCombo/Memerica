import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS home-screen icon (PNG) — the stars & stripes emblem on the app surface.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
        }}
      >
        <div style={{ display: "flex", height: 100, borderRadius: 14, overflow: "hidden" }}>
          <div
            style={{
              width: 58,
              background: "#3c3b6e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 54,
            }}
          >
            ★
          </div>
          <div style={{ display: "flex", flexDirection: "column", width: 58 }}>
            <div style={{ flex: 1, background: "#b22234" }} />
            <div style={{ flex: 1, background: "#f5f5f5" }} />
            <div style={{ flex: 1, background: "#b22234" }} />
            <div style={{ flex: 1, background: "#f5f5f5" }} />
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
