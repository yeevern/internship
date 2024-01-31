import { z } from "zod";
import { prefixedKeySchema, prefixedTimestampSchema } from "@netizen/utils-types";
import { surveyStatus } from "./types";

// @TODO: make `updatedAt` and `updatedBy` required
export const surveyMetaSchema = z.object({
  partition: z.string().uuid(),
  sort: z.literal("meta"),
  createdAt: z.number(),
  updatedAt: z.number().optional(),
  ownerId: z.string().uuid(),
  status: z.enum(surveyStatus),
  startDate: z.number(),
  endDate: z.number(),
  title: z.string(),
  description: z.string().optional(),
});

export const accessSchema = z.object({
  partition: z.string().uuid(),
  sort: prefixedTimestampSchema(["access"] as const),
  ownerId: z.string().uuid(),
  surveyId: z.string().uuid(),
});

export const answerSchema = z
  .object({
    partition: z.string().uuid(),
    sort: prefixedKeySchema(["answer"] as const),
    ownerId: z.string().uuid(),
    modelId: z.string().uuid(),
  })
  .and(
    z.union([
      z.object({ selectionValue: z.array(z.string()) }),
      z.object({ dateValue: z.number() }),
      z.object({ numberValue: z.number() }),
      z.object({ stringValue: z.string() }),
    ]),
  );
