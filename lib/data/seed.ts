import type {
  Comment,
  Invitation,
  Member,
  MemberStats,
  Post,
  Space,
  Tag,
  Vote,
} from "@/lib/types";

// Seed data ported from the design source (Memerica.dc.html state, lines
// 726-771 + comments 736-749). Frontend-first: this drives every screen until
// the Supabase store replaces it behind the same interface.

export const SPACE: Space = {
  id: "space-1",
  name: "Banner of Memes",
  inviteCode: "bk-4f9a",
};

/** The signed-in viewer. Role flips to "admin" via the dev role toggle. */
export const YOU: Member = {
  id: "you",
  name: "You",
  initials: "YO",
  color: "#3b82f6",
  role: "member",
  tagKeys: ["gaming", "based", "cats", "truth"],
};

export const MEMBERS: Member[] = [
  { id: "dustin", name: "Dustin", initials: "DU", color: "#ef4444", role: "member", tagKeys: ["gaming", "based", "truth"] },
  { id: "priya", name: "Priya", initials: "PR", color: "#3b82f6", role: "member", tagKeys: ["gaming", "anime", "cats"] },
  { id: "marco", name: "Marco", initials: "MA", color: "#22c55e", role: "member", tagKeys: ["based", "dogs", "truth"] },
  { id: "avery", name: "Avery", initials: "AV", color: "#eab308", role: "member", tagKeys: ["anime", "cats"] },
  { id: "theo", name: "Theo", initials: "TH", color: "#06b6d4", role: "member", tagKeys: ["dogs", "truth"] },
];

export const TAGS: Tag[] = [
  { key: "gaming", label: "Gaming", dot: "#3b82f6", posts: 28 },
  { key: "anime", label: "Anime", dot: "#ec4899", posts: 14 },
  { key: "truth", label: "Truth", dot: "#eab308", posts: 41 },
  { key: "based", label: "Based", dot: "#22c55e", posts: 33 },
  { key: "cats", label: "Cats", dot: "#f59e0b", posts: 22 },
  { key: "dogs", label: "Dogs", dot: "#06b6d4", posts: 9 },
];

export const POSTS: Post[] = [
  {
    id: "m1",
    kind: "composed",
    compose: { bg: "#1e3a5f", watermark: "CATS", top: "When the red dot", bottom: "finally holds still" },
    tagKeys: ["cats", "truth"],
    status: "published",
    likeCount: 842,
    dislikeCount: 17,
    createdAt: "2026-06-19T08:00:00.000Z",
  },
  {
    id: "m2",
    kind: "composed",
    compose: { bg: "#3a1f24", watermark: "GG", top: "Me: just one more game", bottom: "The sun: rising" },
    tagKeys: ["gaming", "based"],
    status: "published",
    likeCount: 1290,
    dislikeCount: 44,
    createdAt: "2026-06-19T06:30:00.000Z",
  },
  {
    id: "m3",
    kind: "composed",
    compose: { bg: "#243a2a", watermark: "BASED", top: "Took the trash out", bottom: "Felt unreasonably based" },
    tagKeys: ["based", "truth"],
    status: "published",
    likeCount: 503,
    dislikeCount: 9,
    createdAt: "2026-06-19T04:00:00.000Z",
  },
];

/** The viewer's current vote per post (m2 starts liked, per the design). */
export const REACTIONS: Record<string, Vote> = { m2: 1 };

export const COMMENTS: Record<string, Comment[]> = {
  m2: [
    { id: "c1", postId: "m2", author: "Dustin", initials: "DU", color: "#ef4444", text: "this is too real, deleted my sleep schedule", time: "1h", up: 42, down: 0, vote: 0 },
    { id: "c2", postId: "m2", author: "Priya", initials: "PR", color: "#3b82f6", text: "GG to whoever made this", time: "47m", up: 18, down: 0, vote: 0 },
    { id: "c3", postId: "m2", author: "Marco", initials: "MA", color: "#22c55e", text: "based and accurate", time: "12m", up: 7, down: 0, vote: 0 },
  ],
  m1: [
    { id: "d1", postId: "m1", author: "Priya", initials: "PR", color: "#3b82f6", text: "my cat does this exact thing", time: "1h", up: 12, down: 0, vote: 0 },
    { id: "d2", postId: "m1", author: "Marco", initials: "MA", color: "#22c55e", text: "certified truth", time: "20m", up: 4, down: 0, vote: 0 },
  ],
  m3: [
    { id: "e1", postId: "m3", author: "Dustin", initials: "DU", color: "#ef4444", text: "felt this in my soul", time: "3h", up: 9, down: 0, vote: 0 },
  ],
};

export const YOU_STATS: MemberStats = { liked: 312, comments: 48, disliked: 9 };

export const INVITATIONS: Invitation[] = [
  { id: "inv-1", name: "Jordan H.", email: "jordan@example.com", invitedAt: "2d ago", status: "pending" },
  { id: "inv-2", name: "Sam P.", email: "sam@example.com", invitedAt: "5h ago", status: "pending" },
];
