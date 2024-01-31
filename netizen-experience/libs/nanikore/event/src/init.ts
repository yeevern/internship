import { getAwsClients } from "@netizen/utils-aws";
import { getEnvironmentValue } from "@netizen/utils-env";

let config: {
  tableEvents: string;
};

export function initEventLib() {
  const aws = getAwsClients();
  if (config) return { config, aws };
  config = {
    tableEvents: getEnvironmentValue("DYNAMO_EVENTS"),
  };
  return { config, aws };
}
