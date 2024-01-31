import { defineTableWithMethods, getAwsClients } from "@netizen/utils-aws";
import { getEnvironmentValue } from "@netizen/utils-env";

const aws = getAwsClients();
const userTable = defineTableWithMethods({
  client: aws.dynamo,
  name: getEnvironmentValue("DYNAMO_USER"),
  primaryKey: { partitionKey: "id", sortKey: "sort" },
  secondaryIndexes: {},
});

export const userLibConfiguration = {
  config: { userTable },
};
