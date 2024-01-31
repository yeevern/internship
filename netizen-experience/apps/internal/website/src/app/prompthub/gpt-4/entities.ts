import { z } from "zod";

export const startChatSchema = z.object({
  system: z.string(),
});
