import { z } from "zod";

export const lambdaDalleSaveHistoryEventSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  imageGenerationParams: z.object({
    quality: z.enum(["hd", "standard"]),
    style: z.enum(["natural", "vivid"]),
  }),
  openAiResponse: z.object({
    revisedPrompt: z.string(),
    url: z.string().url(),
  }),
});
