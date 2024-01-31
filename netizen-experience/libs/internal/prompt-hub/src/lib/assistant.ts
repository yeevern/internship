import { parsePrefixedKey } from "@netizen/utils-aws";
import { promptLibConfig } from "../init";
import { assistantMetaSchema } from "./entities";

export async function saveThread<type>({ id, thread }: { id: string; thread: type }) {
  const { promptTable } = promptLibConfig;
  const sort = `${Date.now()}`;
  await promptTable.create({
    schema: assistantMetaSchema,
    item: {
      id,
      sort: `assistant#${sort}`,
      thread,
    },
  });
  return;
}

export async function listThreads({ id }: { id: string }) {
  const { promptTable } = promptLibConfig;
  const items = await promptTable.query({
    schema: assistantMetaSchema,
    keyConditionExpression: "#id = :id AND begins_with(#sort, :sort)",
    attributes: { id, sort: "assistant#" },
    order: "descending",
  });
  return items
    .map((item) => {
      const { sort, ...updatedItem } = item;
      const parsed = parsePrefixedKey("assistant", sort);
      return { ...updatedItem, chatId: parseInt(parsed) };
    })
    .sort((a, b) => b.chatId - a.chatId);
}
