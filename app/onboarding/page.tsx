import Link from "next/link";
import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { StarIcon } from "@/components/BrandMark";
import { ChevronRight, ThumbUp, CommentIcon } from "@/components/icons";
import { SPACE } from "@/lib/data/seed";

export default function OnboardingPage() {
  return (
    <AppShell className="h-[100dvh] overflow-hidden">
      <div
        className="no-scrollbar flex-1 overflow-y-auto px-[22px]"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 56px)" }}
      >
        {/* flag tile */}
        <div
          className="flex h-[76px] w-[122px] overflow-hidden rounded-lg"
          style={{ boxShadow: "0 0 0 1px rgba(255,255,255,.1), 0 14px 36px rgba(0,0,0,.55)" }}
        >
          <div className="flex w-[52px] items-center justify-center bg-flag-navy">
            <StarIcon size={30} fill="#fff" />
          </div>
          <div className="flex flex-1 flex-col">
            <div className="flex-1 bg-flag-red" />
            <div className="flex-1 bg-flag-white" />
            <div className="flex-1 bg-flag-red" />
            <div className="flex-1 bg-flag-white" />
            <div className="flex-1 bg-flag-red" />
          </div>
        </div>

        <h1 className="mt-[22px] text-[30px] font-extrabold leading-[1.08] tracking-[-1px]">
          Welcome to
          <br />
          MEMERICA <span className="text-flag-red">★</span>
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[#9a9a9a]">
          You’re in the <strong className="text-[#e8e8e8]">{SPACE.name}</strong> space. The admin
          handpicks every meme that lands in your feed — just swipe, react, and sound off. No setup,
          no tags to manage.
        </p>

        <div className="mt-[30px] flex flex-col gap-4">
          <Feature tint="rgba(178,34,52,.16)" color="#ef6b78" icon={<ChevronRight size={20} strokeWidth={2} />}>
            <strong className="text-white">Swipe</strong> through a fresh, curated stack
          </Feature>
          <Feature tint="rgba(59,130,246,.16)" color="#7eb0ff" icon={<ThumbUp size={20} strokeWidth={2} />}>
            <strong className="text-white">Like or dislike</strong> — your call, partner
          </Feature>
          <Feature tint="rgba(245,245,245,.1)" color="#d4d4d4" icon={<CommentIcon size={20} strokeWidth={2} />}>
            <strong className="text-white">Comment</strong> and run the thread
          </Feature>
        </div>
      </div>

      <div
        className="px-[22px] pt-3.5"
        style={{
          background: "linear-gradient(transparent, #0a0a0a 30%)",
          paddingBottom: "max(env(safe-area-inset-bottom, 0px), 40px)",
        }}
      >
        <Link
          href="/feed"
          className="flex h-[52px] w-full items-center justify-center rounded-[14px] bg-like text-base font-bold text-white"
        >
          Start the feed
        </Link>
      </div>
    </AppShell>
  );
}

function Feature({ tint, color, icon, children }: { tint: string; color: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center gap-[13px]">
      <div
        className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[10px]"
        style={{ background: tint, color }}
      >
        {icon}
      </div>
      <div className="text-sm text-ink-2">{children}</div>
    </div>
  );
}
