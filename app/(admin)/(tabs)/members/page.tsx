"use client";

import { useState } from "react";
import { useStore } from "@/lib/data/store";
import { AdminTopBar } from "@/components/AdminTopBar";
import { Avatar } from "@/components/Avatar";
import { LinkIcon, CheckIcon } from "@/components/icons";

export default function MembersPage() {
  const { space, members, invitations, addInvitation } = useStore();
  const inviteUrl = `memerica.app/join/${space.inviteCode}`;
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const pending = invitations.filter((i) => i.status === "pending");

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`https://${inviteUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }
  function sendInvite() {
    const e = email.trim();
    if (!e) return;
    addInvitation(e);
    setEmail("");
  }

  return (
    <>
      <AdminTopBar title="Members" />
      <main className="no-scrollbar flex-1 overflow-y-auto p-4">
        {/* invite */}
        <div className="rounded-[14px] border border-line bg-card p-4">
          <p className="mb-[9px] text-[13px] font-semibold text-ink-2">Invite to {space.name}</p>
          <div className="flex gap-2">
            <div className="flex h-[42px] flex-1 items-center truncate rounded-[10px] border border-line-strong bg-input px-3 font-mono text-[13px] text-muted">
              {inviteUrl}
            </div>
            <button
              type="button"
              onClick={copyLink}
              className="flex h-[42px] items-center gap-1.5 rounded-[10px] bg-like px-4 text-[13px] font-semibold text-white"
            >
              {copied ? <CheckIcon size={15} /> : <LinkIcon size={15} />} {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="mt-2.5 flex gap-2">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendInvite();
              }}
              placeholder="name@email.com"
              type="email"
              className="h-[42px] flex-1 rounded-[10px] border border-line-strong bg-input px-3.5 text-sm text-ink outline-none placeholder:text-muted-2"
            />
            <button
              type="button"
              onClick={sendInvite}
              disabled={!email.trim()}
              className="h-[42px] rounded-[10px] bg-line-strong px-4 text-[13px] font-semibold text-ink disabled:opacity-50"
            >
              Send invite
            </button>
          </div>
        </div>

        {/* pending invitations */}
        {pending.length > 0 ? (
          <>
            <p className="mt-[22px] mb-[9px] text-xs font-bold uppercase tracking-[0.08em] text-muted-2">
              Pending Invitations
            </p>
            <div className="flex flex-col gap-1.5">
              {pending.map((inv) => (
                <div key={inv.id} className="flex items-center gap-3 rounded-[12px] border border-line bg-card px-3.5 py-3">
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-input-2 text-muted">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m2 7 10 6 10-6" />
                    </svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{inv.name ?? inv.email}</div>
                    <div className="mt-px text-xs text-muted-2">Invited {inv.invitedAt} · not joined yet</div>
                  </div>
                  <button type="button" className="text-xs font-semibold text-like">
                    Resend
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : null}

        {/* members */}
        <p className="mt-[22px] mb-[9px] text-xs font-bold uppercase tracking-[0.08em] text-muted-2">
          Members · {members.length + 1}
        </p>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3 rounded-[12px] border border-line bg-card px-3.5 py-3">
            <Avatar initials="YO" color="#3b82f6" size={36} />
            <span className="flex-1 text-sm font-semibold">
              You <span className="font-normal text-muted-2">· admin</span>
            </span>
          </div>
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-[12px] border border-line bg-card px-3.5 py-3">
              <Avatar initials={m.initials} color={m.color} size={36} />
              <span className="flex-1 text-sm font-semibold">{m.name}</span>
              <span className="text-xs text-muted-2">{m.tagKeys.length} tags</span>
            </div>
          ))}
        </div>
        <div className="h-2" />
      </main>
    </>
  );
}
