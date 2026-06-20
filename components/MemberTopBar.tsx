"use client";

import Link from "next/link";
import { BrandMark } from "./BrandMark";
import { useStore } from "@/lib/data/store";

/** Shared member top bar: MEMERICA wordmark + the red/white/blue stripe. Admins
 * get a link into the admin tools. */
export function MemberTopBar() {
  const { you } = useStore();
  return (
    <header
      className="bg-bar px-4"
      style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)" }}
    >
      <div className="flex h-[46px] items-center">
        <BrandMark />
        {you.role === "admin" ? (
          <Link
            href="/upload"
            className="ml-auto rounded-full border border-line-strong px-3 py-1.5 text-xs font-semibold text-muted"
          >
            Admin
          </Link>
        ) : null}
      </div>
      <div className="-mx-4 mt-[6px] flex h-[3px]">
        <div className="flex-1 bg-flag-red" />
        <div className="flex-1 bg-[#e9e9ea]" />
        <div className="flex-1 bg-flag-navy" />
      </div>
    </header>
  );
}
