import { UUID } from "crypto";

export interface BankAccount {
  userId: UUID;
  sort: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolderName?: string;
  email?: string;
  phoneNumber?: string;
  updatedAt: number;
  isPrimary: boolean;
}
