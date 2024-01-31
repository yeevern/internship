import { defineTable, getAwsClients } from "@netizen/utils-aws";
import { getEnvironmentValue } from "@netizen/utils-env";

// @TODO: temp fix for project table init
const projectsTable = defineTable({
  tableName: "",
  primaryIndex: { pk: "partition", sk: "sort" },
  secondaryIndexes: [
    { name: "eventIdLSI", pk: "partition", sk: "eventId" },
    { name: "statusGSI", pk: "status", sk: "createdAt" },
  ],
});

let config: {
  tableProjects: string;
  projectsTable: typeof projectsTable;
};

export function initProjectLib() {
  const aws = getAwsClients();
  if (config) return { config, aws };
  config = {
    tableProjects: "",
    projectsTable: defineTable({
      tableName: getEnvironmentValue("DYNAMO_PROJECTS"),
      primaryIndex: { pk: "partition", sk: "sort" },
      secondaryIndexes: [
        { name: "eventIdLSI", pk: "partition", sk: "eventId" },
        { name: "statusGSI", pk: "status", sk: "createdAt" },
      ],
    }),
  };
  return { config, aws };
}
