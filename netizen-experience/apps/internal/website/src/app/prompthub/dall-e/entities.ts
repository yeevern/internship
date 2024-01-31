import { z } from "zod";

export const generateImageSchema = z.object({
  prompt: z.string().min(1),
  n: z.coerce.number().min(1).max(10),
  quality: z.enum(["hd", "standard"]),
  style: z.enum(["vivid", "natural"]),
});
