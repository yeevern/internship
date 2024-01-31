import { ErrorObject, SchemaObject } from "ajv";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import { JsonValidationError } from "@netizen/utils-types";

export interface ParseRequestParams {
  request: Request;
  schema?: SchemaObject;
  queryStringParametersSchema?: SchemaObject;
}

export interface ParseRequestResponse<Type> {
  isBodyValidJson: boolean;
  body?: Type | string;
}

export async function parseApiRequest<Type>({
  queryStringParametersSchema,
  request,
  schema,
}: ParseRequestParams): Promise<ParseRequestResponse<Type>> {
  const { searchParams } = new URL(request.url);
  const query = searchParams;
  const parsed: ParseRequestResponse<Type> = { isBodyValidJson: false };
  if (request.body) {
    try {
      parsed.body = (await request.json()) as Type;
      parsed.isBodyValidJson = true;
    } catch (ex) {
      // Assign the raw body from res if not JSON
      parsed.body = await request.text();
    }
  }
  const ajvValidate = <T>(schema: SchemaObject, data: T): { valid: boolean; errors?: ErrorObject[] } => {
    const ajv = new Ajv2020({ allErrors: true });
    addFormats(ajv);
    const validate = ajv.compile(schema);
    const valid = validate(data);
    if (validate.errors) return { valid, errors: validate.errors };
    else return { valid: true };
  };

  let bodyValidation, queryStringParametersValidation;
  if (schema && parsed.isBodyValidJson) bodyValidation = ajvValidate(schema, parsed.body);
  if (queryStringParametersSchema) queryStringParametersValidation = ajvValidate(queryStringParametersSchema, query);

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
    if (!valid) throw new JsonValidationError("Input validation error", errors);
  }
  return parsed;
}

// export interface ParseRequestParams {
//   request: NextApiRequest;
//   schema?: SchemaObject;
//   queryStringParametersSchema?: SchemaObject;
// }

// export function parseApiRequest<Type>({
//   request,
//   schema,
//   queryStringParametersSchema,
// }: ParseRequestParams): ParseRequestResponse<Type> {
//   let body = {} as Type;
//   let isBodyValidJson = false;
//   const query = request.query;
//   if (request.body) {
//     try {
//       body = JSON.parse(request.body);
//       isBodyValidJson = true;
//     } catch (ex) {
//       // Assign the raw body from res if not JSON
//       body = request.body;
//     }
//   }
//   const ajvValidate = <T>(schema: SchemaObject, data: T): { valid: boolean; errors?: ErrorObject[] } => {
//     const ajv = new Ajv2020({ allErrors: true });
//     addFormats(ajv);
//     const validate = ajv.compile(schema);
//     const valid = validate(data);
//     if (validate.errors) return { valid, errors: validate.errors };
//     else return { valid: true };
//   };

//   let bodyValidation, queryStringParametersValidation;
//   if (schema && isBodyValidJson) bodyValidation = ajvValidate(schema, body);
//   if (queryStringParametersSchema) queryStringParametersValidation = ajvValidate(queryStringParametersSchema, query);

//   if (bodyValidation !== undefined || queryStringParametersValidation !== undefined) {
//     let valid = true;
//     let errors: ErrorObject[] = [];
//     if (bodyValidation) {
//       valid &&= bodyValidation.valid;
//       if (bodyValidation.errors) errors = [...errors, ...bodyValidation.errors];
//     }
//     if (queryStringParametersValidation) {
//       valid &&= queryStringParametersValidation.valid;
//       if (queryStringParametersValidation.errors) errors = [...errors, ...queryStringParametersValidation.errors];
//     }
//     if (!valid) throw new JsonValidationError("Input validation error", errors);
//   }
//   return {
//     headers: request.headers,
//     cookies: request.cookies,
//     body,
//     query,
//     isBodyValidJson,
//     http: {
//       sourceIp: request.socket.remoteAddress ?? "",
//       userAgent: request.headers["user-agent"] ?? "",
//     },
//   };
// }
