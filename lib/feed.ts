import type { Member, Post } from "./types";

/** Compact thousands formatting: 1290 -> "1.3k" (Memerica.dc.html:840). */
export function fmt(n: number): string {
  return n >= 1000 ? (n / 1000).toFixed(1).replace(".0", "") + "k" : String(n);
}

/**
 * A member's feed: published posts whose tags overlap the member's assigned
 * tags. Derived from the admin "audience" logic in the design (lines 902-904).
 */
export function feedForMember(posts: Post[], member: Member): Post[] {
  if (member.role === "admin") return posts.filter((p) => p.status === "published");
  return posts.filter(
    (p) => p.status === "published" && p.tagKeys.some((t) => member.tagKeys.includes(t)),
  );
}

/** Members who would receive a post carrying the given tags (Memerica.dc.html:904). */
export function audienceFor(members: Member[], selectedTagKeys: string[]): Member[] {
  return members.filter((m) => m.tagKeys.some((t) => selectedTagKeys.includes(t)));
}
