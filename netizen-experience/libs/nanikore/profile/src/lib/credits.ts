import { UUID } from "crypto";
import { z } from "zod";
import { unsafe__create, unsafe__query } from "@netizen/utils-aws";
import { initProfileLib } from "../init";
import { modelTransactionSchema } from "./entities";

export async function getBalance(userId: UUID) {
  const {
    aws: { dynamo: client },
    config: { transactionsTable: table },
  } = initProfileLib();

  const transactions = await unsafe__query({
    client,
    table,
    attributes: { userId },
    schema: modelTransactionSchema,
    order: "descending",
  });

  let balance = 0;

  if (transactions.length) {
    balance = transactions[0].balance;
  }

  return {
    balance,
  };
}

export async function credit(userId: UUID, params: Partial<z.infer<typeof modelTransactionSchema>>) {
  const {
    aws: { dynamo: client },
    config: { transactionsTable: table },
  } = initProfileLib();

  const unixTimestamp = Date.now();

  const { balance } = await getBalance(userId);

  return await unsafe__create({
    client,
    table,
    item: {
      ...params,
      transactionId: unixTimestamp,
      transactionType: "credit", // @TODO: enum
      createdAt: unixTimestamp,
      updatedAt: unixTimestamp,
      status: "pending",
      balance: balance + (params.amount ?? 0),
    },
    schema: modelTransactionSchema,
  });
}

export async function debit(userId: UUID, params: Partial<z.infer<typeof modelTransactionSchema>>) {
  const {
    aws: { dynamo: client },
    config: { transactionsTable: table },
  } = initProfileLib();

  const unixTimestamp = Date.now();

  const { balance } = await getBalance(userId);

  return await unsafe__create({
    client,
    table,
    item: {
      ...params,
      transactionId: unixTimestamp,
      transactionType: "debit", // @TODO: enum
      balance: balance - (params.amount ?? 0),
      createdAt: unixTimestamp,
      updatedAt: unixTimestamp,
      status: "pending",
    },
    schema: modelTransactionSchema,
  });
}
