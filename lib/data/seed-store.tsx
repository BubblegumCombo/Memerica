"use client";

import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import type { Comment, Invitation, Member, Post, Role, Tag, Vote } from "@/lib/types";
import { feedForMember } from "@/lib/feed";
import { StoreContext, type NewPostInput, type Store } from "./store-context";
import {
  COMMENTS,
  INVITATIONS,
  MEMBERS,
  POSTS,
  REACTIONS,
  SPACE,
  TAGS,
  YOU,
  YOU_STATS,
} from "./seed";

const TAG_PALETTE = [
  "#3b82f6", "#ec4899", "#eab308", "#22c55e", "#f59e0b", "#06b6d4", "#a855f7", "#f97316", "#14b8a6",
];

/** In-memory seed implementation of the store (used when Supabase isn't configured). */
export function SeedStoreProvider({ children }: { children: ReactNode }) {
  const [you, setYou] = useState<Member>(YOU);
  const [members, setMembers] = useState<Member[]>(MEMBERS);
  const [tags, setTags] = useState<Tag[]>(TAGS);
  const [posts, setPosts] = useState<Post[]>(POSTS);
  const [comments, setComments] = useState<Record<string, Comment[]>>(COMMENTS);
  const [reactions, setReactions] = useState<Record<string, Vote>>(REACTIONS);
  const [invitations, setInvitations] = useState<Invitation[]>(INVITATIONS);
  const seq = useRef({ comment: 1, post: 1, invite: 1 });

  const vote = useCallback(
    (postId: string, dir: 1 | -1) => {
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          const current = reactions[postId] ?? 0;
          let like = p.likeCount;
          let dislike = p.dislikeCount;
          if (current === 1) like--;
          if (current === -1) dislike--;
          if (current !== dir) {
            if (dir === 1) like++;
            else dislike++;
          }
          return { ...p, likeCount: like, dislikeCount: dislike };
        }),
      );
      setReactions((prev) => {
        const current = prev[postId] ?? 0;
        return { ...prev, [postId]: current === dir ? 0 : dir };
      });
    },
    [reactions],
  );

  const addComment = useCallback(
    (postId: string, text: string, parentId?: string | null) => {
      const body = text.trim();
      if (!body) return;
      const comment: Comment = {
        id: `u${seq.current.comment++}`,
        postId,
        parentId: parentId ?? null,
        author: you.name,
        initials: you.initials,
        color: you.color,
        text: body,
        time: "now",
        up: 0,
        down: 0,
        vote: 0,
      };
      setComments((prev) => ({ ...prev, [postId]: [...(prev[postId] ?? []), comment] }));
    },
    [you],
  );

  const voteComment = useCallback((postId: string, commentId: string, dir: 1 | -1) => {
    setComments((prev) => {
      const list = (prev[postId] ?? []).map((c) => {
        if (c.id !== commentId) return c;
        let { up, down } = c;
        const v = c.vote;
        if (v === 1) up--;
        if (v === -1) down--;
        const next: Vote = v === dir ? 0 : dir;
        if (v !== dir) {
          if (dir === 1) up++;
          else down++;
        }
        return { ...c, up, down, vote: next };
      });
      return { ...prev, [postId]: list };
    });
  }, []);

  const setRole = useCallback((role: Role) => setYou((p) => ({ ...p, role })), []);

  const createTag = useCallback((name: string, memberIds: string[]) => {
    const trimmed = name.trim();
    const key =
      trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") ||
      `tag-${seq.current.post++}`;
    setTags((prev) =>
      prev.some((t) => t.key === key)
        ? prev
        : [...prev, { key, label: trimmed || key, dot: TAG_PALETTE[prev.length % TAG_PALETTE.length], posts: 0 }],
    );
    setMembers((prev) =>
      prev.map((m) =>
        memberIds.includes(m.id) && !m.tagKeys.includes(key) ? { ...m, tagKeys: [...m.tagKeys, key] } : m,
      ),
    );
    return key;
  }, []);

  const toggleMemberTag = useCallback((memberId: string, tagKey: string) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id !== memberId
          ? m
          : {
              ...m,
              tagKeys: m.tagKeys.includes(tagKey)
                ? m.tagKeys.filter((t) => t !== tagKey)
                : [...m.tagKeys, tagKey],
            },
      ),
    );
  }, []);

  const publishPost = useCallback((input: NewPostInput) => {
    const id = `p${seq.current.post++}`;
    const post: Post = {
      id,
      kind: input.kind,
      imageUrl: input.imageUrl,
      compose: input.compose,
      caption: input.caption?.trim() || undefined,
      tagKeys: input.tagKeys,
      status: input.status,
      likeCount: 0,
      dislikeCount: 0,
      createdAt: new Date().toISOString(),
    };
    setPosts((prev) => [post, ...prev]);
    if (input.status === "published") {
      setTags((prev) =>
        prev.map((t) => (input.tagKeys.includes(t.key) ? { ...t, posts: t.posts + 1 } : t)),
      );
    }
    return id;
  }, []);

  const addInvitation = useCallback((email: string, name?: string) => {
    const trimmed = email.trim();
    if (!trimmed) return;
    setInvitations((prev) => [
      { id: `inv-${seq.current.invite++}`, email: trimmed, name: name?.trim() || undefined, invitedAt: "just now", status: "pending" },
      ...prev,
    ]);
  }, []);

  const feed = useMemo(() => feedForMember(posts, you), [posts, you]);

  const value = useMemo<Store>(
    () => ({
      space: SPACE,
      you,
      members,
      tags,
      posts,
      invitations,
      youStats: YOU_STATS,
      feed,
      getPost: (id) => posts.find((p) => p.id === id),
      getComments: (postId) => comments[postId] ?? [],
      getReaction: (postId) => reactions[postId] ?? 0,
      audienceCount: (tagKeys) =>
        members.filter((m) => m.tagKeys.some((t) => tagKeys.includes(t))).length,
      vote,
      addComment,
      voteComment,
      setRole,
      createTag,
      toggleMemberTag,
      publishPost,
      addInvitation,
    }),
    [you, members, tags, posts, comments, reactions, invitations, feed, vote, addComment, voteComment, setRole, createTag, toggleMemberTag, publishPost, addInvitation],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
