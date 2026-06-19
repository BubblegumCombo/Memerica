"use client";

import { useStore } from "@/lib/data/store";
import { Avatar } from "@/components/Avatar";

export default function ProfilePage() {
  const { you, space, youStats } = useStore();

  return (
    <div className="flex flex-col items-center px-4 py-6">
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
