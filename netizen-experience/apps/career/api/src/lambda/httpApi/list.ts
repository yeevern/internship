import { getAwsClients, createResponse, handleError, parseRequest } from "@netizen/utils-aws";
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import listSchema from "../schema/list.json";
import { getLogsByDate } from "../lib";

const clients = getAwsClients();

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
  try {
    const {
      headers,
      queryStringParameters: { date },
    } = parseRequest({ event, queryStringParametersSchema: listSchema });
    const authorizationHeader = headers["authorization"];
    const unauthorizedResponse = createResponse({ statusCode: 403, body: { message: "Forbidden" } });

    if (authorizationHeader === undefined) return unauthorizedResponse;

    const [authType, authValue] = authorizationHeader.split(" ");
    if (authType !== "Basic" || !authValue) return unauthorizedResponse;

    const [username, password] = atob(authValue).split(":");
    if (username !== "rachel" || password !== "bdad97cf-41a8-4f20-acf6-c1bd19896ae6") return unauthorizedResponse;

    const records = await getLogsByDate(clients.dynamo, date);
    // await invokeLogV2({
    //   level: "info",
    //   category: "career",
    //   subCategory: "list",
    //   message: CareerLogMessage.LIST_RECORDS,
    // });
    return createResponse({ body: records });
  } catch (ex) {
    return handleError({ event, ex });
  }
}
