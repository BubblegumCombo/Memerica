import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { MemberTopBar } from "@/components/MemberTopBar";
import { BottomTabBar } from "@/components/BottomTabBar";

/** Tabbed member shell: top bar + scrolling content + bottom tab bar. */
export default function TabsLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell className="h-[100dvh] overflow-hidden">
      <MemberTopBar />
      <main className="no-scrollbar flex-1 overflow-y-auto">{children}</main>
      <BottomTabBar />
    </AppShell>
  );
}
