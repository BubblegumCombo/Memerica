"use client";

// The posting queue: files the admin has dumped in but not yet tagged+posted.
// Lives above the tab pages so navigating away (feed, tags, …) doesn't drop
// it, and mirrors every change into IndexedDB so it survives reloads too.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { queueClear, queueDelete, queueGetAll, queuePut } from "./db";

export interface QueueItem {
  id: string;
  file: File;
  /** Object URL for previewing the file; owned (and revoked) by the provider. */
  url: string;
  createdAt: number;
}

interface UploadQueue {
  /** False until the persisted queue has been loaded from IndexedDB. */
  ready: boolean;
  items: QueueItem[];
  /** Position of the item being tagged; clamp to items.length - 1 on read. */
  activeIndex: number;
  setActiveIndex: (i: number) => void;
  addFiles: (files: File[]) => void;
  removeItem: (id: string) => void;
  clearQueue: () => void;
}

const Ctx = createContext<UploadQueue | null>(null);

export function UploadQueueProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [ready, setReady] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Keep a live snapshot so callbacks can look items up without re-binding.
  const itemsRef = useRef<QueueItem[]>(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    let cancelled = false;
    void queueGetAll().then((stored) => {
      const loaded = stored.map((s) => ({ ...s, url: URL.createObjectURL(s.file) }));
      if (cancelled) {
        loaded.forEach((it) => URL.revokeObjectURL(it.url));
        return;
      }
      // Files picked before hydration finished stay in front of the reload
      // leftovers only if they were added later — createdAt keeps order stable.
      setItems((cur) => {
        const have = new Set(cur.map((it) => it.id));
        return [...cur, ...loaded.filter((it) => !have.has(it.id))].sort(
          (a, b) => a.createdAt - b.createdAt,
        );
      });
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const addFiles = useCallback((files: File[]) => {
    if (!files.length) return;
    // A batch dumped into an empty queue starts at its first file — don't let
    // the position left over from a drained queue clamp us into the middle.
    if (itemsRef.current.length === 0) setActiveIndex(0);
    const now = Date.now();
    const added: QueueItem[] = files.map((file, i) => ({
      id: crypto.randomUUID(),
      file,
      url: URL.createObjectURL(file),
      createdAt: now + i,
    }));
    setItems((cur) => [...cur, ...added]);
    added.forEach(({ id, file, createdAt }) => void queuePut({ id, file, createdAt }));
  }, []);

  const removeItem = useCallback((id: string) => {
    const it = itemsRef.current.find((x) => x.id === id);
    if (it) URL.revokeObjectURL(it.url);
    setItems((cur) => cur.filter((x) => x.id !== id));
    void queueDelete(id);
  }, []);

  const clearQueue = useCallback(() => {
    itemsRef.current.forEach((it) => URL.revokeObjectURL(it.url));
    setItems([]);
    setActiveIndex(0);
    void queueClear();
  }, []);

  return (
    <Ctx.Provider
      value={{ ready, items, activeIndex, setActiveIndex, addFiles, removeItem, clearQueue }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useUploadQueue(): UploadQueue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useUploadQueue must be used inside UploadQueueProvider");
  return ctx;
}
