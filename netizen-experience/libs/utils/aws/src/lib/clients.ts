import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import { fromEnv } from "@aws-sdk/credential-providers";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

let credentials: ReturnType<typeof fromEnv> | undefined;
let dynamo: DynamoDBDocumentClient;
let s3: S3Client;

export function getAwsCredentials() {
  if (dynamo && s3) return credentials;
  if (process.env["AWS_ACCESS_KEY_ID"] && process.env["AWS_SECRET_ACCESS_KEY"]) {
    console.log("Import from env");
    credentials = fromEnv();
  }
  return credentials;
}

export function getAwsClients() {
  if (dynamo && s3) return { dynamo, s3 };
  credentials = getAwsCredentials();
  dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({ credentials }));
  s3 = new S3Client({ credentials });
  return { dynamo, s3 };
}
