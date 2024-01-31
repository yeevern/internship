import { default as OpenAI } from "openai";
import { parsePrefixedKey } from "@netizen/utils-aws";
import { promptLibConfig } from "../init";
import { gptHistorySchema, gptMetaSchema } from "./entities";

export async function startChat({ id, system }: { id: string; system: string }) {
  const { promptTable } = promptLibConfig;
  const sort = `${Date.now()}`;
  await promptTable.create({
    schema: gptMetaSchema,
    item: {
      id,
      sort: `gpt#${sort}`,
      system,
    },
  });
  return sort;
}

export async function saveChatHistory({
  chatid,
  id,
  message,
  model,
  usage,
}: {
  id: string;
  chatid: string;
  message: OpenAI.Chat.Completions.ChatCompletionMessageParam;
  model?: string;
  usage?: OpenAI.Completions.CompletionUsage;
}) {
  const { promptTable } = promptLibConfig;
  const { content, role } = message;
  await promptTable.create({
    schema: gptHistorySchema,
    item: {
      id: `${id}#${chatid}`,
      sort: `${Date.now()}`,
      role,
      content,
      model,
      usage,
    },
  });
}

export async function getChatHistory({
  chatId,
  id,
}: {
  id: string;
  chatId: string;
}): Promise<OpenAI.Chat.Completions.ChatCompletionMessageParam[]> {
  const { promptTable } = promptLibConfig;
  const meta = await promptTable.get({
    schema: gptMetaSchema,
    keys: {
      id,
      sort: `gpt#${chatId}`,
    },
  });
  if (meta === undefined) throw new Error("No chat history found");
  const chatIdKey = parsePrefixedKey("gpt", meta.sort);
  const items = await promptTable.query({
    schema: gptHistorySchema,
    keyConditionExpression: "#id = :id",
    attributes: { id: `${id}#${chatIdKey}` },
    order: "ascending",
  });
  return [
    {
      role: "system",
      content: meta.system,
    },
    ...items.map(({ content, role }) => {
      return {
        role,
        // @TODO: Need to resovle this type after zod fix the bug https://github.com/colinhacks/zod/issues/2203
        content,
      } as OpenAI.Chat.Completions.ChatCompletionMessageParam;
    }),
  ];
}

export async function listGptHistory({ id }: { id: string }) {
  const { promptTable } = promptLibConfig;
  const items = await promptTable.query({
    schema: gptMetaSchema,
    keyConditionExpression: "#id = :id AND begins_with(#sort, :sort)",
    attributes: { id, sort: "gpt#" },
    order: "descending",
  });
  return items
    .map((item) => {
      const { sort, ...updatedItem } = item;
      const parsed = parsePrefixedKey("gpt", sort);
      return { ...updatedItem, chatId: parseInt(parsed) };
    })
    .sort((a, b) => b.chatId - a.chatId);
}
