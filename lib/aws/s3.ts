import "server-only";
import { S3Client } from "@aws-sdk/client-s3";
import { AWS_ACCESS_KEY_ID, AWS_REGION, AWS_SECRET_ACCESS_KEY } from "./config";

let client: S3Client | null = null;

/** Lazily-constructed S3 client (server-only). Throws if AWS env is missing. */
export function getS3Client(): S3Client {
  if (!AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
    throw new Error(
      "AWS S3 is not configured. Set AWS_REGION, S3_BUCKET, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY.",
    );
  }
  if (!client) {
    client = new S3Client({
      region: AWS_REGION,
      credentials: { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY },
    });
  }
  return client;
}
