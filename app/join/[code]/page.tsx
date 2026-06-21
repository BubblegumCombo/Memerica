"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { BrandMark } from "@/components/BrandMark";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type Phase = "loading" | "ready" | "joining" | "error";
type Busy = null | "google" | "password" | "magic";

export default function JoinPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();

  const configured = isSupabaseConfigured();

  const [spaceName, setSpaceName] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>(configured ? "loading" : "error");
  const [error, setError] = useState<string | null>(
    configured ? null : "This space isn’t configured yet.",
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<Busy>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const redirectTo =
    typeof window !== "undefined" ? `${window.location.origin}/auth/callback?next=/join/${code}` : undefined;

  async function join() {
    setPhase("joining");
    setError(null);
    const supabase = createClient();
    const { error: joinErr } = await supabase.rpc("join_space", { p_code: code });
    if (joinErr) {
      setError(joinErr.message);
      setPhase("error");
      return;
    }
    router.push("/feed");
    router.refresh();
  }

  useEffect(() => {
    if (!configured) return;
    let active = true;
    (async () => {
      const supabase = createClient();
      const [{ data: name }, { data: auth }] = await Promise.all([
        supabase.rpc("space_name_for_code", { p_code: code }),
        supabase.auth.getUser(),
      ]);
      if (!active) return;
      if (!name) {
        setError("This invite link is invalid or has expired.");
        setPhase("error");
        return;
      }
      setSpaceName(name);
      if (auth.user) {
        await join();
      } else {
        setPhase("ready");
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, configured]);

  async function google() {
    setNotice(null);
    setError(null);
    setBusy("google");
    const supabase = createClient();
    const { error: e } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
    if (e) {
      setError(e.message);
      setBusy(null);
    }
  }

  async function emailPassword() {
    const value = email.trim();
    if (!value || !password) return;
    setNotice(null);
    setError(null);
    setBusy("password");
    const supabase = createClient();
    const { data, error: signUpErr } = await supabase.auth.signUp({
      email: value,
      password,
      options: { emailRedirectTo: redirectTo },
    });
    if (signUpErr && /registered|already/i.test(signUpErr.message)) {
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email: value, password });
      if (signInErr) {
        setError(signInErr.message);
        setBusy(null);
        return;
      }
      await join();
      return;
    }
    if (signUpErr) {
      setError(signUpErr.message);
      setBusy(null);
      return;
    }
    if (data.session) {
      await join();
      return;
    }
    setNotice("Check your email to confirm — you’ll join automatically from the link.");
    setBusy(null);
  }

  async function magicLink() {
    const value = email.trim();
    if (!value) return;
    setNotice(null);
    setError(null);
    setBusy("magic");
    const supabase = createClient();
    const { error: e } = await supabase.auth.signInWithOtp({
      email: value,
      options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
    });
    if (e) {
      setError(e.message);
    } else {
      setNotice(`Check ${value} for your sign-in link.`);
    }
    setBusy(null);
  }

  return (
    <AppShell className="min-h-[100dvh]">
      <div
        className="flex flex-1 flex-col justify-center px-7 pb-16"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 40px)" }}
      >
        <BrandMark emblemHeight={26} word={26} />

        {phase === "loading" || phase === "joining" ? (
          <p className="mt-10 text-sm text-muted">{phase === "joining" ? "Joining…" : "Loading invite…"}</p>
        ) : phase === "error" ? (
          <>
            <h1 className="mt-8 text-[26px] font-extrabold tracking-tight">Invite problem</h1>
            <p className="mt-3 text-[15px] text-muted">{error}</p>
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="mt-6 h-12 rounded-[12px] bg-like text-[15px] font-bold text-white"
            >
              Go to sign in
            </button>
          </>
        ) : (
          <>
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.12em] text-flag-red">
              You’re invited
            </p>
            <h1 className="mt-2 text-[28px] font-extrabold leading-tight tracking-tight">
              Join <span className="text-flag-red">{spaceName}</span> on Memerica
            </h1>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">
              Create an account and you’re in. The admin curates the feed — you swipe, react, and run
              the thread.
            </p>

            <div className="mt-8 flex flex-col gap-3">
              <button
                type="button"
                onClick={google}
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
                  if (e.key === "Enter") emailPassword();
                }}
                type="password"
                autoComplete="new-password"
                placeholder="Create a password"
                className="h-12 rounded-[12px] border border-line-strong bg-input px-4 text-sm text-ink outline-none placeholder:text-muted-2"
              />
              <button
                type="button"
                onClick={emailPassword}
                disabled={busy !== null || !email.trim() || !password}
                className="h-12 rounded-[12px] bg-like text-[15px] font-bold text-white disabled:opacity-50"
              >
                {busy === "password" ? "Creating account…" : "Create account & join"}
              </button>

              <button
                type="button"
                onClick={magicLink}
                disabled={busy !== null || !email.trim()}
                className="text-[13px] font-semibold text-muted disabled:opacity-50"
              >
                {busy === "magic" ? "Sending…" : "Email me a sign-in link instead"}
              </button>
            </div>

            {notice ? (
              <p className="mt-4 rounded-[12px] border border-success/40 bg-success/10 px-4 py-3 text-[13px] text-success">
                {notice}
              </p>
            ) : null}
            {error ? <p className="mt-4 text-[13px] text-dislike">{error}</p> : null}
          </>
        )}
      </div>
    </AppShell>
  );
}
