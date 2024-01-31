import { getAwsClients, createResponse, handleError, parseRequest } from "@netizen/utils-aws";
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import instructionSchema from "../schema/instruction.json";
import { getCareerConfigs } from "../configs";
import { logAttempt } from "../lib";

const { dynamo: client } = getAwsClients();

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
  try {
    const { body, queryStringParameters } = parseRequest({ event, queryStringParametersSchema: instructionSchema });
    const { email } = queryStringParameters;
    const { greeting, instruction } = (await getCareerConfigs()).settings.message;
    if (email) {
      await logAttempt(client, {
        email,
        action: "GET_INSTRUCTION",
        ...(body ? { requestBody: body } : {}),
        ...(queryStringParameters ? { queryParams: queryStringParameters } : {}),
        ip: event.requestContext.http.sourceIp,
        userAgent: event.requestContext.http.userAgent,
      });
      // await invokeLogV2({
      //   level: "info",
      //   category: "career",
      //   subCategory: "instruction",
      //   message: CareerLogMessage.GET_INSTRUCTION,
      // });
      return createResponse({ body: { message: instruction } });
    } else {
      // await invokeLogV2({
      //   level: "info",
      //   category: "career",
      //   subCategory: "instruction",
      //   message: CareerLogMessage.GET_GREETING,
      // });
      return createResponse({ body: { message: greeting } });
    }
  } catch (ex) {
    return handleError({ event, ex });
  }
}
