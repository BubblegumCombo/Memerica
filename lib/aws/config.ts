// AWS S3 / CloudFront config. Server-only values come from env; the public CDN
// URL is exposed for rendering. The app runs without any of these (seed mode).

export const AWS_REGION = process.env.AWS_REGION;
export const S3_BUCKET = process.env.S3_BUCKET;
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

/** Public, browser-safe CloudFront domain in front of the bucket. */
export const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL;

export function isS3Configured(): boolean {
  return Boolean(AWS_REGION && S3_BUCKET && AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY);
}

/** Public URL for an S3 object key — via CloudFront when set, else the S3 URL. */
export function cdnUrl(key: string): string {
  if (CDN_URL) return `${CDN_URL.replace(/\/$/, "")}/${key}`;
  if (AWS_REGION && S3_BUCKET) return `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`;
  return `/${key}`;
}
