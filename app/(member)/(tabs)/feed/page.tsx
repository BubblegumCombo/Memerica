"use client";

import Link from "next/link";
import { useStore } from "@/lib/data/store";
import { SwipeCarousel } from "@/components/SwipeCarousel";
import { MemeMedia } from "@/components/MemeMedia";
import { ReactionBar } from "@/components/ReactionBar";

export default function FeedPage() {
  const { feed, you } = useStore();

  if (feed.length === 0) {
    const noTags = you.role === "member" && you.tagKeys.length === 0;
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-8 text-center">
        <p className="text-[15px] font-semibold text-ink">Your feed is quiet</p>
        {noTags ? (
          <>
            <p className="text-sm text-muted">
              Pick a few tags and your feed fills up with matching memes.
            </p>
            <Link
              href="/profile"
              className="mt-2 rounded-full bg-like px-4 py-2 text-sm font-semibold text-white"
            >
              Choose your tags
            </Link>
          </>
        ) : (
          <p className="text-sm text-muted">
            The admin hasn’t shipped any memes that match your tags yet. Check back soon.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <SwipeCarousel>
        {feed.map((post) => (
          <div key={post.id} className="px-[18px] pt-1">
            <div className="overflow-hidden rounded-[18px] border border-line bg-card shadow-[0_14px_44px_rgba(0,0,0,0.45)]">
              <MemeMedia post={post} height={360} />
              <ReactionBar postId={post.id} />
            </div>
          </div>
        ))}
      </SwipeCarousel>
    </div>
  );
}
