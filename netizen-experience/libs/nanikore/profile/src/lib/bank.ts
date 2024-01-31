import { UUID, randomUUID } from "crypto";
import { z } from "zod";
import { generatePrefixedKey, unsafe__create, unsafe__query, unsafe__remove, unsafe__update } from "@netizen/utils-aws";
import { initProfileLib } from "../init";
import { modelPaymentSettingsSchema } from "./entities";

//@TODO: Add more fields once requirements are clear
export interface Profile extends UserBankDetails {
  userId: UUID;
  sort: string;
}

export interface UserBankDetails {
  bankName: string;
  isPrimary: boolean;
  bankAccountNumber: string;
  bankAccountHolderName: string;
}

export async function addBankAccount(
  userId: UUID,
  bankAccount: Pick<
    z.infer<typeof modelPaymentSettingsSchema>,
    "bankAccountHolderName" | "bankName" | "bankAccountNumber"
  >,
) {
  const {
    aws: { dynamo: client },
    config: { profilesTable: table },
  } = initProfileLib();

  const accountId = randomUUID();

  const generatedPrefixKey = generatePrefixedKey("account", accountId);

  const result = await unsafe__create({
    client,
    table,
    item: {
      ...bankAccount,
      userId,
      sort: generatedPrefixKey,
      updatedAt: Date.now(),
      isPrimary: true,
    },
    schema: modelPaymentSettingsSchema,
  });

  return result;
}

export async function getBankAccounts(userId: UUID) {
  const {
    aws: { dynamo: client },
    config: { profilesTable: table },
  } = initProfileLib();

  const result = await unsafe__query({
    client,
    table,
    attributes: { userId },
    schema: modelPaymentSettingsSchema,
  });

  if (!result) {
    throw new Error("Profile - Bank accounts not found");
  }

  return result;
}

export async function updateBankAccount(userId: UUID, bankAccount: Partial<Profile>) {
  const {
    aws: { dynamo: client },
    config: { profilesTable: table },
  } = initProfileLib();

  return await unsafe__update({
    client,
    table,
    attributes: { userId, ...bankAccount },
    schema: modelPaymentSettingsSchema,
  });
}

export async function deleteBankAccount(userId: UUID, bankAccountId: string) {
  const {
    aws: { dynamo: client },
    config: { profilesTable: table },
  } = initProfileLib();

  return await unsafe__remove({
    client,
    table,
    keys: { userId, sort: bankAccountId },
  });
}
