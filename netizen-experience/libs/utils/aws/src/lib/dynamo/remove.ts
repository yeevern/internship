import { DeleteCommand, type DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import type { ExtractPrimaryKeys, TableDef } from "./types";

export interface RemoveParams<Table extends TableDef> {
  client: DynamoDBDocumentClient;
  table: Table;
  keys: ExtractPrimaryKeys<Table["primaryIndex"]>;
}

export async function remove<Table extends TableDef>({ client, keys, table }: RemoveParams<Table>) {
  const { pk, sk } = table.primaryIndex;
  if (keys[pk] === undefined) throw new TypeError(`Dynamo - "${pk}" is required`);
  if (sk && keys[sk] === undefined) throw new TypeError(`Dynamo - "${sk}" is required`);

  await client.send(new DeleteCommand({ TableName: table.tableName, Key: keys }));
  return {};
}

// @TODO: add soft delete
