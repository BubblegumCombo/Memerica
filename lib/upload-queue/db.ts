// IndexedDB persistence for the posting queue. File blobs can't go in
// localStorage, but they store fine in IDB — so a dumped batch of photos
// survives tab switches, app restarts, and PWA relaunches.
//
// Every helper swallows failures (private browsing, quota, no IDB): the queue
// then still works in memory for the current visit, it just won't persist.

export interface StoredQueueItem {
  id: string;
  file: File;
  createdAt: number;
}

const DB_NAME = "memerica";
const STORE = "upload-queue";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) {
          req.result.createObjectStore(STORE, { keyPath: "id" });
        }
      };
      req.onsuccess = () => {
        // If the connection dies (e.g. the user clears site data), let the
        // next operation reopen it instead of failing forever.
        req.result.onclose = () => {
          dbPromise = null;
        };
        resolve(req.result);
      };
      req.onerror = () => {
        dbPromise = null;
        reject(req.error);
      };
    });
  }
  return dbPromise;
}

function available(): boolean {
  return typeof indexedDB !== "undefined";
}

async function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T> | void,
): Promise<T | undefined> {
  if (!available()) return undefined;
  try {
    const db = await openDb();
    return await new Promise<T | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const req = run(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(req ? req.result : undefined);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } catch (e) {
    console.error("upload-queue db failed", e);
    return undefined;
  }
}

export async function queueGetAll(): Promise<StoredQueueItem[]> {
  const rows = await withStore<StoredQueueItem[]>("readonly", (s) => s.getAll());
  return (rows ?? []).sort((a, b) => a.createdAt - b.createdAt);
}

export async function queuePut(item: StoredQueueItem): Promise<void> {
  await withStore("readwrite", (s) => void s.put(item));
}

export async function queueDelete(id: string): Promise<void> {
  await withStore("readwrite", (s) => void s.delete(id));
}

export async function queueClear(): Promise<void> {
  await withStore("readwrite", (s) => void s.clear());
}
