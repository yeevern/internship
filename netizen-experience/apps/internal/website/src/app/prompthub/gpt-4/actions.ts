"use server";

import { z } from "zod";
import { BaseError } from "@netizen/utils-types";
import { startChat } from "@internal/libs-prompt-hub";
import { checkSession } from "@/googleAuth/session";
import { ServerActionState, updateServerActionSuccessState, handleServerActionError } from "@/utils/types";
import { startChatSchema } from "./entities";

export async function startChatAction(state: ServerActionState<{ id: string }>, data: z.infer<typeof startChatSchema>) {
  try {
    const session = await checkSession(["prompt"]);
    if (session === undefined) throw new BaseError("Invalid session");
    const validated = startChatSchema.safeParse(data);
    if (validated.success === false) throw new BaseError("Invalid data", { context: validated.error.flatten() });
    const id = await startChat({ id: session.id, system: data.system });
    updateServerActionSuccessState(state, { id });
  } catch (ex) {
    handleServerActionError(state, ex);
  }
  return state;
}
