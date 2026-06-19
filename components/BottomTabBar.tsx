"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, UserIcon, type IconProps } from "./icons";

type Tab = { href: string; label: string; Icon: (p: IconProps) => ReactElement };

const TABS: Tab[] = [
  { href: "/feed", label: "Feed", Icon: HomeIcon },
  { href: "/profile", label: "Profile", Icon: UserIcon },
];

export function BottomTabBar() {
  const pathname = usePathname();
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
            <Icon size={23} />
            <span className="text-[10px] font-semibold">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
