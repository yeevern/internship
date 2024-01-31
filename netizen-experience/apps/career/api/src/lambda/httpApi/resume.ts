import { getAwsClients, createResponse, handleError, parseRequest, LambdaValidationError } from "@netizen/utils-aws";
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { UploadResume, logAttempt, logResume, uploadResume } from "../lib";
import resumeSchema from "../schema/resume.json";
import { getCareerConfigs } from "../configs";

const { dynamo: dbClient, s3: s3Client } = getAwsClients();

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
  try {
    const { body, queryStringParameters } = parseRequest<UploadResume>({ event, schema: resumeSchema });
    const filePath = await uploadResume(s3Client, body);
    await logResume(dbClient, {
      email: body.email,
      name: body.name,
      filePath,
      requestBody: { ...body, file: body.file.substring(0, 150) },
      ...(Object.keys(queryStringParameters).length ? { queryParams: queryStringParameters } : {}),
      ip: event.requestContext.http.sourceIp,
      userAgent: event.requestContext.http.userAgent,
    });

    const { submitted: submittedMessage } = (await getCareerConfigs()).settings.message;
    // await invokeLogV2({
    //   level: "info",
    //   category: "career",
    //   subCategory: "resume",
    //   message: CareerLogMessage.SUBMIT_RESUME,
    // });
    return createResponse({ body: { message: submittedMessage } });
  } catch (ex) {
    if (ex instanceof LambdaValidationError && ex.data) {
      const { email, file, ...otherParams } = ex.data.body as UploadResume;
      if (typeof email === "string" && Boolean(email)) {
        const requestBody = { email, ...(file ? { file: file.substring(0, 150) } : {}), ...otherParams };
        await logAttempt(dbClient, {
          email,
          action: "SUBMIT_RESUME_FAILED",
          requestBody,
          ...(event.queryStringParameters ? { queryParams: event.queryStringParameters } : {}),
          ip: event.requestContext.http.sourceIp,
          userAgent: event.requestContext.http.userAgent,
        });
      }
    }
    return handleError({ event, ex });
  }
}
