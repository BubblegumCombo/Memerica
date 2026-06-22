"use client";

import { useParams, useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import type { Comment, Post } from "@/lib/types";
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
  const [replyTo, setReplyTo] = useState<{ id: string; author: string } | null>(null);

  const post = getPost(id);
  const comments = getComments(id);
  const topLevel = comments.filter((c) => !c.parentId);
  const repliesByParent = comments.reduce<Record<string, Comment[]>>((acc, c) => {
    if (c.parentId) (acc[c.parentId] ??= []).push(c);
    return acc;
  }, {});
  const topLevelIds = new Set(topLevel.map((c) => c.id));
  // Replies whose parent isn't a loaded top-level comment (deletes, partial
  // loads, an unreconciled optimistic parent) — surface them so nothing is dropped.
  const orphanReplies = Object.entries(repliesByParent)
    .filter(([pid]) => !topLevelIds.has(pid))
    .flatMap(([, rs]) => rs);

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
    if (!draft.trim()) return;
    addComment(id, draft, replyTo?.id ?? null);
    setDraft("");
    setReplyTo(null);
  }

  // Replies are one level deep: replying to a reply attaches to its top-level
  // parent, so we seed an @mention to keep that addressee visible.
  function startReply(c: Comment) {
    setReplyTo({ id: c.parentId ?? c.id, author: c.author });
    if (c.parentId) setDraft((d) => (d.trim() ? d : `@${c.author} `));
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

        {topLevel.map((c) => (
          <Fragment key={c.id}>
            <CommentItem
              comment={c}
              onVote={(dir) => voteComment(id, c.id, dir)}
              onReply={() => startReply(c)}
            />
            {(repliesByParent[c.id] ?? []).map((r) => (
              <CommentItem
                key={r.id}
                comment={r}
                isReply
                onVote={(dir) => voteComment(id, r.id, dir)}
                onReply={() => startReply(r)}
              />
            ))}
          </Fragment>
        ))}

        {orphanReplies.map((r) => (
          <CommentItem
            key={r.id}
            comment={r}
            onVote={(dir) => voteComment(id, r.id, dir)}
            onReply={() => startReply(r)}
          />
        ))}

        {comments.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-2">No comments yet — say something.</p>
        ) : (
          <div className="h-3" />
        )}
      </div>

      {/* composer */}
      <div
        className="border-t border-line-soft bg-bar px-3 pt-2.5"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 16px)" }}
      >
        {replyTo ? (
          <div className="mb-2 flex items-center justify-between rounded-lg bg-input-2 px-3 py-1.5 text-xs text-muted">
            <span>
              Replying to <span className="font-semibold text-ink-2">{replyTo.author}</span>
            </span>
            <button
              onClick={() => setReplyTo(null)}
              aria-label="Cancel reply"
              className="px-1 text-sm font-semibold text-muted-2"
            >
              ✕
            </button>
          </div>
        ) : null}
        <div className="flex items-center gap-2.5">
          <Avatar initials={you.initials} color={you.color} size={32} imageUrl={you.avatarUrl} />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing) send();
            }}
            placeholder={replyTo ? `Reply to ${replyTo.author}…` : "Add a comment…"}
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
      </div>
    </AppShell>
  );
}

function MemeThumb({ post }: { post: Post }) {
  if (post.imageUrl) {
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

function CommentItem({
  comment,
  isReply = false,
  onVote,
  onReply,
}: {
  comment: Comment;
  isReply?: boolean;
  onVote: (dir: 1 | -1) => void;
  onReply: () => void;
}) {
  // Don't allow replying until the (resolved) parent has a real persisted id.
  const replyParentId = comment.parentId ?? comment.id;
  const canReply = !replyParentId.startsWith("tmp-");
  return (
    <div className={`flex gap-[11px] py-3.5 pr-4 ${isReply ? "pl-14" : "pl-4"}`}>
      <Avatar initials={comment.initials} color={comment.color} size={isReply ? 28 : 34} imageUrl={comment.avatarUrl} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-[13px] font-semibold">{comment.author}</span>
          <span className="text-[11px] text-muted-2">{comment.time}</span>
        </div>
        <div className="mt-0.5 text-sm leading-snug text-ink-2">{comment.text}</div>
        <div className="mt-2 flex items-center gap-1.5">
          <button
            onClick={() => onVote(1)}
            aria-label="Upvote comment"
            className="flex items-center gap-[5px] px-1.5 py-[3px] text-xs font-semibold"
            style={{ color: comment.vote === 1 ? LIKE : MUTED }}
          >
            <ThumbUp size={15} strokeWidth={2} fill={comment.vote === 1 ? LIKE : "none"} />
            <span className="tabular-nums">{comment.up}</span>
          </button>
          <button
            onClick={() => onVote(-1)}
            aria-label="Downvote comment"
            className="flex items-center gap-[5px] px-1.5 py-[3px] text-xs font-semibold"
            style={{ color: comment.vote === -1 ? DISLIKE : MUTED }}
          >
            <ThumbDown size={15} strokeWidth={2} fill={comment.vote === -1 ? DISLIKE : "none"} />
            <span className="tabular-nums">{comment.down}</span>
          </button>
          <button
            onClick={onReply}
            disabled={!canReply}
            aria-label={`Reply to ${comment.author}`}
            className="px-1.5 py-[3px] text-xs font-semibold text-muted-2 disabled:opacity-40"
          >
            Reply
          </button>
        </div>
      </div>
    </div>
  );
}
