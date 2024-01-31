import { defineTableWithMethods, getAwsClients } from "@netizen/utils-aws";
import { getEnvironmentValue } from "@netizen/utils-env";

const { dynamo } = getAwsClients();

const candidatesTable = defineTableWithMethods({
  client: dynamo,
  name: getEnvironmentValue("DYNAMO_CANDIDATES"),
  primaryKey: { partitionKey: "partition", sortKey: "sort" },
  secondaryIndexes: {},
});

export const hiringLibConfiguration = {
  candidatesTable,
};
