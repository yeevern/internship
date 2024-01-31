import { randomUUID } from "crypto";
import { S3Client } from "@aws-sdk/client-s3";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { z } from "zod";
import { generatePrefixedKey } from "@netizen/utils-aws";
import { initProfileLib } from "../init";
import { UserBankDetails, addBankAccount, deleteBankAccount, getBankAccounts, updateBankAccount } from "./bank";
import { modelPaymentSettingsSchema } from "./entities";

jest.mock("../init");
jest.mock("@aws-sdk/client-dynamodb");

//Mock data
const mockPrimaryBankAccount: UserBankDetails = {
  bankName: "Primary Test Bank",
  bankAccountNumber: "1234567890",
  bankAccountHolderName: "Primary Bank Account Holder",
  isPrimary: true,
};
//End mock data

describe("getBankAccounts", () => {
  it("should query the DynamoDB table and return the result", async () => {
    const mockUserId = "fa5ead86-d980-4fa8-b74d-a5e99712b21f";

    const mockResult: z.infer<typeof modelPaymentSettingsSchema>[] = [
      {
        userId: mockUserId,
        sort: generatePrefixedKey("account", randomUUID()),
        bankName: "test",
        bankAccountNumber: "test",
        bankAccountHolderName: "test",
        isPrimary: true,
        updatedAt: Date.now(),
      },
    ];

    const mockSend = jest.fn().mockReturnValue({ Items: mockResult });
    const mockDynamoClient: DynamoDBDocumentClient = { send: mockSend } as unknown as DynamoDBDocumentClient;
    const mockS3Client: S3Client = {} as unknown as S3Client;

    (initProfileLib as jest.Mock<ReturnType<typeof initProfileLib>>).mockReturnValue({
      aws: { dynamo: mockDynamoClient, s3: mockS3Client },
      config: { tableProfiles: "test" },
    });

    const result = await getBankAccounts(mockUserId);

    expect(result).toEqual(mockResult);
  });

  it("should throw an error getBankAccounts failed", async () => {
    const mockUserId = randomUUID();
    const mockError = new Error("Profile - Bank accounts not foundd");

    const mockSend = jest.fn().mockRejectedValue(mockError);
    const mockDynamoClient: DynamoDBDocumentClient = { send: mockSend } as unknown as DynamoDBDocumentClient;
    const mockS3Client: S3Client = {} as unknown as S3Client;

    (initProfileLib as jest.Mock<ReturnType<typeof initProfileLib>>).mockReturnValue({
      aws: { dynamo: mockDynamoClient, s3: mockS3Client },
      config: { tableProfiles: "test" },
    });

    await expect(getBankAccounts(mockUserId)).rejects.toThrow(mockError);
  });
});

describe("addBankAccount", () => {
  it("should add a bank account to the DynamoDB table", async () => {
    const mockUserId = randomUUID();
    const mockBankAccount: UserBankDetails = {
      bankName: "test",
      bankAccountNumber: "test",
      bankAccountHolderName: "test",
      isPrimary: true,
    };

    const mockResult = { Attributes: mockPrimaryBankAccount };

    const mockSend = jest.fn().mockReturnValue(mockResult);
    const mockDynamoClient: DynamoDBDocumentClient = { send: mockSend } as unknown as DynamoDBDocumentClient;
    const mockS3Client: S3Client = {} as unknown as S3Client;

    (initProfileLib as jest.Mock<ReturnType<typeof initProfileLib>>).mockReturnValue({
      aws: { dynamo: mockDynamoClient, s3: mockS3Client },
      config: { tableProfiles: "test" },
    });

    const result = await addBankAccount(mockUserId, mockBankAccount);

    expect(result).toBeTruthy();
  });

  it("should throw an error addBankAccount failed", async () => {
    const mockError = new Error("Dynamo - Item does not match schema");

    const mockSend = jest.fn().mockRejectedValue(mockError);
    const mockDynamoClient: DynamoDBDocumentClient = { send: mockSend } as unknown as DynamoDBDocumentClient;
    const mockS3Client: S3Client = {} as unknown as S3Client;

    (initProfileLib as jest.Mock<ReturnType<typeof initProfileLib>>).mockReturnValue({
      aws: { dynamo: mockDynamoClient, s3: mockS3Client },
      config: { tableProfiles: "test" },
    });

    await expect(addBankAccount(randomUUID(), {} as UserBankDetails)).rejects.toThrow(mockError);
  });
});

