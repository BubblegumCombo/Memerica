import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { AdminTabBar } from "@/components/AdminTabBar";

/** Tabbed admin shell: each page renders its own AdminTopBar; tabs at the bottom. */
export default function AdminTabsLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell className="h-[100dvh] overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      <AdminTabBar />
    </AppShell>
  );
}
