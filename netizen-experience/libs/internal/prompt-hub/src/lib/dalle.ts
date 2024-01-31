import { InvokeCommand } from "@aws-sdk/client-lambda";
import { z } from "zod";
import { parsePrefixedKey } from "@netizen/utils-aws";
import { getEnvironmentValue } from "@netizen/utils-env";
import { promptLibConfig } from "../init";
import { lambdaDalleSaveHistoryEventSchema } from "../lambda/entities";
import { dalleHistorySchema } from "./entities";

export async function saveDalleHistory(params: z.infer<typeof lambdaDalleSaveHistoryEventSchema>) {
  const {
    aws: { lambda },
  } = promptLibConfig;
  lambdaDalleSaveHistoryEventSchema.parse(params);
  await lambda.send(
    new InvokeCommand({
      FunctionName: getEnvironmentValue("LAMBDA_DALLE_SAVE_HISTORY"),
      InvocationType: "Event",
      Payload: JSON.stringify(params),
    }),
  );
}

export async function getDalleHistory({ id, promptId }: { id: string; promptId: number }) {
  const { promptBucket, promptTable } = promptLibConfig;
  const item = await promptTable.get({
    schema: dalleHistorySchema,
    keys: { id, sort: `dalle#${promptId}` },
  });
  if (item === undefined) throw new Error(`Dalle history not found: ${id} ${promptId}`);
  const url = await promptBucket.createPresignedUrl({ key: item.image });
  return {
    ...item,
    url,
  };
}

export async function listDalleHistory({ id }: { id: string }) {
  const { promptTable } = promptLibConfig;
  const items = await promptTable.query({
    schema: dalleHistorySchema,
    keyConditionExpression: "#id = :id AND begins_with(#sort, :sort)",
    attributes: { id, sort: "dalle#" },
    order: "descending",
  });
  return items
    .map((item) => {
      const { sort, ...updatedItem } = item;
      const parsed = parsePrefixedKey("dalle", sort);
      return { ...updatedItem, promptedId: parseInt(parsed) };
    })
    .sort((a, b) => b.promptedId - a.promptedId);
}
