import { redirect } from "next/navigation";

export default function Home() {
  // Seed phase: send everyone to the feed. Auth-aware routing (onboarding vs
  // feed, member vs admin) lands with Supabase in Phase 3.
  redirect("/feed");
}
