"use server";

import { OpenAI } from "openai";
import { z } from "zod";
import { getEnvironmentValue } from "@netizen/utils-env";
import { BaseError } from "@netizen/utils-types";
import { saveDalleHistory } from "@internal/libs-prompt-hub";
import { checkSession } from "@/googleAuth/session";
import { ServerActionState, handleServerActionError, updateServerActionSuccessState } from "@/utils/types";
import { generateImageSchema } from "./entities";

const openai = new OpenAI({ apiKey: getEnvironmentValue("OPENAI_API_KEY") });

export async function generateImageAction(
  state: ServerActionState<{
    revisedPrompt: string;
    url: string;
  }>,
  data: z.infer<typeof generateImageSchema>,
) {
  try {
    const session = await checkSession(["prompt"]);
    const validated = generateImageSchema.safeParse(data);
    if (validated.success === false) throw new BaseError("Invalid data", { context: validated.error.flatten() });
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: data.prompt,
      n: data.n,
      quality: "standard",
      size: "1024x1024",
      response_format: "url",
      style: data.style,
      user: session.id,
    });
    const revisedPrompt = response.data[0].revised_prompt;
    const url = response.data[0].url;
    if (revisedPrompt === undefined || url === undefined) throw new BaseError("Invalid response from OpenAI");
    await saveDalleHistory({
      id: session.id,
      prompt: data.prompt,
      openAiResponse: {
        revisedPrompt,
        url,
      },
      imageGenerationParams: {
        quality: data.quality,
        style: data.style,
      },
    });
    updateServerActionSuccessState(state, {
      revisedPrompt,
      url,
    });
  } catch (ex) {
    handleServerActionError(state, ex);
  }
  return state;
}
