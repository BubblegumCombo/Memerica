import type { Post } from "@/lib/types";

/**
 * Renders a meme's visual. "composed" memes are drawn as a colored card with a
 * faint watermark word and two Anton caption lines (matching the design);
 * "image" memes render the uploaded picture.
 */
export function MemeMedia({
  post,
  height = 360,
  captionSize = 29,
  watermarkSize,
}: {
  post: Post;
  height?: number;
  captionSize?: number;
  watermarkSize?: number;
}) {
  if (post.kind === "image" && post.imageUrl) {
    return (
      <div className="relative w-full overflow-hidden" style={{ height }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={post.imageUrl} alt={post.caption ?? "meme"} className="h-full w-full object-cover" />
        {post.caption ? (
          <div
            className="meme-cap absolute right-0 bottom-4 left-0 text-center"
            style={{ fontSize: captionSize, padding: "0 18px" }}
          >
            {post.caption}
          </div>
        ) : null}
      </div>
    );
  }

  const c = post.compose;
  return (
    <div
      className="relative flex flex-col justify-between"
      style={{ height, background: c?.bg ?? "#1e1e1e", padding: "22px 16px" }}
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
