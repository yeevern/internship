import { ErrorObject, SchemaObject } from "ajv";
import Ajv2020 from "ajv/dist/2020";
import addErrors from "ajv-errors";
import addFormats from "ajv-formats";
import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";

export interface ParseRequestResponse<type> {
  headers: Record<string, string | undefined>;
  body: type;
  isBodyValidJson: boolean;
  cookies: Record<string, string | undefined>;
  queryStringParameters: Record<string, string | undefined>;
}

export interface ParseRequestParams {
  event: APIGatewayProxyEventV2;
  schema?: SchemaObject;
  queryStringParametersSchema?: SchemaObject;
}

interface LambdaValidationErrorData<type> {
  body?: type;
  queryStringParameters?: Record<string, string | undefined>;
}

export class LambdaValidationError<type, dataType> extends Error {
  validation: type;
  data?: LambdaValidationErrorData<dataType>;

  constructor(message: string, validation: type, data?: LambdaValidationErrorData<dataType>) {
    super(message);
    this.validation = validation;
    this.data = data;
    Object.setPrototypeOf(this, LambdaValidationError.prototype);
  }
}

export function parseCookies(cookiesArray: string[]): Record<string, string | undefined> {
  const cookies: Record<string, string | undefined> = {};
  cookiesArray.map((cookie) => {
    const [key, value] = cookie.split("=");
    cookies[key] = value;
  });
  return cookies;
}

/**
 * Parse API Gateway 2.0 integration request obtaining header, body and cookies.
 * Conduct validation of body if JSON schema is passed in.
 * @param params Request params - event and schema
 * @returns Parsed request
 */
export function parseRequest<type>(params: ParseRequestParams): ParseRequestResponse<type> {
  let body = {} as type;
  let isBodyValidJson = false;
  let cookies: Record<string, string | undefined> = {};
  const queryStringParameters: Record<string, string | undefined> = {};
  const { event, queryStringParametersSchema, schema } = params;
  if (event.body) {
    try {
      body = JSON.parse(event.body) as type;
      isBodyValidJson = true;
    } catch (ex) {
      console.error(ex);
    }
  }
  if (event.cookies) {
    cookies = parseCookies(event.cookies);
  }
  const queries = event.queryStringParameters;
  if (queries) {
    const keys = Object.keys(queries);
    keys.map((key) => {
      const value = queries[key];
      if (value) queryStringParameters[key] = decodeURI(value);
    });
  }
  let bodyValidation, queryStringParametersValidation;

  const ajvValidate = <type>(schema: SchemaObject, data: type): { valid: boolean; errors?: ErrorObject[] } => {
    const ajv = new Ajv2020({ allErrors: true });
    addFormats(ajv);
    addErrors(ajv);
    const validate = ajv.compile(schema);
    const valid = validate(data);
    if (validate.errors) return { valid, errors: validate.errors };
    else return { valid: true };
  };
  if (schema) bodyValidation = ajvValidate(schema, body);
  if (queryStringParametersSchema)
    queryStringParametersValidation = ajvValidate(queryStringParametersSchema, queryStringParameters);

  if (bodyValidation !== undefined || queryStringParametersValidation !== undefined) {
    let valid = true;
    let errors: ErrorObject[] = [];
    if (bodyValidation) {
      valid &&= bodyValidation.valid;
      if (bodyValidation.errors) errors = [...errors, ...bodyValidation.errors];
    }
    if (queryStringParametersValidation) {
      valid &&= queryStringParametersValidation.valid;
      if (queryStringParametersValidation.errors) errors = [...errors, ...queryStringParametersValidation.errors];
    }
    if (!valid) throw new LambdaValidationError("Input validation error", errors, { body, queryStringParameters });
  }
  return {
    headers: event.headers,
    body,
    cookies,
    queryStringParameters,
    isBodyValidJson,
  };
}

export interface CreateResponseParams<type> {
  body: type | string;
  headers?: Record<string, string>;
  cookies?: string[];
  statusCode?: number;
  isBase64Encoded?: boolean;
}

export function createResponse<type>(params: CreateResponseParams<type>): APIGatewayProxyStructuredResultV2 {
  return {
    statusCode: params.statusCode ?? 200,
    headers: {
      "Content-Type": "application/json",
      ...(params.headers ? params.headers : {}),
    },
    cookies: params.cookies ?? [],
    isBase64Encoded: params.isBase64Encoded ? true : false,
    body: typeof params.body === "string" ? params.body : JSON.stringify(params.body),
  };
}

export function handleError<type>(params: {
  event: APIGatewayProxyEventV2;
  ex: type;
}): APIGatewayProxyStructuredResultV2 {
  const { ex } = params;
  console.error(ex);
  if (ex instanceof LambdaValidationError) {
    return createResponse({
      body: { error: ex.message, validation: ex.validation as unknown },
    });
  } else {
    if (ex instanceof Error) {
      return createResponse({
        body: { error: ex.message },
      });
    } else {
      return createResponse({
        body: { error: `Unknown error - ${JSON.stringify(ex)}` },
      });
    }
  }
}
