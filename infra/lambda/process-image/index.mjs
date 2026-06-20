import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { RekognitionClient, DetectModerationLabelsCommand } from "@aws-sdk/client-rekognition";
import sharp from "sharp";

// S3 ObjectCreated trigger for Memerica uploads. For each new original under
// uploads/, it writes a 1080 WebP + a 320 thumbnail under uploads/derived/ and
// runs Rekognition moderation. Wire status back to the post row via the
// Supabase service-role key (see the TODO below).

const s3 = new S3Client({});
const rekognition = new RekognitionClient({});
const MIN_CONFIDENCE = 80;

export const handler = async (event) => {
  for (const record of event.Records ?? []) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

    // Only process freshly-uploaded originals.
    if (!key.startsWith("uploads/") || key.includes("/derived/")) continue;

    const original = await getObjectBytes(bucket, key);
    const base = key.replace(/^uploads\//, "uploads/derived/").replace(/\.[^.]+$/, "");

    const webp = await sharp(original)
      .resize(1080, 1080, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    const thumb = await sharp(original)
      .resize(320, 320, { fit: "cover" })
      .webp({ quality: 75 })
      .toBuffer();

    await putObject(bucket, `${base}.webp`, webp, "image/webp");
    await putObject(bucket, `${base}.thumb.webp`, thumb, "image/webp");

    const moderation = await rekognition.send(
      new DetectModerationLabelsCommand({
        Image: { S3Object: { Bucket: bucket, Name: key } },
        MinConfidence: MIN_CONFIDENCE,
      }),
    );
    const flagged = (moderation.ModerationLabels ?? []).length > 0;

    // TODO (live): update the post row in Supabase using SUPABASE_SERVICE_ROLE_KEY
    // — set status='flagged' when `flagged`, and store the derived keys.
    console.log(JSON.stringify({ key, flagged, labels: moderation.ModerationLabels ?? [] }));
  }

  return { ok: true };
};

async function getObjectBytes(Bucket, Key) {
  const res = await s3.send(new GetObjectCommand({ Bucket, Key }));
  return Buffer.from(await res.Body.transformToByteArray());
}

async function putObject(Bucket, Key, Body, ContentType) {
  await s3.send(
    new PutObjectCommand({
      Bucket,
      Key,
      Body,
      ContentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
}
