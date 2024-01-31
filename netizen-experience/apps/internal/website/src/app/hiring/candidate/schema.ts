import { z } from "zod";

export const candidateSchema = z
  .object({
    candidateName: z.string().trim().min(1, { message: "Candidate's name is required" }),
    candidateEmail: z
      .string()
      .trim()
      .min(1, { message: "Candidate's email is required" })
      .email({ message: "Please use valid email" }),
    jobRole: z.enum(["Intern Tech"]),
    candidateSource: z.enum(["Email", "Job Street"]),
    candidateStatus: z.enum(["Career Pack", "Rejected"]),
    rejectionReason: z.string().trim(),
  })
  .refine(
    (data) => {
      if (data.candidateStatus === "Rejected") {
        return data.rejectionReason && data.rejectionReason.trim() !== "";
      }
      return true;
    },
    {
      message: "Rejection reason is required when the status is 'Rejected'",
      path: ["rejectionReason"],
    },
  );
