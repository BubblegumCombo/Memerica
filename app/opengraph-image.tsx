import { ImageResponse } from "next/og";

export const alt = "Memerica — Freedom of the Feed";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Default link-preview card for shared Memerica links.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background: "#0a0a0a",
          padding: "0 96px",
        }}
      >
        <div
          style={{
            display: "flex",
            height: 64,
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 0 0 2px rgba(255,255,255,0.14)",
          }}
        >
          <div
            style={{
              width: 70,
              background: "#3c3b6e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 40,
            }}
          >
            ★
          </div>
          <div style={{ display: "flex", flexDirection: "column", width: 78 }}>
            <div style={{ flex: 1, background: "#b22234" }} />
            <div style={{ flex: 1, background: "#f5f5f5" }} />
            <div style={{ flex: 1, background: "#b22234" }} />
            <div style={{ flex: 1, background: "#f5f5f5" }} />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", marginTop: 44 }}>
          <div style={{ fontSize: 116, fontWeight: 800, color: "#fafafa", letterSpacing: -3 }}>
            MEMERICA
          </div>
          <div style={{ fontSize: 96, color: "#b22234", marginLeft: 18 }}>★</div>
        </div>
        <div style={{ display: "flex", fontSize: 40, color: "#8a8a8a", marginTop: 18 }}>
          Freedom of the Feed — swipe, react, run the thread.
        </div>
      </div>
    ),
    { ...size },
  );
}
