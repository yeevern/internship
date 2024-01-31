export { getAwsClients, getAwsCredentials } from "./lib/clients";
export { type BatchItemParams } from "./lib/dynamo/batch-write";
export { defineTableWithMethods, generatePrefixedKey, parsePrefixedKey } from "./lib/dynamo/utils";
export * from "./lib/lambda";
export { defineBucket } from "./lib/s3/utils";

// Deprecated exports, to be removed once all projects have migrate to `defineTableWithMethods`
export * from "./lib/dynamo";
export {
  /** @deprecated Use `BatchItemParams` instead */
  type BatchItemParams as UNSAFE__BatchItemParams,
  /** @deprecated Use table methods with `defineTableWithMethods` instead */
  batchWrite as unsafe__batchWrite,
} from "./lib/dynamo/batch-write";
export {
  /** @deprecated Use table methods with `defineTableWithMethods` instead */
  create as unsafe__create,
} from "./lib/dynamo/create";
export {
  /** @deprecated Use table methods with `defineTableWithMethods` instead */
  get as unsafe__get,
} from "./lib/dynamo/get";
export {
  /** @deprecated Use table methods with `defineTableWithMethods` instead */
  defineTable,
} from "./lib/dynamo/utils";
export {
  /** @deprecated Use table methods with `defineTableWithMethods` instead */
  query as unsafe__query,
} from "./lib/dynamo/query";
export {
  /** @deprecated Use table methods with `defineTableWithMethods` instead */
  remove as unsafe__remove,
} from "./lib/dynamo/remove";
export {
  /** @deprecated Use table methods with `defineTableWithMethods` instead */
  update as unsafe__update,
} from "./lib/dynamo/update";
export {
  /** @deprecated Use `defineBucket` instead */
  defineBucket as defineS3,
} from "./lib/s3/utils";
