import { GetObjectCommand, PutObjectCommand, PutObjectCommandInput, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export function defineBucket({ bucket, client }: { client: S3Client; bucket: string }) {
  return {
    upload: async (params: Omit<PutObjectCommandInput, "Bucket">) => {
      await client.send(new PutObjectCommand({ ...params, Bucket: bucket }));
    },
    createPresignedUrl: ({ key }: { key: string }) => {
      const command = new GetObjectCommand({ Bucket: bucket, Key: key });
      return getSignedUrl(client, command, { expiresIn: 3600 });
    },
  };
}
