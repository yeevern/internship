import { type DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { z } from "zod";
import type { BaseItem, TableDef } from "./types";

function generateUpdateExpression(attributes: BaseItem) {
  const entries = Object.entries(attributes);
  if (entries.length === 0) throw new Error("Dynamo - No attributes to update");

  const expressions = entries.reduce<{
    setExpression: string;
    removeExpression: string;
    names: Record<string, string>;
    values: BaseItem;
  }>(
    (acc, [key, value]) => {
      if (typeof value === "undefined") {
        acc.removeExpression += `${acc.removeExpression === "" ? "REMOVE" : ","} #${key}`;
        acc.names[`#${key}`] = key;
      } else {
        acc.setExpression += `${acc.setExpression === "" ? "SET" : ","} #${key} = :${key}`;
        acc.names[`#${key}`] = key;
        acc.values[`:${key}`] = value;
      }
      return acc;
    },
    {
      setExpression: "",
      removeExpression: "",
      names: {},
      values: {},
    },
  );
  return {
    UpdateExpression: [expressions.setExpression, expressions.removeExpression].join(" ").trim(),
    ExpressionAttributeNames: expressions.names,
    ExpressionAttributeValues: expressions.values,
  };
}

export interface UpdateParams<
  Table extends TableDef,
  Item extends BaseItem,
  Schema extends z.ZodObject<Item> = z.ZodObject<Item>,
> {
  client: DynamoDBDocumentClient;
  table: Table;
  schema: Schema;
  attributes: Partial<z.infer<Schema>>;
  updateExpression?: string;
}

export async function update<Table extends TableDef, Item extends BaseItem>({
  attributes,
  client,
  schema,
  table,
  updateExpression,
}: UpdateParams<Table, Item>) {
  const { pk, sk } = table.primaryIndex;
  if (attributes[pk] === undefined) throw new TypeError(`Dynamo - "${pk}" is required`);
  if (sk && attributes[sk] === undefined) throw new TypeError(`Dynamo - "${sk}" is required`);

  const parsedKeys = schema.partial().safeParse({
    [pk]: attributes[pk],
    ...(sk ? { [sk]: attributes[sk] } : {}),
  });
  if (!parsedKeys.success) throw new TypeError("Dynamo - Keys do not match schema");

  const parsedAttributes = schema.partial().safeParse(
    Object.entries(attributes).reduce<BaseItem>((acc, [key, value]) => {
      if (key !== pk && key !== sk) acc[key] = value;
      return acc;
    }, {}),
  );
  if (!parsedAttributes.success) throw new TypeError("Dynamo - Attributes do not match schema");

  const expression = generateUpdateExpression(parsedAttributes.data);
  await client.send(
    new UpdateCommand({
      TableName: table.tableName,
      Key: parsedKeys.data,
      ...expression,
      UpdateExpression: updateExpression ?? expression.UpdateExpression,
    }),
  );
  return parsedAttributes.data;
}

// @TODO: put update history
