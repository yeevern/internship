import { z } from "zod";
import { uuidSchema } from "@netizen/utils-types";

export const hijauSchema = z.object({
  partition: z.string(),
  sort: z.string(),
  color: z.string(),
});

export const candidateInfoSchema = z.object({
  partition: uuidSchema,
  sort: z.string(),
});
