"use server";

import { addBankAccount, getBankAccounts, BankAccount, updateBankAccount } from "@nanikore/libs-profile";
import { authCheck } from "@/auth";

export async function getPaymentDetails() {
  const auth = await authCheck();
  return await getBankAccounts(auth.user.id);
}

export async function updatePaymentDetails(data: BankAccount) {
  const auth = await authCheck();
  return await updateBankAccount(auth.user.id, data);
}

export async function addPaymentDetail(data: Partial<BankAccount>) {
  const auth = await authCheck();
  return await addBankAccount(auth.user.id, data);
}
