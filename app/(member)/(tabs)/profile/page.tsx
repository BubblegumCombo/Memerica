"use client";

import { useStore } from "@/lib/data/store";
import { Avatar } from "@/components/Avatar";

export default function ProfilePage() {
  const { you, space, youStats, tags, toggleMyTag } = useStore();
  const pickable = tags.filter((t) => !t.adminOnly);
  const assignedByAdmin = tags.filter((t) => t.adminOnly && you.tagKeys.includes(t.key));

  return (
    <div className="px-4 py-6">
      <div className="flex flex-col items-center">
        <Avatar initials={you.initials} color={you.color} size={84} fontSize={30} />
        <div className="mt-3.5 text-[21px] font-bold">{you.name}</div>
        <div className="mt-[3px] font-mono text-[13px] text-muted">
          member · {space.name.toLowerCase()}
        </div>

        <div className="mt-[22px] flex w-full gap-2.5">
          <Stat value={youStats.liked} label="Liked" color="#3b82f6" />
          <Stat value={youStats.comments} label="Comments" />
          <Stat value={youStats.disliked} label="Disliked" color="#ef4444" />
        </div>
      </div>

      {/* Self-serve feed tags */}
      <section className="mt-7">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-2">Your feed</p>
        <p className="mt-1 text-[13px] text-muted">
          Pick the tags you want to see — your feed shows memes matching them.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {pickable.map((t) => {
            const on = you.tagKeys.includes(t.key);
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => toggleMyTag(t.key)}
                aria-pressed={on}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
                style={{
                  background: on ? "rgba(59,130,246,0.16)" : "#161616",
                  color: on ? "#7eb0ff" : "#9a9a9a",
                  border: `1px solid ${on ? "rgba(59,130,246,0.5)" : "#2a2a2a"}`,
                }}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: t.dot }} />#{t.key}
              </button>
            );
          })}
          {pickable.length === 0 ? (
            <p className="text-xs text-muted-2">No tags to choose yet.</p>
          ) : null}
        </div>

        {assignedByAdmin.length > 0 ? (
          <>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.08em] text-muted-2">
              Locked by admin
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {assignedByAdmin.map((t) => (
                <span
                  key={t.key}
                  className="flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1.5 text-xs font-semibold text-muted"
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: t.dot }} />#{t.key}
                </span>
              ))}
            </div>
          </>
        ) : null}
      </section>

      {/* Logout — posts to the server route that clears the session. */}
      <form action="/auth/signout" method="post" className="mt-8">
        <button
          type="submit"
          className="h-11 w-full rounded-[12px] border border-line-strong bg-input text-sm font-semibold text-dislike"
        >
          Log out
        </button>
      </form>
      <div className="h-4" />
    </div>
  );
}

function Stat({ value, label, color }: { value: number; label: string; color?: string }) {
  return (
    <div className="flex-1 rounded-xl border border-line p-4 text-center">
      <div className="text-2xl font-extrabold" style={{ color }}>
        {value}
      </div>
      <div className="mt-[3px] text-xs text-muted">{label}</div>
    </div>
  );
}
