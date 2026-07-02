"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlusIcon, TagIcon, UsersIcon, type IconProps } from "./icons";
import { useUploadQueue } from "@/lib/upload-queue/context";

type Tab = { href: string; label: string; Icon: (p: IconProps) => ReactElement };

const TABS: Tab[] = [
  { href: "/upload", label: "Upload", Icon: PlusIcon },
  { href: "/tags", label: "Tags", Icon: TagIcon },
  { href: "/members", label: "Members", Icon: UsersIcon },
];

export function AdminTabBar() {
  const pathname = usePathname();
  const { items } = useUploadQueue();
  return (
    <nav
      className="flex border-t border-line-soft bg-bar"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 12px)" }}
    >
      {TABS.map(({ href, label, Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-1 flex-col items-center gap-[3px] pt-[9px] pb-[7px]"
            style={{ color: active ? "var(--color-like)" : "#5c5c5c" }}
            aria-current={active ? "page" : undefined}
          >
            <span className="relative">
              <Icon size={23} strokeWidth={1.9} />
              {href === "/upload" && items.length > 0 ? (
                <span className="absolute -top-1 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-like px-1 font-mono text-[9px] font-bold text-white">
                  {items.length > 99 ? "99+" : items.length}
                </span>
              ) : null}
            </span>
            <span className="text-[10px] font-semibold">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
