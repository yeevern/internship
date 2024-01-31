import { z } from "zod";
import { prefixedTimestampSchema } from "@netizen/utils-types";
import { modelType } from "./types";

export const modelMetaSchema = z.object({
  partition: z.literal("meta"),
  sort: z.string(),
  modelId: z.string().uuid(),
  ownerId: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(modelType),
});

const baseModelSchema = z.object({
  partition: z.string().uuid(),
  sort: prefixedTimestampSchema(["date"] as const),
  modelId: z.string().uuid(),
  ownerId: z.string().uuid(),
});

export const selectionModelSchema = baseModelSchema.extend({
  type: z.enum(modelType).extract(["selection"]),
  selections: z.array(z.string()),
  allowOthers: z.boolean(),
});

export const dateModelSchema = baseModelSchema.extend({
  type: z.enum(modelType).extract(["date"]),
  min: z.number().optional(),
  max: z.number().optional(),
});

export const numberModelSchema = baseModelSchema.extend({
  type: z.enum(modelType).extract(["number"]),
  min: z.number().optional(),
  max: z.number().optional(),
});

export const stringModelSchema = baseModelSchema.extend({
  type: z.enum(modelType).extract(["string"]),
  regex: z.string().optional(),
});

export const modelSchema = baseModelSchema.and(
  z.discriminatedUnion("type", [
    z.object({
      type: z.enum(modelType).extract(["selection"]),
      selections: z.array(z.string()),
      allowOthers: z.boolean(),
    }),
    z.object({
      type: z.enum(modelType).extract(["date"]),
      min: z.number().optional(),
      max: z.number().optional(),
    }),
    z.object({
      type: z.enum(modelType).extract(["number"]),
      min: z.number().optional(),
      max: z.number().optional(),
    }),
    z.object({
      type: z.enum(modelType).extract(["string"]),
      regex: z.string().optional(),
    }),
  ]),
);
