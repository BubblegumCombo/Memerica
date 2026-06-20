"use client";

import type { ReactNode } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { SeedStoreProvider } from "./seed-store";
import { SupabaseStoreProvider } from "./supabase-store";

export { useStore } from "./store-context";
export type { Store, NewPostInput } from "./store-context";

/** Picks the live Supabase store when configured, else the in-memory seed store. */
export function StoreProvider({ children }: { children: ReactNode }) {
  if (isSupabaseConfigured()) {
    return <SupabaseStoreProvider>{children}</SupabaseStoreProvider>;
  }
  return <SeedStoreProvider>{children}</SeedStoreProvider>;
}
