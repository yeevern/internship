"use server";

import { default as OpenAI } from "openai";
import { getEnvironmentValue } from "@netizen/utils-env";
import { getChatHistory, saveChatHistory } from "@internal/libs-prompt-hub";
import { checkSession } from "@/googleAuth/session";

const openai = new OpenAI({ apiKey: getEnvironmentValue("OPENAI_API_KEY") });

export async function getMessageHistoryAction({ chatId }: { chatId: string }) {
  try {
    const session = await checkSession(["prompt"]);
    const history = await getChatHistory({ id: session.id, chatId });
    return { success: true, data: { history } };
  } catch (ex) {
    if (ex instanceof Error) return { success: false, error: { message: ex.message } };
    return { success: false, error: { message: "Unknown error" } };
  }
}

export async function promptAction({
  chatId,
  content,
}: {
  chatId: string;
  content: string | OpenAI.Chat.Completions.ChatCompletionContentPart[];
}) {
  // Delay 1s
  try {
    const session = await checkSession(["prompt"]);
    const history = await getChatHistory({ id: session.id, chatId });
    await saveChatHistory({ chatid: chatId, id: session.id, message: { content, role: "user" } });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const [systemMessage, ...rest] = history;
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [systemMessage, ...rest.slice(Math.max(history.length - 10, 0)), { role: "user", content }],
      user: session.id,
      max_tokens: 4096,
    });
    const message = response.choices[0].message;
    const { model, usage } = response;
    await saveChatHistory({ chatid: chatId, id: session.id, message, usage, model });
    return { success: true, data: { message } };
  } catch (ex) {
    if (ex instanceof Error) return { success: false, error: { message: ex.message } };
    return { success: false, error: { message: "Unknown error" } };
  }
}
