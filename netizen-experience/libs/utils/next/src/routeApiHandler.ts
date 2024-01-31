import { SchemaObject } from "ajv";
import { NextResponse } from "next/server";
import { JsonSerializableError, JsonValidationError, isTypeOf } from "@netizen/utils-types";
import { parseApiRequest } from "./parseApiRequest";

export interface RouteApiHandlerWithSchemaParams<Type> {
  schema: SchemaObject;
  queryStringParametersSchema?: SchemaObject;
  handler: (req: Type) => Promise<Response>;
}

export interface RouteApiHandlerParams<Type> {
  queryStringParametersSchema?: SchemaObject;
  handler: (req: Type) => Promise<Response>;
}

export interface RouteApiHandlerWithSchemaRequest<Type, Params> {
  request: Request;
  body: Type;
  params: Params;
}

export interface RouteApiHandlerRequest<Type, Params> {
  request: Request;
  body?: string | Type;
  params: Params;
}
export function routeApiHandler<Type, Params>(
  handlerParams: RouteApiHandlerParams<RouteApiHandlerRequest<Type, Params>>,
): (request: Request, params: { params: Params }) => Promise<Response> {
  return apiHandler(handlerParams);
}
export function routeApiHandlerWithSchema<Type, Params>(
  handlerParams: RouteApiHandlerWithSchemaParams<RouteApiHandlerWithSchemaRequest<Type, Params>>,
): (request: Request, params: { params: Params }) => Promise<Response> {
  return apiHandler(handlerParams);
}
function apiHandler<Type, Params>(
  handlerParams:
    | RouteApiHandlerWithSchemaParams<RouteApiHandlerWithSchemaRequest<Type, Params>>
    | RouteApiHandlerParams<RouteApiHandlerRequest<Type, Params>>,
) {
  return async (request: Request, params: { params: Params }): Promise<Response> => {
    try {
      if (
        isTypeOf<RouteApiHandlerWithSchemaParams<RouteApiHandlerWithSchemaRequest<Type, Params>>>(
          handlerParams,
          (value) => value.schema !== undefined,
        )
      ) {
        const { handler, queryStringParametersSchema, schema } = handlerParams;
        const body = (await parseApiRequest<Type>({ request, schema, queryStringParametersSchema })).body;
        if (body === undefined) throw new Error("API - No body provided");
        if (typeof body === "string") throw new Error("API - Invalid body provided");
        return await handler({ request, params: params.params, body });
      } else {
        const { handler, queryStringParametersSchema } = handlerParams;
        return await handler({
          request,
          params: params.params,
          body: (await parseApiRequest<Type>({ request, queryStringParametersSchema })).body,
        });
      }
    } catch (ex) {
      if (ex instanceof JsonSerializableError) return NextResponse.json(ex.toJson());
      if (ex instanceof Error) return NextResponse.json({ message: `API - ${ex.message}` });
      if (ex instanceof JsonValidationError)
        return NextResponse.json({ message: `API - ${ex.message}`, validation: ex.validation as unknown });
      return NextResponse.json({ message: `API - Unhandled error` });
    }
  };
}

// @TODO: Why is this not working?
// export function routeApiHandler<Type, Params>(
//   handlerParams: RouteApiHandlerParams<RouteApiHandlerRequest<Type, Params>>,
// ): (request: Request, params: { params: Params }) => Promise<Response>;
// export function routeApiHandler<Type, Params>(
//   handlerParams: RouteApiHandlerWithSchemaParams<RouteApiHandlerWithSchemaRequest<Type, Params>>,
// ): (request: Request, params: { params: Params }) => Promise<Response>;
// export function routeApiHandler<Type, Params>(
//   handlerParams:
//     | RouteApiHandlerWithSchemaParams<RouteApiHandlerWithSchemaRequest<Type, Params>>
//     | RouteApiHandlerParams<RouteApiHandlerRequest<Type, Params>>,
// ) {
//   return async (request: Request, params: { params: Params }): Promise<Response> => {
//     try {
//       if (
//         isTypeOf<RouteApiHandlerWithSchemaParams<RouteApiHandlerWithSchemaRequest<Type, Params>>>(
//           handlerParams,
//           (value) => value.schema !== undefined,
//         )
//       ) {
//         const { handler, schema, queryStringParametersSchema } = handlerParams;
//         const body = (await parseApiRequest<Type>({ request, schema, queryStringParametersSchema })).body;
//         if (body === undefined) throw new Error("API - No body provided");
//         if (typeof body === "string") throw new Error("API - Invalid body provided");
//         return await handler({ request, params: params.params, body });
//       } else {
//         const { handler, queryStringParametersSchema } = handlerParams;
//         return await handler({
//           request,
//           params: params.params,
//           body: (await parseApiRequest<Type>({ request, queryStringParametersSchema })).body,
//         });
//       }
//     } catch (ex) {
//       if (ex instanceof JsonSerializableError) return NextResponse.json(ex.toJson());
//       if (ex instanceof Error) return NextResponse.json({ message: `API - ${ex.message}` });
//       if (ex instanceof JsonValidationError)
//         return NextResponse.json({ message: `API - ${ex.message}`, validation: ex.validation });
//       return NextResponse.json({ message: `API - Unhandled error` });
//     }
//   };
// }
