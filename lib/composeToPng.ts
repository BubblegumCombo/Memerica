import type { MemeCompose } from "@/lib/types";

// Renders a composed meme to a square PNG Blob on a canvas, matching the
// in-app look (Anton caption with a black outline + faint watermark word).
// Client-only. The result is uploaded to S3 via lib/upload.ts.

const SIZE = 1080;

export async function composeToPng(compose: MemeCompose): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  const fontFamily = memeFontFamily();
  await fontsReady();

  // background
  ctx.fillStyle = compose.bg || "#1e1e1e";
  ctx.fillRect(0, 0, SIZE, SIZE);

  // watermark
  if (compose.watermark) {
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.055)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${Math.round(SIZE * 0.42)}px ${fontFamily}`;
    ctx.fillText(compose.watermark.toUpperCase(), SIZE / 2, SIZE / 2);
    ctx.restore();
  }

  drawCaption(ctx, fontFamily, compose.top, SIZE * 0.16);
  drawCaption(ctx, fontFamily, compose.bottom, SIZE * 0.84);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Canvas export failed"))), "image/png");
  });
}

function drawCaption(ctx: CanvasRenderingContext2D, fontFamily: string, text: string, y: number) {
  if (!text) return;
  const size = Math.round(SIZE * 0.075);
  ctx.font = `${size}px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.lineWidth = size * 0.14;
  const value = text.toUpperCase();
  ctx.strokeStyle = "#000";
  ctx.strokeText(value, SIZE / 2, y);
  ctx.fillStyle = "#fff";
  ctx.fillText(value, SIZE / 2, y);
}

/** Resolve the actual Anton font-family from the .meme-cap class (next/font). */
function memeFontFamily(): string {
  const el = document.createElement("span");
  el.className = "meme-cap";
  el.style.position = "absolute";
  el.style.visibility = "hidden";
  document.body.appendChild(el);
  const family = getComputedStyle(el).fontFamily || "Impact, sans-serif";
  document.body.removeChild(el);
  return family;
}

async function fontsReady(): Promise<void> {
  try {
    if (typeof document !== "undefined" && document.fonts) await document.fonts.ready;
  } catch {
    /* fall back to Impact */
  }
}
