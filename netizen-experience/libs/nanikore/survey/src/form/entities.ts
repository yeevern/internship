import { z } from "zod";
import { prefixedKeySchema } from "@netizen/utils-types";
import { comparisonOperator, questionType } from "./types";

const conditionsArraySchema = z
  .array(
    z
      .array(
        z.object({
          modelId: z.string().uuid(),
          operator: z.enum(comparisonOperator),
          value: z.union([z.array(z.string()), z.number(), z.string()]),
        }),
      )
      .nonempty(),
  )
  .nonempty();

export const formNodeSchema = z.object({
  partition: z.string().uuid(),
  sort: prefixedKeySchema(["form"] as const),
  title: z.string(),
  description: z.string().optional(),
});

export const rootNodeSchema = formNodeSchema.extend({
  sort: z.literal("form#root"),
  destinationId: z.string(),
});

export const branchNodeSchema = formNodeSchema.extend({
  sort: prefixedKeySchema(["form", "branch"] as const),
  destinationId: z.string().optional(), // @TODO: optional or nullable
  branchCondition: z
    .object({
      conditions: conditionsArraySchema,
      destinationId: z.string(),
    })
    .optional(),
  randomizeQuestionOrder: z.boolean(),
});

export const leafNodeSchema = formNodeSchema.extend({
  sort: prefixedKeySchema(["form", "leaf"] as const),
});

export const questionSchema = z.object({
  partition: z.string().uuid(),
  sort: prefixedKeySchema(["question"] as const),
  branchId: z.string(),
  questionIndex: z.number(),
  skipCondition: z
    .object({
      operator: z.enum(comparisonOperator),
      value: z.union([z.array(z.string()), z.number(), z.string()]),
      destinationIndex: z.number(),
    })
    .optional(),
  modelId: z.string().uuid(),
  type: z.enum(questionType),
  question: z.string(),
  helperText: z.string().optional(),
  isOptional: z.boolean(),
  selectionOptions: z.array(
    z.object({
      value: z.string(),
      label: z.string(),
    }),
  ),
  randomizeOptionOrder: z.boolean(),
  min: z.number().optional(),
  max: z.number().optional(),
  regex: z.string().optional(),
});
