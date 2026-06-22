"use client";

import { useStore } from "@/lib/data/store";
import { AdminTopBar } from "@/components/AdminTopBar";
import { Avatar } from "@/components/Avatar";

export default function TagsPage() {
  const { tags, members, toggleMemberTag, setTagAdminOnly } = useStore();

  return (
    <>
      <AdminTopBar title="Tags" />
      <main className="no-scrollbar flex-1 overflow-y-auto p-4">
        <p className="mb-[9px] text-xs font-bold uppercase tracking-[0.08em] text-muted-2">All Tags</p>
        <p className="mb-3 text-xs text-muted-2">
          Tap “Admin only” to stop members from adding a tag to their own feed.
        </p>
        <div className="flex flex-col gap-1.5">
          {tags.map((t) => {
            const memberCount = members.filter((m) => m.tagKeys.includes(t.key)).length + 1;
            return (
              <div key={t.key} className="flex items-center gap-3 rounded-[12px] border border-line bg-card px-3.5 py-3">
                <span className="h-2.5 w-2.5 flex-none rounded-full" style={{ background: t.dot }} />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">#{t.key}</span>
                <span className="flex-none text-xs tabular-nums text-muted">
                  {memberCount} · {t.posts}
                </span>
                <button
                  type="button"
                  onClick={() => setTagAdminOnly(t.key, !t.adminOnly)}
                  aria-pressed={t.adminOnly}
                  className="flex-none rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  style={{
                    background: t.adminOnly ? "rgba(178,34,52,0.16)" : "#161616",
                    color: t.adminOnly ? "#f1a3ad" : "#7a7a7a",
                    border: `1px solid ${t.adminOnly ? "rgba(178,34,52,0.5)" : "#2a2a2a"}`,
                  }}
                >
                  Admin only
                </button>
              </div>
            );
          })}
        </div>

        <p className="mt-[22px] mb-[9px] text-xs font-bold uppercase tracking-[0.08em] text-muted-2">Member Tags</p>
        <p className="mb-3 text-xs text-muted-2">Tap a tag to assign it — it decides that member’s feed.</p>
        <div className="flex flex-col gap-2.5">
          {members.map((m) => (
            <div key={m.id} className="rounded-[14px] border border-line bg-card p-3.5">
              <div className="flex items-center gap-2.5">
                <Avatar initials={m.initials} color={m.color} size={36} />
                <span className="flex-1 text-sm font-semibold">{m.name}</span>
                <span className="text-xs text-muted-2">{m.tagKeys.length} tags</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((t) => {
                  const on = m.tagKeys.includes(t.key);
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => toggleMemberTag(m.id, t.key)}
                      aria-pressed={on}
                      className="rounded-full px-2.5 py-1 text-xs font-semibold"
                      style={{
                        background: on ? "rgba(59,130,246,0.16)" : "#161616",
                        color: on ? "#7eb0ff" : "#7a7a7a",
                        border: `1px solid ${on ? "rgba(59,130,246,0.5)" : "#2a2a2a"}`,
                      }}
                    >
                      #{t.key}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="h-2" />
      </main>
    </>
  );
}
