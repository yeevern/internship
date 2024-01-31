"use server";

import { default as OpenAI } from "openai";
import { getEnvironmentValue } from "@netizen/utils-env";
import { isTypeOf } from "@netizen/utils-types";
import { checkSession } from "@/googleAuth/session";
import { ListAssistantParams, ListAssistantAfterParams, ListAssistantBeforeParams } from "./types";

const openai = new OpenAI({ apiKey: getEnvironmentValue("OPENAI_API_KEY") });

export async function listAssistant(params?: ListAssistantParams) {
  await checkSession("gptAssistant");
  const limit = 20;
  let after: string | undefined = undefined;
  let before: string | undefined = undefined;
  if (params) {
    if (isTypeOf<ListAssistantAfterParams>(params, (params) => params.after !== undefined)) {
      after = params.after;
    } else if (isTypeOf<ListAssistantBeforeParams>(params, (params) => params?.before !== undefined)) {
      before = params.before;
    }
  }
  const list = await openai.beta.assistants.list({
    limit,
    after,
    before,
  });
  let listAfter: string | undefined;
  let listBefore: string | undefined;
  const items = list.getPaginatedItems();
  if (items.length > 0) {
    const nextPage = await openai.beta.assistants.list({
      limit,
      after: items[items.length - 1].id,
    });
    if (nextPage.data.length > 0) {
      listAfter = items[items.length - 1].id;
    }
    const previosPage = await openai.beta.assistants.list({
      limit,
      before: items[0].id,
    });
    if (previosPage.data.length > 0) {
      listBefore = items[0].id;
    }
  }
  return { items, after: listAfter, before: listBefore };
}
