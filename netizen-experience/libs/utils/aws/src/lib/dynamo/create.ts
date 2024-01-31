import { type DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { z } from "zod";
import type { BaseItem, TableDef } from "./types";

export interface CreateParams<
  Table extends TableDef,
  Item extends BaseItem,
  Schema extends z.ZodType<Item> = z.ZodType<Item>,
> {
  client: DynamoDBDocumentClient;
  table: Table;
  schema: Schema;
  item: z.infer<Schema>;
}

export async function create<Table extends TableDef, Item extends BaseItem>({
  client,
  item,
  schema,
  table,
}: CreateParams<Table, Item>) {
  const parsedItem = schema.safeParse(item);
  if (!parsedItem.success) throw new TypeError("Dynamo - Item does not match schema");

  await client.send(new PutCommand({ TableName: table.tableName, Item: parsedItem.data }));
  return parsedItem.data;
}
