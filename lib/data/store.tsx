"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  Comment,
  Invitation,
  Member,
  MemberStats,
  Post,
  Role,
  Space,
  Tag,
  Vote,
} from "@/lib/types";
import { feedForMember } from "@/lib/feed";
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

export interface Store {
  space: Space;
  /** The signed-in viewer (role can be toggled in the seed phase). */
  you: Member;
  members: Member[];
  tags: Tag[];
  posts: Post[];
  invitations: Invitation[];
  youStats: MemberStats;

  /** Published posts matching the viewer's tags (all published if admin). */
  feed: Post[];
  getPost: (id: string) => Post | undefined;
  getComments: (postId: string) => Comment[];
  getReaction: (postId: string) => Vote;

  vote: (postId: string, dir: 1 | -1) => void;
  addComment: (postId: string, text: string) => void;
  voteComment: (postId: string, commentId: string, dir: 1 | -1) => void;
  setRole: (role: Role) => void;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [you, setYou] = useState<Member>(YOU);
  const [posts, setPosts] = useState<Post[]>(POSTS);
  const [comments, setComments] = useState<Record<string, Comment[]>>(COMMENTS);
  const [reactions, setReactions] = useState<Record<string, Vote>>(REACTIONS);
  const commentSeq = useRef(1);

  const vote = useCallback((postId: string, dir: 1 | -1) => {
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
  }, [reactions]);

  const addComment = useCallback(
    (postId: string, text: string) => {
      const body = text.trim();
      if (!body) return;
      const comment: Comment = {
        id: `u${commentSeq.current++}`,
        postId,
        author: you.name,
        initials: you.initials,
        color: you.color,
        text: body,
        time: "now",
        up: 0,
        down: 0,
        vote: 0,
      };
      setComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] ?? []), comment],
      }));
    },
    [you],
  );

  const voteComment = useCallback((postId: string, commentId: string, dir: 1 | -1) => {
    setComments((prev) => {
      const list = (prev[postId] ?? []).map((c) => {
        if (c.id !== commentId) return c;
        let { up, down } = c;
        const vote = c.vote;
        if (vote === 1) up--;
        if (vote === -1) down--;
        const next: Vote = vote === dir ? 0 : dir;
        if (vote !== dir) {
          if (dir === 1) up++;
          else down++;
        }
        return { ...c, up, down, vote: next };
      });
      return { ...prev, [postId]: list };
    });
  }, []);

  const setRole = useCallback((role: Role) => {
    setYou((prev) => ({ ...prev, role }));
  }, []);

  const feed = useMemo(() => feedForMember(posts, you), [posts, you]);

  const value = useMemo<Store>(
    () => ({
      space: SPACE,
      you,
      members: MEMBERS,
      tags: TAGS,
      posts,
      invitations: INVITATIONS,
      youStats: YOU_STATS,
      feed,
      getPost: (id) => posts.find((p) => p.id === id),
      getComments: (postId) => comments[postId] ?? [],
      getReaction: (postId) => reactions[postId] ?? 0,
      vote,
      addComment,
      voteComment,
      setRole,
    }),
    [you, posts, comments, reactions, feed, vote, addComment, voteComment, setRole],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within <StoreProvider>");
  return ctx;
}
