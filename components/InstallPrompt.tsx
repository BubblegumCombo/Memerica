"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/** Subtle "add to home screen" prompt (Chrome/Android). iOS installs via the
 * Safari share sheet, which doesn't fire this event. */
export function InstallPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!event || dismissed) return null;

  async function install() {
    if (!event) return;
    await event.prompt();
    await event.userChoice;
    setEvent(null);
  }

  return (
    <div
      className="fixed inset-x-0 z-50 flex justify-center px-4"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 90px)" }}
    >
      <div className="flex w-full max-w-[460px] items-center gap-3 rounded-[14px] border border-line-strong bg-bar/95 px-4 py-3 shadow-lg backdrop-blur">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink">Install Memerica</p>
          <p className="text-xs text-muted">Add it to your home screen for the full-screen feed.</p>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="px-2 text-xs font-semibold text-muted-2"
        >
          Not now
        </button>
        <button
          type="button"
          onClick={install}
          className="rounded-full bg-like px-3.5 py-2 text-xs font-bold text-white"
        >
          Install
        </button>
      </div>
    </div>
  );
}
