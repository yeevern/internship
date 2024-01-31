import { BatchWriteCommand, type DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import type { NativeAttributeValue } from "@aws-sdk/util-dynamodb";
import { z } from "zod";
import { ExtractPrimaryKeys, TableDef } from "./types";

type RequestType = "put" | "delete";

// @TODO: generics for every element in the array (ref: https://stackoverflow.com/a/72517827)
interface BatchItemPutParams {
  type?: Extract<RequestType, "put">;
  schema: z.Schema;
  data: Record<string, NativeAttributeValue>;
}

interface BatchItemDeleteParams<Table extends TableDef = TableDef> {
  type: Extract<RequestType, "delete">;
  key: ExtractPrimaryKeys<Table["primaryIndex"]>;
}

export type BatchItemParams<Table extends TableDef = TableDef> = { type?: RequestType } & (
  | BatchItemPutParams
  | BatchItemDeleteParams<Table>
);

export interface BatchWriteParams<Table extends TableDef = TableDef> {
  client: DynamoDBDocumentClient;
  table: Table;
  items: BatchItemParams<Table>[];
}

export async function batchWrite<Table extends TableDef>({ client, items, table }: BatchWriteParams<Table>) {
  await Promise.all(
    items // @TODO: should be parsedItems.data
      .reduce<BatchItemParams<Table>[][]>((requests, item, index) => {
        if (index % 25 === 0) requests.push([]);
        requests[requests.length - 1].push(item);
        return requests;
      }, [])
      .map(
        (requests) =>
          new BatchWriteCommand({
            RequestItems: {
              [table.tableName]: requests.map((request) => {
                if (request.type === "delete") {
                  const { pk, sk } = table.primaryIndex;
                  if (request.key[pk] === undefined) throw new TypeError(`Dynamo - "${pk}" is required`);
                  if (sk && request.key[sk] === undefined) throw new TypeError(`Dynamo - "${sk}" is required`);
                  return { DeleteRequest: { Key: request.key } };
                } else {
                  const parsedData = request.schema.safeParse(request.data);
                  if (!parsedData.success) throw new TypeError("Dynamo - Item does not match schema");
                  return { PutRequest: { Item: parsedData.data } };
                }
              }),
            },
          }),
      )
      .map((command) => client.send(command)),
  );
  return {};
}
