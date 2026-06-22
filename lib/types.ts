// Domain model for Memerica. Mirrors the entities in the design source
// (design-handoff/.../project/Memerica.dc.html) and is the shared contract the
// seed store now and the Supabase store later both implement.

export type Vote = -1 | 0 | 1;

export type Role = "admin" | "member";

export interface Space {
  id: string;
  name: string;
  inviteCode: string;
}

export interface Member {
  id: string;
  name: string;
  initials: string;
  /** Avatar background color. */
  color: string;
  role: Role;
  /** Tag keys the admin has assigned to this member; drives their feed. */
  tagKeys: string[];
}

export interface Tag {
  key: string;
  label: string;
  /** Accent color used for the tag dot. */
  dot: string;
  /** Number of posts carrying this tag (admin stat). */
  posts: number;
  /** When true, only the admin may assign this tag to members (e.g. based, truth). */
  adminOnly: boolean;
}

/** A meme composed in-app: colored card + faint watermark word + two caption lines. */
export interface MemeCompose {
  bg: string;
  watermark: string;
  top: string;
  bottom: string;
}

export interface Post {
  id: string;
  /** "image" = uploaded image in S3; "composed" = in-app text-on-color meme. */
  kind: "image" | "composed";
  imageUrl?: string;
  compose?: MemeCompose;
  /** Optional extra caption line shown with the post. */
  caption?: string;
  tagKeys: string[];
  status: "draft" | "published";
  likeCount: number;
  dislikeCount: number;
  /** ISO timestamp; relative label derived for display. */
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  /** Parent comment id when this is a reply; null/undefined for a top-level comment. */
  parentId?: string | null;
  author: string;
  initials: string;
  color: string;
  text: string;
  /** Relative time label, e.g. "1h". */
  time: string;
  up: number;
  down: number;
  vote: Vote;
}

export interface Invitation {
  id: string;
  name?: string;
  email: string;
  /** Relative label, e.g. "2d ago". */
  invitedAt: string;
  status: "pending" | "joined";
}

/** Lifetime per-member counters shown on the profile screen. */
export interface MemberStats {
  liked: number;
  comments: number;
  disliked: number;
}
