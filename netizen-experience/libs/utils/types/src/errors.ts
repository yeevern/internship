import type { ErrorObject } from "ajv";
import type { Jsonable } from "./types";

export enum GeneralErrorMessage {
  UNKNOWN_ERROR = "Unknown Error",
}

export interface ApiGatewayUnauthorizedResponse extends ErrorResponse {
  message: "Unauthorized";
}

export interface ErrorResponse {
  message: string;
}

export interface ErrorResponseWithValidation extends ErrorResponse {
  validation: ErrorObject[];
}

export class JsonSerializableError extends Error {
  public toJson() {
    return { message: this.message };
  }
}

export class JsonValidationError<type> extends JsonSerializableError {
  validation: type;

  constructor(message: string, validation: type) {
    super(message);
    this.validation = validation;
    Object.setPrototypeOf(this, JsonValidationError.prototype);
  }

  public override toJson() {
    return {
      ...super.toJson(),
      validation: this.validation,
    };
  }
}

export class BaseError extends Error {
  public readonly context?: Jsonable;
  public readonly code?: string | number;

  constructor(message: string, options: { code?: string | number; context?: Jsonable; cause?: Error } = {}) {
    const { cause, code, context } = options;
    super(message, { cause });
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
    this.code = code;
    this.context = context;
  }
}
