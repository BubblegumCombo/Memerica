import type { Post } from "@/lib/types";
import { MemeVideo } from "./MemeVideo";

/** Treat S3 keys/URLs ending in a video extension as videos. */
const isVideoUrl = (src: string) => /\.(mp4|webm|mov)(\?|$)/i.test(src);

/**
 * Renders a meme's visual, scaled to FIT (never cropped):
 *  - any post with an image (uploaded, or composed-on-an-image) shows the
 *    picture object-contained on a dark backdrop, with top/bottom Anton
 *    captions overlaid when the meme was composed (falling back to a single
 *    legacy caption line);
 *  - a composed meme with no image is drawn as a colored card with a faint
 *    watermark word and two caption lines (the original seed look).
 *
 * `fill` makes the media fill its parent (the feed card); otherwise it uses a
 * fixed `height` (composer preview, etc.).
 */
export function MemeMedia({
  post,
  height = 360,
  fill = false,
  captionSize = 29,
  watermarkSize,
}: {
  post: Post;
  height?: number;
  fill?: boolean;
  captionSize?: number;
  watermarkSize?: number;
}) {
  const c = post.compose;
  const sizeStyle = fill ? undefined : { height };

  if (post.imageUrl) {
    const hasOverlay = Boolean(c && (c.top || c.bottom));
    return (
      <div
        className={`relative w-full overflow-hidden bg-black ${fill ? "h-full" : ""}`}
        style={sizeStyle}
      >
        {isVideoUrl(post.imageUrl) ? (
          <MemeVideo src={post.imageUrl} className="h-full w-full object-contain" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.imageUrl} alt={c?.top || post.caption || "meme"} className="h-full w-full object-contain" />
        )}
        {hasOverlay ? (
          <>
            {c?.top ? (
              <div
                className="meme-cap absolute inset-x-0 top-3 text-center"
                style={{ fontSize: captionSize, padding: "0 18px" }}
              >
                {c.top}
              </div>
            ) : null}
            {c?.bottom ? (
              <div
                className="meme-cap absolute inset-x-0 bottom-3 text-center"
                style={{ fontSize: captionSize, padding: "0 18px" }}
              >
                {c.bottom}
              </div>
            ) : null}
          </>
        ) : post.caption ? (
          <div
            className="meme-cap absolute inset-x-0 bottom-4 text-center"
            style={{ fontSize: captionSize, padding: "0 18px" }}
          >
            {post.caption}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={`relative flex flex-col justify-between ${fill ? "h-full" : ""}`}
      style={{ ...sizeStyle, background: c?.bg ?? "#1e1e1e", padding: "22px 16px" }}
    >
      {c?.watermark ? (
        <div
          className="meme-wm pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{ fontSize: watermarkSize ?? Math.round(height * 0.39) }}
        >
          {c.watermark}
        </div>
      ) : null}
      <div className="meme-cap relative text-center" style={{ fontSize: captionSize }}>
        {c?.top}
      </div>
      <div className="meme-cap relative text-center" style={{ fontSize: captionSize }}>
        {c?.bottom}
      </div>
    </div>
  );
}
