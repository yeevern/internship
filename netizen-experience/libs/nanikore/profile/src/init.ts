import { defineTable, getAwsClients } from "@netizen/utils-aws";
import { getEnvironmentValue } from "@netizen/utils-env";

const profilesTable = defineTable({
  tableName: getEnvironmentValue("DYNAMO_PROFILES"),
  primaryIndex: { pk: "userId", sk: "sort" },
  secondaryIndexes: [],
});

const transactionsTable = defineTable({
  tableName: getEnvironmentValue("DYNAMO_TRANSANCTIONS"),
  primaryIndex: { pk: "partition", sk: "sort" },
  secondaryIndexes: [{ name: "projectIdGSI", pk: "projectId" }],
});

let config: {
  tableProfiles: string;
  profilesTable: typeof profilesTable;
  transactionsTable: typeof transactionsTable;
};

export function initProfileLib() {
  const aws = getAwsClients();
  if (config) return { config, aws };
  config = {
    tableProfiles: getEnvironmentValue("DYNAMO_PROFILES"),
    profilesTable,
    transactionsTable,
  };
  return { config, aws };
}
