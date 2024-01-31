import { z } from "zod";

const questionTypeSchema = z.enum([
  "radio",
  "checkbox",
  "selection",
  "singleDate",
  "multiDate",
  "dateRange",
  "integer",
  "rating",
  "shortText",
  "longText",
]);

export const detailsFormSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  completionMessage: z.string().optional(),
});
export type DetailsFormValues = z.infer<typeof detailsFormSchema>;

export const questionFormSchema = z.object({
  id: z.string(),
  modelId: z.string().uuid(),
  modelType: z.enum(["selection", "date", "number", "string"]),
  questionType: questionTypeSchema,
  question: z.string().min(1),
  helperText: z.string().optional(),
  isOptional: z.boolean(),
  selectionOptions: z.array(
    z.object({
      value: z.string().min(1),
      label: z.string().optional(),
    }),
  ),
  randomizeOptionOrder: z.boolean(),
  min: z.number().optional(),
  max: z.number().optional(),
  regex: z.string().optional(),
});
export type QuestionFormValues = z.infer<typeof questionFormSchema>;

export const bulkEditFormSchema = z.object({
  questions: z.array(
    z.object({
      questionId: z.string(),
      question: z.string(),
      questionType: questionTypeSchema,
    }),
  ),
});
export type BulkEditFormValues = z.infer<typeof bulkEditFormSchema>;
