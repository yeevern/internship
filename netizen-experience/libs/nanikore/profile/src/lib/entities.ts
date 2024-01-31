import { z } from "zod";
import { uuidSchema } from "@netizen/utils-types";

export const modelPaymentSettingsSchema = z.object({
  userId: uuidSchema,
  sort: z.string(),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankAccountHolderName: z.string().optional(),
  email: z.string().optional(),
  phoneNumber: z.string().optional(),
  updatedAt: z.number(),
  isPrimary: z.boolean(),
});

export const modelTransactionSchema = z.object({
  userId: uuidSchema,
  transactionId: z.number(),
  projectId: z.string(),
  transactionType: z.string(),
  amount: z.number(),
  balance: z.number(),
  createdAt: z.number(),
  updatedAt: z.number(),
  status: z.string(),
});
