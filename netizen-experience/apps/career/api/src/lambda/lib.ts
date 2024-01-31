import { DynamoDBDocumentClient, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { LambdaValidationError } from "@netizen/utils-aws";
import { getCareerConfigs } from "./configs";
import { randomUUID } from "crypto";
import { ErrorObject } from "ajv";
import { DateTime } from "luxon";

export enum CareerErrorMessage {
  ENV_TABLE_NOT_FOUND = "Career - Table name env undefined",
  ENV_BUCKET_NOT_FOUND = "Career - Bucket name env undefined",
  FILE_SIZE_EXCEED_LIMIT = "Career - File size exceeds max limit",
  FILE_NOT_PDF = "Career - File is not PDF",
  UNKNOWN = "Career - Unknown error",
}

export enum CareerLogMessage {
  LIST_RECORDS = "Career - List records",
  GET_CANDIDATE_RECORDS = "Career - Get candidate records",
  GET_GREETING = "Career - Get greeting message",
  GET_INSTRUCTION = "Career - Get instruction",
  SUBMIT_RESUME = "Career - Submit resume",
}

export type CareerLogAction = "GET_INSTRUCTION" | "SUBMIT_RESUME_FAILED" | "SUBMIT_RESUME_SUCCESS";

export type CareerLogStatus = "UNPROCESSED" | "PROCESSED";

export interface CareerSettings {
  maxFileSizeInMB: number;
  message: {
    greeting: string;
    instruction: string;
    submitted: string;
  };
}

export interface CareerConfigs {
  table: string;
  bucket: string;
  settings: CareerSettings;
}

export interface UploadResume {
  email: string;
  name: string;
  file: string;
}

export interface CareerLog {
  email: string;
  timestamp: string;
  date: string;
  action: CareerLogAction;
  status: CareerLogStatus;
  name?: string;
  file?: string;
  requestBody?: object;
  queryParams?: object;
  ip?: string;
  userAgent?: string;
}

interface LogMetadata {
  requestBody?: object;
  queryParams?: object;
  ip?: string;
  userAgent?: string;
}

interface BasicLogRequest extends LogMetadata {
  email: string;
  action: CareerLogAction;
}

interface ResumeLogRequest extends LogMetadata {
  email: string;
  name: string;
  filePath: string;
}

interface ResumeUploadReqeust {
  email: string;
  name: string;
  file: string;
}

export async function getLogsByEmail(client: DynamoDBDocumentClient, email: string) {
  const { table: TableName } = await getCareerConfigs();
  const result = await client.send(
    new QueryCommand({
      TableName,
      KeyConditionExpression: "#email = :email",
      ExpressionAttributeNames: { "#email": "email" },
      ExpressionAttributeValues: { ":email": email },
      ConsistentRead: true,
    }),
  );
  return result.Items as CareerLog[];
}

export async function getLogsByDate(client: DynamoDBDocumentClient, date?: string) {
  const { table: TableName } = await getCareerConfigs();
  const targetDate = date ?? DateTime.now().setZone("utc+8").toISODate();
  const result = await client.send(
    new QueryCommand({
      TableName,
      IndexName: "dateGSI",
      KeyConditionExpression: "#date = :date",
      ExpressionAttributeNames: { "#date": "date" },
      ExpressionAttributeValues: { ":date": targetDate },
    }),
  );
  return result.Items as CareerLog[];
}

export async function logAttempt(client: DynamoDBDocumentClient, { email, action, ...params }: BasicLogRequest) {
  const { table: TableName } = await getCareerConfigs();
  const now = DateTime.now().setZone("utc+8");
  const timestamp = now.toISO();
  const date = now.toISODate();
  if (timestamp === null || date === null) throw new Error("Invalid timestamp or date");
  const Item: CareerLog = {
    email,
    timestamp,
    date,
    action,
    status: "UNPROCESSED",
    ...params,
  };
  await client.send(new PutCommand({ TableName, Item }));
  return Item;
}

export async function logResume(
  client: DynamoDBDocumentClient,
  { email, filePath, name, ...params }: ResumeLogRequest,
) {
  const { table: TableName } = await getCareerConfigs();
  const now = DateTime.now().setZone("utc+8");
  const timestamp = now.toISO();
  const date = now.toISODate();
  if (timestamp === null || date === null) throw new Error("Invalid timestamp or date");
  const Item: CareerLog = {
    email,
    timestamp,
    date,
    action: "SUBMIT_RESUME_SUCCESS",
    status: "UNPROCESSED",
    name,
    file: filePath,
    ...params,
  };
  await client.send(new PutCommand({ TableName, Item }));
}

export async function uploadResume(client: S3Client, params: ResumeUploadReqeust) {
  const {
    bucket: Bucket,
    settings: { maxFileSizeInMB },
  } = await getCareerConfigs();

  const errors: ErrorObject[] = [];

  const Body = Buffer.from(params.file, "base64");
  const fileSizeInMB = Body.byteLength / 1048576;
  if (fileSizeInMB > maxFileSizeInMB)
    errors.push({
      instancePath: "/file",
      schemaPath: "#/properties/file/fileSize",
      keyword: "fileSize",
      params: { limit: maxFileSizeInMB },
      message: `'file' must NOT exceed ${maxFileSizeInMB}MB`,
    });

  const isPDFHeaderValid = Body.lastIndexOf("%PDF-") === 0;
  const isPDFEofValid = Body.lastIndexOf("%%EOF") > 4;
  if (!(isPDFHeaderValid && isPDFEofValid))
    errors.push({
      instancePath: "/file",
      schemaPath: "#/properties/file/format",
      keyword: "format",
      params: { format: "pdf", contentEncoding: "base64" },
      message: `'file' must be in the PDF format encoded in Base64 string`,
    });

  if (errors.length) throw new LambdaValidationError("Input validation error", errors, { body: params });

  const Key = `resumes/${params.email}/${randomUUID()}.pdf`;
  await client.send(new PutObjectCommand({ Bucket, Key, Body, ContentType: "application/pdf" }));
  return Key;
}
