import { type DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { z } from "zod";
import type { TableDef, BaseItem } from "./types";

function generateQueryExpression<Table extends TableDef, Item extends BaseItem>({
  attributes,
  indexName,
  table,
}: {
  attributes: Partial<Item>;
  table: Table;
  indexName?: Table["secondaryIndexes"][number]["name"];
}) {
  let { pk, sk } = table.primaryIndex;
  if (indexName !== undefined) {
    const secondaryIndex = table.secondaryIndexes.find((i) => i.name === indexName);
    if (!secondaryIndex) throw new TypeError(`Dynamo - Index ${indexName} does not exist`);
    ({ pk, sk } = secondaryIndex);
  }

  if (attributes[pk] === undefined)
    throw new TypeError(`Dynamo - "${pk}" is required${indexName ? ` for index "${indexName}"` : ""}`);

  const ExpressionAttributeNames: Record<string, string> = {
    [`#${pk}`]: pk,
    ...(sk && attributes[sk] ? { [`#${sk}`]: sk } : {}),
  };
  const ExpressionAttributeValues: BaseItem = {
    [`:${pk}`]: attributes[pk],
    ...(sk && attributes[sk] ? { [`:${sk}`]: attributes[sk] } : {}),
  };
  const KeyConditionExpression = `#${pk} = :${pk}${sk && attributes[sk] ? ` AND #${sk} = :${sk}` : ""}`;
  const FilterExpression = Object.entries(attributes)
    .reduce<string[]>((conditions, [key, value]) => {
      if (key !== pk && key !== sk) {
        ExpressionAttributeNames[`#${key}`] = key;
        ExpressionAttributeValues[`:${key}`] = value;
        conditions.push(`#${key} = :${key}`);
      }
      return conditions;
    }, [])
    .join(" AND ");

  return {
    ExpressionAttributeValues,
    ExpressionAttributeNames,
    KeyConditionExpression,
    ...(FilterExpression ? { FilterExpression } : {}),
  };
}

export interface QueryParams<
  Table extends TableDef,
  Item extends BaseItem,
  Schema extends z.ZodType<Item> = z.ZodType<Item>,
> {
  client: DynamoDBDocumentClient;
  table: Table;
  schema: Schema;
  indexName?: Table["secondaryIndexes"][number]["name"];
  attributes: Partial<Item>;
  keyConditionExpression?: string;
  filterExpression?: string;
  order?: "ascending" | "descending";
  limit?: number;
  cursor?: BaseItem;
}

export async function query<Table extends TableDef, Item extends BaseItem>(params: QueryParams<Table, Item>) {
  const {
    attributes,
    client,
    cursor,
    filterExpression,
    indexName,
    keyConditionExpression,
    limit,
    order,
    schema,
    table,
  } = params;
  const expression = generateQueryExpression<Table, Item>({ table, indexName, attributes });
  const command = {
    TableName: table.tableName,
    IndexName: indexName,
    ...expression,
    KeyConditionExpression: keyConditionExpression ?? expression.KeyConditionExpression,
    FilterExpression: filterExpression ?? expression.FilterExpression,
    ScanIndexForward: order === undefined ? undefined : order === "descending" ? false : true,
    Limit: limit,
    ExclusiveStartKey: cursor,
  };
  // @TODO: handle error if send command fails
  const result = await client.send(new QueryCommand(command));

  const parsedResult = schema.array().safeParse(result.Items ?? []);
  if (!parsedResult.success) throw new TypeError("Dynamo - Query result does not match schema");

  let items = parsedResult.data;
  if (result.LastEvaluatedKey)
    items = [...items, ...(await query<Table, Item>({ ...params, cursor: result.LastEvaluatedKey }))];
  return items;
}
