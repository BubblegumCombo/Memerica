// Client upload helper: ask the server for a presigned URL, then PUT the bytes
// straight to S3. Returns the stored key + its public (CDN) URL.

export interface UploadResult {
  key: string;
  url: string;
}

export async function uploadImage(file: Blob, contentType: string): Promise<UploadResult> {
  const presignRes = await fetch("/api/uploads/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType }),
  });

  if (!presignRes.ok) {
    const detail = await presignRes.json().catch(() => null);
    throw new Error(detail?.error ?? `Could not start upload (${presignRes.status})`);
  }

  const { uploadUrl, key, url } = (await presignRes.json()) as {
    uploadUrl: string;
    key: string;
    url: string;
  };

  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  });
  if (!putRes.ok) throw new Error(`Upload failed (${putRes.status})`);

  return { key, url };
}
