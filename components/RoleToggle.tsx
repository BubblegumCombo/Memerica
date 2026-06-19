"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/lib/data/store";

/**
 * Seed-phase dev control: flip the viewer between member and admin and jump to
 * the matching home screen. Removed once Supabase auth + real roles land
 * (Phase 3).
 */
export function RoleToggle() {
  const { you, setRole } = useStore();
  const router = useRouter();
  const isAdmin = you.role === "admin";

  function toggle() {
    if (isAdmin) {
      setRole("member");
      router.push("/feed");
    } else {
      setRole("admin");
      router.push("/upload");
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="fixed right-3 z-50 rounded-full border border-line-strong bg-bar/95 px-3 py-2 text-xs font-semibold text-ink shadow-lg backdrop-blur"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 78px)" }}
      aria-label={`Switch to ${isAdmin ? "member" : "admin"} view`}
    >
      <span className="text-muted">View:</span> {isAdmin ? "Admin" : "Member"}{" "}
      <span className="text-muted-2">· switch</span>
    </button>
  );
}