describe("updateBankAccount", () => {
  it("should update a bank account in the DynamoDB table", async () => {
    const mockUserId = randomUUID();

    const mockResult = { Attributes: mockPrimaryBankAccount };
    const mockSend = jest.fn().mockReturnValue(mockResult);
    const mockS3Client: S3Client = {} as unknown as S3Client;
    const mockDynamoClient: DynamoDBDocumentClient = { send: mockSend } as unknown as DynamoDBDocumentClient;

    (initProfileLib as jest.Mock<ReturnType<typeof initProfileLib>>).mockReturnValue({
      aws: { dynamo: mockDynamoClient, s3: mockS3Client },
      config: { tableProfiles: "test" },
    });

    const result = await updateBankAccount(mockUserId, mockPrimaryBankAccount);

    expect(result).toEqual({
      updatedAttributes: mockPrimaryBankAccount,
    });
  });

  it('should throw an error "Dynamo - Item does not match schema"', async () => {
    const mockUserId = randomUUID();
    const mockError = new Error("Dynamo - Item does not match schema");

    const mockSend = jest.fn().mockRejectedValue(mockError);
    const mockS3Client: S3Client = {} as unknown as S3Client;
    const mockDynamoClient: DynamoDBDocumentClient = { send: mockSend } as unknown as DynamoDBDocumentClient;

    (initProfileLib as jest.Mock<ReturnType<typeof initProfileLib>>).mockReturnValue({
      aws: { dynamo: mockDynamoClient, s3: mockS3Client },
      config: { tableProfiles: "test" },
    });

    await expect(updateBankAccount(mockUserId, mockPrimaryBankAccount)).rejects.toThrow(mockError);
  });
});

describe("deleteBankAccount", () => {
  it("should delete a bank account from the DynamoDB table", async () => {
    const mockUserId = randomUUID();

    const mockResult = { Attributes: mockPrimaryBankAccount };
    const mockSend = jest.fn().mockReturnValue(mockResult);
    const mockS3Client: S3Client = {} as unknown as S3Client;
    const mockDynamoClient: DynamoDBDocumentClient = { send: mockSend } as unknown as DynamoDBDocumentClient;

    const mockAccountId = generatePrefixedKey("account", randomUUID());

    (initProfileLib as jest.Mock<ReturnType<typeof initProfileLib>>).mockReturnValue({
      aws: { dynamo: mockDynamoClient, s3: mockS3Client },
      config: { tableProfiles: "test" },
    });

    const result = await deleteBankAccount(mockUserId, mockAccountId);

    expect(result).toEqual({});
  });

  it('should throw an error "Dynamo - Item does not match schema"', async () => {
    const mockUserId = randomUUID();
    const mockError = new Error("Dynamo - Item does not match schema");

    const mockSend = jest.fn().mockRejectedValue(mockError);
    const mockS3Client: S3Client = {} as unknown as S3Client;
    const mockDynamoClient: DynamoDBDocumentClient = { send: mockSend } as unknown as DynamoDBDocumentClient;

    const mockAccountId = generatePrefixedKey("account", randomUUID());

    (initProfileLib as jest.Mock<ReturnType<typeof initProfileLib>>).mockReturnValue({
      aws: { dynamo: mockDynamoClient, s3: mockS3Client },
      config: { tableProfiles: "test" },
    });

    await expect(deleteBankAccount(mockUserId, mockAccountId)).rejects.toThrow(mockError);
  });
});
