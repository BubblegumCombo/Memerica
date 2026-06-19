"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import type { Post } from "@/lib/types";
import { AppShell } from "@/components/AppShell";
import { Avatar } from "@/components/Avatar";
import { useStore } from "@/lib/data/store";
import { fmt } from "@/lib/feed";
import { ThumbUp, ThumbDown, ChevronLeft, SendIcon } from "@/components/icons";

const LIKE = "#3b82f6";
const DISLIKE = "#ef4444";
const MUTED = "#8a8a8a";

export default function CommentsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getPost, getComments, voteComment, addComment, you } = useStore();
  const [draft, setDraft] = useState("");

  const post = getPost(id);
  const comments = getComments(id);

  if (!post) {
    return (
      <AppShell className="h-[100dvh] overflow-hidden">
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
          <p className="text-muted">That meme isn’t here.</p>
          <button onClick={() => router.push("/feed")} className="font-semibold text-like">
            Back to feed
          </button>
        </div>
      </AppShell>
    );
  }

  const caption = post.caption ?? (post.compose ? `${post.compose.top} ${post.compose.bottom}` : "");
  const summary = `${fmt(post.likeCount)} liked · ${fmt(post.dislikeCount)} disliked`;

  function send() {
    addComment(id, draft);
    setDraft("");
  }

  return (
    <AppShell className="h-[100dvh] overflow-hidden">
      {/* header */}
      <div
        className="flex items-center gap-1.5 border-b border-line-soft bg-bar px-3 pb-3"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 14px)" }}
      >
        <button
          onClick={() => router.back()}
          aria-label="Back"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-ink"
        >
          <ChevronLeft size={22} strokeWidth={2.2} />
        </button>
        <span className="text-[17px] font-bold">Comments</span>
      </div>

      {/* scrollable thread */}
      <div className="no-scrollbar flex-1 overflow-y-auto">
        <div className="flex items-center gap-2.5 border-b border-[#161616] px-4 py-3.5">
          <MemeThumb post={post} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold text-[#e8e8e8]">{caption}</div>
            <div className="mt-[3px] text-xs text-muted">{summary}</div>
          </div>
        </div>

        {comments.map((c) => (
          <div key={c.id} className="flex gap-[11px] px-4 py-3.5">
            <Avatar initials={c.initials} color={c.color} size={34} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-[13px] font-semibold">{c.author}</span>
                <span className="text-[11px] text-muted-2">{c.time}</span>
              </div>
              <div className="mt-0.5 text-sm leading-snug text-ink-2">{c.text}</div>
              <div className="mt-2 flex items-center gap-1.5">
                <button
                  onClick={() => voteComment(id, c.id, 1)}
                  aria-label="Upvote comment"
                  className="flex items-center gap-[5px] px-1.5 py-[3px] text-xs font-semibold"
                  style={{ color: c.vote === 1 ? LIKE : MUTED }}
                >
                  <ThumbUp size={15} strokeWidth={2} fill={c.vote === 1 ? LIKE : "none"} />
                  <span className="tabular-nums">{c.up}</span>
                </button>
                <button
                  onClick={() => voteComment(id, c.id, -1)}
                  aria-label="Downvote comment"
                  className="flex items-center gap-[5px] px-1.5 py-[3px] text-xs font-semibold"
                  style={{ color: c.vote === -1 ? DISLIKE : MUTED }}
                >
                  <ThumbDown size={15} strokeWidth={2} fill={c.vote === -1 ? DISLIKE : "none"} />
                  <span className="tabular-nums">{c.down}</span>
                </button>
                <span className="px-1.5 py-[3px] text-xs font-semibold text-muted-2">Reply</span>
              </div>
            </div>
          </div>
        ))}

        {comments.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-2">No comments yet — say something.</p>
        ) : (
          <div className="h-3" />
        )}
      </div>

      {/* composer */}
      <div
        className="flex items-center gap-2.5 border-t border-line-soft bg-bar px-3 pt-2.5"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 16px)" }}
      >
        <Avatar initials={you.initials} color={you.color} size={32} />
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          placeholder="Add a comment…"
          className="h-10 flex-1 rounded-[20px] border border-line-strong bg-input-2 px-4 text-sm text-ink outline-none placeholder:text-muted-2"
        />
        <button
          onClick={send}
          disabled={!draft.trim()}
          aria-label="Send comment"
          className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-like text-white disabled:opacity-50"
        >
          <SendIcon />
        </button>
      </div>
    </AppShell>
  );
}

function MemeThumb({ post }: { post: Post }) {
  if (post.kind === "image" && post.imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={post.imageUrl} alt="" className="h-12 w-12 flex-none rounded-lg object-cover" />;
  }
  return (
    <div
      className="flex h-12 w-12 flex-none items-center justify-center overflow-hidden rounded-lg p-1"
      style={{ background: post.compose?.bg ?? "#2a2a2a" }}
    >
      <span className="meme-cap" style={{ fontSize: 9, lineHeight: 1 }}>
        {post.compose?.watermark}
      </span>
    </div>
  );
}
