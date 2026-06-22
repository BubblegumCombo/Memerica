"use client";

import { createContext, useContext } from "react";
import type {
  Comment,
  Invitation,
  Member,
  MemberStats,
  MemeCompose,
  Post,
  Role,
  Space,
  Tag,
  Vote,
} from "@/lib/types";

export interface NewPostInput {
  kind: "image" | "composed";
  imageUrl?: string;
  /** S3 object key for an uploaded image (persisted to posts.image_path). */
  imageKey?: string;
  /** SHA-256 hex of the image bytes (persisted to posts.image_hash). */
  imageHash?: string;
  compose?: MemeCompose;
  caption?: string;
  tagKeys: string[];
}

/**
 * The data-access contract every screen consumes via useStore(). Implemented by
 * the seed store (no backend) and the Supabase store (live) — screens never know
 * which one is active.
 */
export interface Store {
  space: Space;
  you: Member;
  members: Member[];
  tags: Tag[];
  posts: Post[];
  invitations: Invitation[];
  youStats: MemberStats;

  feed: Post[];
  getPost: (id: string) => Post | undefined;
  getComments: (postId: string) => Comment[];
  getReaction: (postId: string) => Vote;
  audienceCount: (tagKeys: string[]) => number;

  vote: (postId: string, dir: 1 | -1) => void;
  addComment: (postId: string, text: string, parentId?: string | null) => void;
  voteComment: (postId: string, commentId: string, dir: 1 | -1) => void;
  setRole: (role: Role) => void;
  createTag: (name: string, memberIds: string[]) => string;
  toggleMemberTag: (memberId: string, tagKey: string) => void;
  /** Admin marks a tag admin-only (members can no longer self-assign it). */
  setTagAdminOnly: (tagKey: string, adminOnly: boolean) => void;
  /** Member adds/removes a non-admin-only tag from their own feed. */
  toggleMyTag: (tagKey: string) => void;
  /** Member sets their profile picture (an S3 object key from uploadImage). */
  setAvatar: (imageKey: string) => void;
  publishPost: (input: NewPostInput) => string;
  addInvitation: (email: string, name?: string) => void;
}

export const StoreContext = createContext<Store | null>(null);

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within <StoreProvider>");
  return ctx;
}
