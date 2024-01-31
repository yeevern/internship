import { type DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { z } from "zod";
import type { BaseItem, ExtractPrimaryKeys, TableDef } from "./types";

export interface GetParams<
  Table extends TableDef,
  Item extends BaseItem,
  Schema extends z.ZodType<Item> = z.ZodType<Item>,
> {
  client: DynamoDBDocumentClient;
  table: Table;
  schema: Schema;
  keys: ExtractPrimaryKeys<Table["primaryIndex"]>;
}

export async function get<Table extends TableDef, Item extends BaseItem>({
  client,
  keys,
  schema,
  table,
}: GetParams<Table, Item>) {
  const { pk, sk } = table.primaryIndex;
  if (keys[pk] === undefined) throw new TypeError(`Dynamo - "${pk}" is required`);
  if (sk && keys[sk] === undefined) throw new TypeError(`Dynamo - "${sk}" is required`);

  const { Item: item } = await client.send(new GetCommand({ TableName: table.tableName, Key: keys }));
  if (item === undefined) return undefined;

  const parsedItem = schema.safeParse(item);
  if (!parsedItem.success) throw new TypeError("Dynamo - Query result does not match schema");

  return parsedItem.data;
}
