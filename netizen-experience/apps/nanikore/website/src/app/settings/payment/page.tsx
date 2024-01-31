"use server";

import { BankAccount } from "@nanikore/libs-profile";
import { getPaymentDetails } from "./actions";
import { BankDetailForm } from "./bank-detail-form";

export default async function Payment() {
  let bankDetails: BankAccount = {} as BankAccount;

  const getExistingBankDetails = await getPaymentDetails();

  if (getExistingBankDetails.length) {
    const primaryBankAccount = getExistingBankDetails.find((paymentDetail) => paymentDetail.isPrimary);
    if (primaryBankAccount) {
      bankDetails = primaryBankAccount;
    }
  }

  return (
    <div>
      <h1>Payment Settings</h1>
      <p>Your credits will be cashed out to the following account.</p>
      <p>Bank transfer is currently available for banks in Malaysia only.</p>
      <BankDetailForm bankDetails={bankDetails}></BankDetailForm>
    </div>
  );
}
