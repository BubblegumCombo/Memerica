# process-image Lambda

S3-triggered function that, for each new original under `uploads/`, writes a
1080px WebP and a 320px thumbnail under `uploads/derived/` and runs Rekognition
moderation.

## Deploy

```bash
cd infra/lambda/process-image
npm install                       # sharp must match the Lambda arch — build on
                                  # linux/arm64 or use a Lambda layer for sharp
zip -r function.zip index.mjs node_modules package.json
# create/update the function (Node 20+, arm64), then add the S3 trigger:
#   bucket: memerica-uploads, event: s3:ObjectCreated:*, prefix: uploads/
```

Runtime: Node.js 20+, handler `index.handler`, 1024 MB / 30s timeout is plenty.

## Execution role policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    { "Effect": "Allow", "Action": ["s3:GetObject", "s3:PutObject"], "Resource": "arn:aws:s3:::memerica-uploads/uploads/*" },
    { "Effect": "Allow", "Action": ["rekognition:DetectModerationLabels"], "Resource": "*" },
    { "Effect": "Allow", "Action": ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"], "Resource": "arn:aws:logs:*:*:*" }
  ]
}
```

To write moderation results back to a post, add `SUPABASE_SERVICE_ROLE_KEY` +
`NEXT_PUBLIC_SUPABASE_URL` to the function env and complete the TODO in
`index.mjs`.
