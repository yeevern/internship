import { BaseError, Jsonable } from "@netizen/utils-types";

export enum SurveyErrorMessage {
  GENERIC_ERROR,
  UNKNOWN,
  DYNAMO,
  S3,

  // Model (20000-20999)
  MODEL_META_NOT_FOUND,
  MODEL_ATTRIBUTE_NOT_FOUND,
  MODEL_ALREADY_EXISTS,
  MODEL_IS_INVALID,
  MODEL_IS_IN_USE,
  MODEL_ATTRIBUTE_IS_IN_USE,
  MODEL_TYPE_IS_INVALID,
  MODEL_META_CREATION_FAILED,
  MODEL_ATTRIBUTE_CREATION_FAILED,

  // Survey (21000-21999)
  SURVEY_NOT_FOUND,
  SURVEY_ALREADY_EXISTS,
  SURVEY_IS_INVALID,
  SURVEY_IS_IN_USE,
  SURVEY_CREATION_FAILED,

  // Form (22000-22999)
  SURVEY_FORM_ALREADY_INITIALIZED,
  NO_QUESTIONS_PROVIDED,
  MULTIPLE_ROOT_NODES,
  MISSING_NODE_DESTINATION,
  INVALID_NODE_DESTINATION,
  ROOT_NODE_CREATION_FAILED,
  ROOT_NODE_NOT_FOUND,
  BRANCH_NODE_CREATION_FAILED,
  BRANCH_NODE_NOT_FOUND,
  LEAF_NODE_CREATION_FAILED,
  LEAF_NODE_NOT_FOUND,
  QUESTION_CREATION_FAILED,
  QUESTION_NOT_FOUND,
}

export class SurveyLibError extends BaseError {
  constructor(message: string, options: { code?: SurveyErrorMessage; context?: Jsonable; cause?: Error } = {}) {
    super(`[Survey] ${message}`, options);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class SurveyError extends BaseError {
  constructor(message: string, options: { code?: SurveyErrorMessage; context?: Jsonable; cause?: Error } = {}) {
    super(message, options);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
