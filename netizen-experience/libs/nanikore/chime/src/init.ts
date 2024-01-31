import { ChimeSDKMeetingsClient } from "@aws-sdk/client-chime-sdk-meetings";
import { defineTableWithMethods, getAwsClients, getAwsCredentials } from "@netizen/utils-aws";
import { getEnvironmentValue } from "@netizen/utils-env";

const region = "ap-southeast-1";
const chime = new ChimeSDKMeetingsClient({ credentials: getAwsCredentials(), region });
const aws = getAwsClients();
const chimeTable = defineTableWithMethods({
  client: aws.dynamo,
  name: getEnvironmentValue("DYNAMO_CHIME"),
  primaryKey: { partitionKey: "sessionId", sortKey: "sort" },
  secondaryIndexes: {},
});

export const chimeLibConfiguration = {
  config: {
    chimeTable,
    region,
  },
  aws: { ...aws, chime },
};
