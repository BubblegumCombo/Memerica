"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { BrandMark } from "@/components/BrandMark";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function LoginPage() {
  const configured = isSupabaseConfigured();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendMagicLink() {
    const value = email.trim();
    if (!value) return;
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: value,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send the magic link.");
    } finally {
      setLoading(false);
    }
  }

  async function googleSignIn() {
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start Google sign-in.");
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
              className="flex h-12 items-center justify-center gap-2 rounded-[12px] border border-line-strong bg-input text-[15px] font-semibold text-ink"
            >
              Continue with Google
            </button>

            <div className="my-1 flex items-center gap-3 text-xs text-muted-2">
              <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
            </div>

            {sent ? (
              <p className="rounded-[12px] border border-success/40 bg-success/10 px-4 py-3 text-[13px] text-success">
                Check <span className="font-semibold">{email.trim()}</span> for your sign-in link.
              </p>
            ) : (
              <>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendMagicLink();
                  }}
                  type="email"
                  placeholder="name@email.com"
                  className="h-12 rounded-[12px] border border-line-strong bg-input px-4 text-sm text-ink outline-none placeholder:text-muted-2"
                />
                <button
                  type="button"
                  onClick={sendMagicLink}
                  disabled={!email.trim() || loading}
                  className="h-12 rounded-[12px] bg-like text-[15px] font-bold text-white disabled:opacity-50"
                >
                  {loading ? "Sending…" : "Email me a magic link"}
                </button>
              </>
            )}
          </div>
        )}

        {error ? <p className="mt-4 text-[13px] text-dislike">{error}</p> : null}
      </div>
    </AppShell>
  );
}
