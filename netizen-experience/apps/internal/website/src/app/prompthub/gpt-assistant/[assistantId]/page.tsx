import { default as OpenAI } from "openai";
import { getThreadMessages } from "./actions";
import ChatPanel from "./chat";

export default async function createThread({
  params: { assistantId },
  searchParams: { threadId },
}: {
  params: { assistantId: string };
  searchParams: { threadId: string | string[] | undefined };
}) {
  if (Array.isArray(threadId)) threadId = threadId[0];
  let messages: OpenAI.Beta.Threads.Messages.ThreadMessage[] | undefined;
  if (typeof threadId === "string")
    if (threadId) {
      messages = await getThreadMessages({ threadId });
    }
  return <ChatPanel {...{ messages, threadId, assistantId }} />;
}
