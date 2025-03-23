import { S3Client } from "@aws-sdk/client-s3";

import { env } from "./env";

const s3Client = new S3Client({
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
  endpoint: "https://s3.us-west-1.wasabisys.com",
  forcePathStyle: true,
  region: env.AWS_REGION,
  disableHostPrefix: true, // Disable host prefix
  useAccelerateEndpoint: false, // Ensure acceleration is off
  useArnRegion: false
});

export { s3Client };