"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useStore } from "@/lib/data/store";
import { fmt } from "@/lib/feed";
import { ThumbUp, ThumbDown, CommentIcon } from "@/components/icons";

const TEXT_SHADOW = "0 1px 3px rgba(0,0,0,.7)";

/** Full-bleed, vertically-paged feed (the design's "Variation 2"). */
export default function ReelPage() {
  const { feed } = useStore();

  return (
    <div className="flex min-h-[100dvh] justify-center bg-black">
      <div className="relative h-[100dvh] w-full max-w-[460px] overflow-hidden bg-app">
        {feed.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-8 text-center">
            <p className="text-[15px] font-semibold text-ink">Nothing to reel through yet</p>
            <Link href="/feed" className="text-sm font-semibold text-like">
              Back to feed
            </Link>
          </div>
        ) : (
          <div className="no-scrollbar h-full overflow-y-auto" style={{ scrollSnapType: "y mandatory" }}>
            {feed.map((post) => (
              <ReelSlide key={post.id} postId={post.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReelSlide({ postId }: { postId: string }) {
  const { getPost, getReaction, getComments, vote } = useStore();
  const router = useRouter();
  const post = getPost(postId);
  if (!post) return null;

  const v = getReaction(postId);
  const liked = v === 1;
  const disliked = v === -1;
  const comments = getComments(postId).length;
  const c = post.compose;

  return (
    <section
      className="relative h-[100dvh] w-full flex-none overflow-hidden"
      style={{ scrollSnapAlign: "start", background: c?.bg ?? "#111" }}
    >
      {post.kind === "image" && post.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.imageUrl} alt={post.caption ?? "meme"} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <>
          {c?.watermark ? (
            <div
              className="meme-wm pointer-events-none absolute inset-0 flex items-center justify-center"
              style={{ fontSize: 230 }}
            >
              {c.watermark}
            </div>
          ) : null}
          <div className="meme-cap absolute right-16 left-0 text-center" style={{ top: 120, fontSize: 34, padding: "0 18px" }}>
            {c?.top}
          </div>
          <div className="meme-cap absolute right-16 left-0 text-center" style={{ bottom: 230, fontSize: 34, padding: "0 18px" }}>
            {c?.bottom}
          </div>
        </>
      )}

      {/* top overlay */}
      <div
        className="absolute right-0 left-0 flex items-center justify-between px-4"
        style={{ top: "calc(env(safe-area-inset-top, 0px) + 14px)" }}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-[18px] overflow-hidden rounded-[3px]">
            <div className="w-1 bg-dislike" />
            <div className="w-1 bg-white" />
            <div className="w-1 bg-like" />
          </div>
          <span className="text-[18px] font-extrabold text-white" style={{ textShadow: "0 1px 4px rgba(0,0,0,.6)" }}>
            MEMERICA
          </span>
        </div>
        <Link href="/feed" className="rounded-full bg-black/35 px-[11px] py-[5px] text-xs font-semibold text-white">
          For You
        </Link>
      </div>

      {/* right action rail */}
      <div className="absolute right-3 flex flex-col items-center gap-5" style={{ bottom: 150 }}>
        <RailButton onClick={() => vote(postId, 1)} bg={liked ? "#3b82f6" : "rgba(255,255,255,0.16)"} count={fmt(post.likeCount)} label="Like">
          <ThumbUp size={26} fill={liked ? "#3b82f6" : "none"} />
        </RailButton>
        <RailButton onClick={() => vote(postId, -1)} bg={disliked ? "#ef4444" : "rgba(255,255,255,0.16)"} count={fmt(post.dislikeCount)} label="Dislike">
          <ThumbDown size={26} fill={disliked ? "#ef4444" : "none"} />
        </RailButton>
        <RailButton onClick={() => router.push(`/m/${postId}`)} bg="rgba(255,255,255,0.16)" count={String(comments)} label="Comments">
          <CommentIcon size={26} />
        </RailButton>
      </div>
    </section>
  );
}

function RailButton({
  children,
  onClick,
  bg,
  count,
  label,
}: {
  children: ReactNode;
  onClick: () => void;
  bg: string;
  count: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-[5px]">
      <button
        onClick={onClick}
        aria-label={label}
        className="flex h-[52px] w-[52px] items-center justify-center rounded-full text-white"
        style={{ background: bg }}
      >
        {children}
      </button>
      <span className="text-xs font-bold tabular-nums text-white" style={{ textShadow: TEXT_SHADOW }}>
        {count}
      </span>
    </div>
  );
}
