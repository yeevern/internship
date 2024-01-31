import { BatchWriteCommand, DynamoDBDocumentClient, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { NativeAttributeValue } from "@aws-sdk/util-dynamodb";
import type { PartialRecord } from "@netizen/utils-types";

export function generateUpdateExpression(value: Record<string, NativeAttributeValue>) {
  const keys = Object.keys(value);
  const ExpressionAttributeNames: Record<string, string> = {};
  const ExpressionAttributeValues: Record<string, NativeAttributeValue> = {};
  const updateExpressions: string[] = [];
  if (keys.length > 0) {
    keys.forEach((key) => {
      if (value[key] !== undefined) {
        ExpressionAttributeNames[`#${key}`] = key;
        ExpressionAttributeValues[`:${key}`] = value[key];
        updateExpressions.push(`#${key} = :${key}`);
      }
    });
  }
  const UpdateExpression = `set ${updateExpressions.join(", ")}`;
  return {
    UpdateExpression,
    ExpressionAttributeValues,
    ExpressionAttributeNames,
  };
}

export function generateQueryExpression(
  keyCondition: Record<string, NativeAttributeValue>,
  filters?: Record<string, NativeAttributeValue>,
) {
  const ExpressionAttributeNames: Record<string, string> = {};
  const ExpressionAttributeValues: Record<string, NativeAttributeValue> = {};
  const KeyConditionExpression = Object.entries(keyCondition)
    .reduce<string[]>((conditions, [key, value]) => {
      if (value !== undefined) {
        ExpressionAttributeNames[`#${key}`] = key;
        ExpressionAttributeValues[`:${key}`] = value;
        conditions.push(`#${key} = :${key}`);
      }
      return conditions;
    }, [])
    .join(" AND ");
  let FilterExpression = "";
  if (filters)
    FilterExpression = Object.entries(filters)
      .reduce<string[]>((filters, [key, value]) => {
        if (value !== undefined) {
          ExpressionAttributeNames[`#${key}`] = key;
          ExpressionAttributeValues[`:${key}`] = value;
          filters.push(`#${key} = :${key}`);
        }
        return filters;
      }, [])
      .join(" AND ");
  return {
    KeyConditionExpression,
    ExpressionAttributeValues,
    ExpressionAttributeNames,
    ...(FilterExpression ? { FilterExpression } : {}),
  };
}

type QueryAllParams<Type extends Record<string, NativeAttributeValue>> = {
  client: DynamoDBDocumentClient;
  tableName: string;
  indexName?: string;
  exclusiveStartKey?: Record<string, NativeAttributeValue>;
  order?: "ascending" | "descending";
  limit?: number;
} & (
  | {
      keys: Partial<Type>;
      filters?: Partial<Type>;
      keyConditionExpression?: never;
      expressionAttributeNames?: never;
      expressionAttributeValues?: never;
      filterExpression?: never;
    }
  | {
      keys?: never;
      filters?: never;
      keyConditionExpression: string;
      expressionAttributeNames?: Record<string, string>;
      expressionAttributeValues: Record<string, NativeAttributeValue>;
      filterExpression?: string;
    }
);

export async function queryAll<Type extends Record<string, NativeAttributeValue>>(params: QueryAllParams<Type>) {
  const {
    client,
    exclusiveStartKey: ExclusiveStartKey,
    expressionAttributeNames: ExpressionAttributeNames,
    expressionAttributeValues: ExpressionAttributeValues,
    filterExpression: FilterExpression,
    filters,
    indexName: IndexName,
    keyConditionExpression: KeyConditionExpression,
    keys,
    limit,
    order,
    tableName: TableName,
  } = params;
  const command = {
    TableName,
    IndexName,
    ...(keys
      ? generateQueryExpression(keys, filters)
      : {
          KeyConditionExpression,
          ExpressionAttributeNames,
          ExpressionAttributeValues,
          FilterExpression,
        }),
    ScanIndexForward: order === undefined ? undefined : order === "descending" ? false : true,
    Limit: limit,
    ExclusiveStartKey,
  };
  const result = await client.send(new QueryCommand(command));
  let items: Type[] = (result.Items as Type[]) ?? [];
  if (result.LastEvaluatedKey)
    items = [...items, ...(await queryAll<Type>({ ...params, exclusiveStartKey: result.LastEvaluatedKey }))];
  return items;
}

export async function getItem<Type>(params: {
  client: DynamoDBDocumentClient;
  tableName: string;
  keys: PartialRecord<keyof Type, NativeAttributeValue>;
}) {
  const { client, keys: Key, tableName: TableName } = params;
  const result = await client.send(new GetCommand({ TableName, Key }));
  if (result.Item) return result.Item as Type;
  return null;
}

interface BatchWriteItemsParams<Type extends Record<string, NativeAttributeValue>> {
  client: DynamoDBDocumentClient;
  tableName: string;
  items: Type[];
}

export async function batchWriteItems<Type extends Record<string, NativeAttributeValue>>({
  client,
  items,
  tableName,
}: BatchWriteItemsParams<Type>) {
  await Promise.all(
    items
      .reduce<Type[][]>((requests, item, index) => {
        if (index % 25 === 0) requests.push([]);
        requests[requests.length - 1].push(item);
        return requests;
      }, [])
      .map(
        (requests) =>
          new BatchWriteCommand({
            RequestItems: {
              [tableName]: requests.map((Item) => ({
                PutRequest: { Item },
              })),
            },
          }),
      )
      .map((command) => client.send(command)),
  );
}

interface BatchDeleteItemsParams<Type extends Record<string, NativeAttributeValue>> {
  client: DynamoDBDocumentClient;
  tableName: string;
  keys: Type[];
}

export async function batchDeleteItems<Type extends Record<string, NativeAttributeValue>>({
  client,
  keys,
  tableName,
}: BatchDeleteItemsParams<Type>) {
  await Promise.all(
    keys
      .reduce<Type[][]>((requests, key, index) => {
        if (index % 25 === 0) requests.push([]);
        requests[requests.length - 1].push(key);
        return requests;
      }, [])
      .map(
        (requests) =>
          new BatchWriteCommand({
            RequestItems: {
              [tableName]: requests.map((Key) => ({
                DeleteRequest: { Key },
              })),
            },
          }),
      )
      .map((command) => client.send(command)),
  );
}
