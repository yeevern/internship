import { z } from "zod";
import { lambdaDalleSaveHistoryEventSchema } from "../lambda/entities";

export const dalleHistorySchema = z
  .object({
    id: z.string(),
    sort: z.string(),
    image: z.string(),
  })
  .merge(lambdaDalleSaveHistoryEventSchema);

export const gptMetaSchema = z.object({
  id: z.string(),
  sort: z.string(),
  system: z.string(),
});

export const assistantMetaSchema = z.object({
  id: z.string(),
  sort: z.string(),
  // @TODO: Need to resovle this type after openai assistant is out of beta
  system: z.unknown(),
});

export const gptHistorySchema = z.object({
  id: z.string(),
  sort: z.string(),
  role: z.enum(["user", "assistant"]),
  // @TODO: Need to resovle this type after zod fix the bug https://github.com/colinhacks/zod/issues/2203
  content: z.any(),
  model: z.string().optional(),
  usage: z.any().optional(),
  // content: z.union([
  //   z.string(),
  //   z.union([
  //     z.object({
  //       type: z.literal("text"),
  //       text: z.string(),
  //     }),
  //     z.object({
  //       type: z.literal("image"),
  //       image_url: z.string(),
  //     }),
  //   ]),
  // ]),
});
