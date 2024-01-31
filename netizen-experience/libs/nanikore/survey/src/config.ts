import { defineTableWithMethods, getAwsClients } from "@netizen/utils-aws";
import { getEnvironmentValue } from "@netizen/utils-env";

const { dynamo } = getAwsClients();

const modelsTable = defineTableWithMethods({
  client: dynamo,
  name: getEnvironmentValue("DYNAMO_SURVEY_MODELS"),
  primaryKey: { partitionKey: "partition", sortKey: "sort" },
  secondaryIndexes: {
    modelIdLSI: { partitionKey: "partition", sortKey: "modelId" },
    modelIdGSI: { partitionKey: "modelId" },
  },
});

const surveysTable = defineTableWithMethods({
  client: dynamo,
  name: getEnvironmentValue("DYNAMO_SURVEYS"),
  primaryKey: { partitionKey: "partition", sortKey: "sort" },
  secondaryIndexes: {
    modelIdGSI: { partitionKey: "modelId", sortKey: "sort" },
    statusGSI: { partitionKey: "status", sortKey: "createdAt" },
  },
});

export const surveyLibConfiguration = {
  modelsTable,
  surveysTable,
};
