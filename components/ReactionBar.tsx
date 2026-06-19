"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/lib/data/store";
import { fmt } from "@/lib/feed";
import { ThumbUp, ThumbDown, CommentIcon } from "./icons";

const LIKE = "#3b82f6";
const DISLIKE = "#ef4444";
const MUTED = "#8a8a8a";

/** Like / dislike / comment row for a feed card (Memerica.dc.html:119-124). */
export function ReactionBar({ postId }: { postId: string }) {
  const { getPost, getReaction, getComments, vote } = useStore();
  const router = useRouter();
  const post = getPost(postId);
  if (!post) return null;

  const v = getReaction(postId);
  const liked = v === 1;
  const disliked = v === -1;
  const commentCount = getComments(postId).length;

  return (
    <div className="flex items-center gap-2 p-3">
      <button
        type="button"
        onClick={() => vote(postId, 1)}
        aria-pressed={liked}
        aria-label="Like"
        className="flex h-10 items-center gap-[7px] rounded-[20px] px-3.5 text-sm font-semibold"
        style={{ background: liked ? "rgba(59,130,246,0.16)" : "transparent", color: liked ? LIKE : MUTED }}
      >
        <ThumbUp fill={liked ? LIKE : "none"} />
        <span className="tabular-nums">{fmt(post.likeCount)}</span>
      </button>

      <button
        type="button"
        onClick={() => vote(postId, -1)}
        aria-pressed={disliked}
        aria-label="Dislike"
        className="flex h-10 items-center gap-[7px] rounded-[20px] px-3.5 text-sm font-semibold"
        style={{ background: disliked ? "rgba(239,68,68,0.16)" : "transparent", color: disliked ? DISLIKE : MUTED }}
      >
        <ThumbDown fill={disliked ? DISLIKE : "none"} />
        <span className="tabular-nums">{fmt(post.dislikeCount)}</span>
      </button>

      <span className="flex-1" />

      <button
        type="button"
        onClick={() => router.push(`/m/${postId}`)}
        aria-label="Comments"
        className="flex h-10 items-center gap-[7px] rounded-[20px] px-3.5 text-sm font-semibold"
        style={{ color: MUTED }}
      >
        <CommentIcon />
        <span className="tabular-nums">{commentCount}</span>
      </button>
    </div>
  );
}
