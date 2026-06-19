import type { ReactNode } from "react";

/**
 * Responsive app frame. On phones the app is full-bleed; on larger screens it
 * sits as a centered mobile-width column (the design's device frames were just
 * presentation chrome, not part of the product).
 */
export function AppShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="flex min-h-[100dvh] justify-center bg-black">
      <div
        className={`relative flex min-h-[100dvh] w-full max-w-[460px] flex-col bg-app text-ink ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
