"use server";

import { default as OpenAI } from "openai";
import { getEnvironmentValue } from "@netizen/utils-env";
import { saveThread } from "@internal/libs-prompt-hub";
import { checkSession } from "@/googleAuth/session";

const openai = new OpenAI({ apiKey: getEnvironmentValue("OPENAI_API_KEY") });

export async function createThread() {
  const session = await checkSession("gptAssistant");
  const thread = await openai.beta.threads.create();
  await saveThread({
    id: session.id,
    thread,
  });
  return thread;
}

export async function addMesageToThread({
  assistantId: assistant_id,
  content,
  threadId,
}: {
  assistantId: string;
  threadId: string;
  content: string;
}) {
  await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content,
  });
  const { id: runId } = await openai.beta.threads.runs.create(threadId, {
    assistant_id,
  });
  return { runId };
}

export async function getThread({ threadId }: { threadId: string }) {
  return await openai.beta.threads.retrieve(threadId);
}

export async function getThreadMessages({ threadId }: { threadId: string }) {
  return (await openai.beta.threads.messages.list(threadId, { order: "asc" })).data;
}

export async function checkRunStatus({ runId, threadId }: { runId: string; threadId: string }) {
  const run = await openai.beta.threads.runs.retrieve(threadId, runId);
  return run;
}
