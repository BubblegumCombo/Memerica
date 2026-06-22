import type { Member, Post, Tag } from "@/lib/types";
import type { Database } from "@/lib/database.types";
import { cdnUrl } from "@/lib/aws/config";

type Tables = Database["public"]["Tables"];

/** ISO timestamp → compact relative label ("now", "5m", "3h", "2d", "1w"). */
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const secs = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (secs < 60) return "now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

export function mapTag(t: Tables["tags"]["Row"], posts: number): Tag {
  return { key: t.key, label: t.label, dot: t.dot, posts, adminOnly: t.admin_only };
}

export function mapMember(
  p: Tables["profiles"]["Row"],
  role: Member["role"],
  tagKeys: string[],
): Member {
  return {
    id: p.id,
    name: p.name,
    initials: p.initials,
    color: p.color,
    role,
    tagKeys,
    avatarUrl: p.avatar_path ? cdnUrl(p.avatar_path) : undefined,
  };
}

export function mapPost(p: Tables["posts"]["Row"], tagKeys: string[]): Post {
  return {
    id: p.id,
    kind: p.kind,
    imageUrl: p.image_path ? cdnUrl(p.image_path) : undefined,
    imageHash: p.image_hash ?? undefined,
    compose: (p.compose as unknown as Post["compose"]) ?? undefined,
    caption: p.caption ?? undefined,
    tagKeys,
    status: p.status,
    likeCount: p.like_count,
    dislikeCount: p.dislike_count,
    createdAt: p.created_at,
  };
}
