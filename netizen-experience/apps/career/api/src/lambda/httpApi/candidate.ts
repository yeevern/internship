import { getAwsClients, createResponse, handleError, parseRequest } from "@netizen/utils-aws";
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import candidateSchema from "../schema/candidate.json";
import { getLogsByEmail } from "../lib";
import { DateTime } from "luxon";

const { dynamo: client } = getAwsClients();

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
  try {
    const {
      headers,
      queryStringParameters: { email = "" },
    } = parseRequest({ event, queryStringParametersSchema: candidateSchema });
    const authorizationHeader = headers["authorization"];
    const unauthorizedResponse = createResponse({ statusCode: 403, body: { message: "Forbidden" } });

    if (authorizationHeader === undefined) return unauthorizedResponse;

    const [authType, authValue] = authorizationHeader.split(" ");
    if (authType !== "Basic" || !authValue) return unauthorizedResponse;

    const [username, password] = atob(authValue).split(":");
    if (username !== "rachel" || password !== "bdad97cf-41a8-4f20-acf6-c1bd19896ae6") return unauthorizedResponse;

    const logs = await getLogsByEmail(client, email);
    const names = Array.from(
      new Set(
        logs.reduce<string[]>(
          (acc, { action, name }) => (action === "SUBMIT_RESUME_SUCCESS" && name ? [...acc, name] : acc),
          [],
        ),
      ),
    );
    const resumes = logs.reduce<string[]>(
      (acc, { action, file }) => (action === "SUBMIT_RESUME_SUCCESS" && file ? [...acc, file] : acc),
      [],
    );
    const numberOfAttempts = logs.length;
    const endTime = DateTime.fromISO(logs[numberOfAttempts - 1].timestamp);
    const startTime = DateTime.fromISO(logs[0].timestamp);
    const timeDiff = endTime.diff(startTime, ["hours", "minutes"]).toObject();
    const timeSpent = `${timeDiff.hours}h ${Math.floor(timeDiff.minutes ?? NaN)}m`;
    const formattedLogs = logs.map(({ action, file, ip, name, queryParams, requestBody, timestamp, userAgent }) => ({
      timestamp,
      action,
      name,
      isFileIncluded: Boolean(file),
      metadata: {
        ip,
        userAgent,
        body: {
          ...requestBody,
          ...(file ? { file: file.length > 20 ? "..." : file } : {}),
        },
        query: queryParams,
      },
    }));

    // await invokeLogV2({
    //   level: "info",
    //   category: "career",
    //   subCategory: "candidate",
    //   message: CareerLogMessage.GET_CANDIDATE_RECORDS,
    // });
    return createResponse({
      body: {
        email,
        names,
        resumes,
        numberOfAttempts,
        timeSpent,
        logs: formattedLogs,
      },
    });
  } catch (ex) {
    return handleError({ event, ex });
  }
}
