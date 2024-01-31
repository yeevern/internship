import { LambdaClient } from "@aws-sdk/client-lambda";
import { defineS3, defineTableWithMethods, getAwsClients } from "@netizen/utils-aws";
import { getEnvironmentValue } from "@netizen/utils-env";

const aws = getAwsClients();
const lambda = new LambdaClient();
const promptTable = defineTableWithMethods({
  client: aws.dynamo,
  name: getEnvironmentValue("DYNAMO_PROMPT"),
  primaryKey: { partitionKey: "id", sortKey: "sort" },
  secondaryIndexes: {},
});

export const promptLibConfig = {
  aws: { lambda },
  promptTable,
  promptBucket: defineS3({ bucket: getEnvironmentValue("S3_PROMPT"), client: aws.s3 }),
};
