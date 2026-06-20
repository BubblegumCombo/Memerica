import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getS3Client } from "@/lib/aws/s3";
import { S3_BUCKET, cdnUrl, isS3Configured } from "@/lib/aws/config";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp"]);
const EXT: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };

/**
 * Returns a presigned S3 PUT URL so the client uploads image bytes directly to
 * S3 (never through this function). When Supabase is wired, requires a signed-in
 * user. Image processing/moderation happens async via the S3-triggered Lambda.
 */
export async function POST(request: Request) {
  if (!isS3Configured()) {
    return NextResponse.json({ error: "Image uploads are not configured." }, { status: 503 });
  }

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { contentType?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const contentType = body.contentType ?? "image/png";
  if (!ALLOWED.has(contentType)) {
    return NextResponse.json({ error: "Unsupported content type" }, { status: 415 });
  }

  const key = `uploads/${crypto.randomUUID()}.${EXT[contentType]}`;
  const command = new PutObjectCommand({ Bucket: S3_BUCKET!, Key: key, ContentType: contentType });
  const uploadUrl = await getSignedUrl(getS3Client(), command, { expiresIn: 60 });

  return NextResponse.json({ uploadUrl, key, url: cdnUrl(key) });
}
