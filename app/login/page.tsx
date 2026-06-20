"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { BrandMark } from "@/components/BrandMark";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type Busy = null | "password" | "magic" | "google";

export default function LoginPage() {
  const configured = isSupabaseConfigured();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [magicSent, setMagicSent] = useState(false);
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);

  async function passwordSignIn() {
    if (!email.trim() || !password) return;
    setError(null);
    setBusy("password");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      let dest = "/feed";
      if (user) {
        const { data: membership } = await supabase
          .from("space_members")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();
        if (membership?.role === "admin") dest = "/upload";
      }
      router.push(dest);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed.");
      setBusy(null);
    }
  }

  async function sendMagicLink() {
    if (!email.trim()) return;
    setError(null);
    setBusy("magic");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      setMagicSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send the link.");
    } finally {
      setBusy(null);
    }
  }

  async function googleSignIn() {
    setError(null);
    setBusy("google");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start Google sign-in.");
      setBusy(null);
    }
  }

  return (
    <AppShell className="min-h-[100dvh]">
      <div
        className="flex flex-1 flex-col justify-center px-7 pb-16"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 40px)" }}
      >
        <BrandMark emblemHeight={26} word={26} />
        <h1 className="mt-8 text-[28px] font-extrabold leading-tight tracking-tight">
          Sign in to the feed
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          One shared space. The admin curates; you react and run the thread.
        </p>

        {!configured ? (
          <div className="mt-6 rounded-[12px] border border-draft/40 bg-draft/10 px-4 py-3 text-[13px] leading-relaxed text-draft">
            Backend isn’t configured yet — the app is running on seed data. Add your Supabase
            keys to <span className="font-mono">.env.local</span> to enable sign-in.
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              onClick={googleSignIn}
              disabled={busy !== null}
              className="flex h-12 items-center justify-center gap-2 rounded-[12px] border border-line-strong bg-input text-[15px] font-semibold text-ink disabled:opacity-50"
            >
              Continue with Google
            </button>

            <div className="my-1 flex items-center gap-3 text-xs text-muted-2">
              <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
            </div>

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              placeholder="name@email.com"
              className="h-12 rounded-[12px] border border-line-strong bg-input px-4 text-sm text-ink outline-none placeholder:text-muted-2"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") passwordSignIn();
              }}
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              className="h-12 rounded-[12px] border border-line-strong bg-input px-4 text-sm text-ink outline-none placeholder:text-muted-2"
            />
            <button
              type="button"
              onClick={passwordSignIn}
              disabled={busy !== null || !email.trim() || !password}
              className="h-12 rounded-[12px] bg-like text-[15px] font-bold text-white disabled:opacity-50"
            >
              {busy === "password" ? "Signing in…" : "Sign in"}
            </button>

            {magicSent ? (
              <p className="rounded-[12px] border border-success/40 bg-success/10 px-4 py-3 text-[13px] text-success">
                Check <span className="font-semibold">{email.trim()}</span> for your sign-in link.
              </p>
            ) : (
              <button
                type="button"
                onClick={sendMagicLink}
                disabled={busy !== null || !email.trim()}
                className="text-[13px] font-semibold text-muted disabled:opacity-50"
              >
                {busy === "magic" ? "Sending…" : "Email me a magic link instead"}
              </button>
            )}
          </div>
        )}

        {error ? <p className="mt-4 text-[13px] text-dislike">{error}</p> : null}
      </div>
    </AppShell>
  );
}
