import * as z from "zod";

export const formSchema = z.object({
  overallImpression: z.string().min(1),
  previousExperience: z.string().min(1),
  strongestAsset: z.string().min(1),
  biggestDoubt: z.string().min(1),
  blendIntoTeam: z.string().min(1),
  englishProficiency: z.string().min(1),
  proceedToInternship: z.boolean(),
  remarks: z.string().optional(),
});

export type FeedbackFormData = z.infer<typeof formSchema>;
