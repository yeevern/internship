import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { z } from "zod";
import { PartialRecord, Stringable, isTypeOf } from "@netizen/utils-types";
import { batchWrite } from "./batch-write";
import { create } from "./create";
import { get } from "./get";
import { query } from "./query";
import { remove } from "./remove";
import type { BaseItem, DynamoCompositePrimaryKey, DynamoPrimaryKey, TableDef } from "./types";
import { update } from "./update";

export function defineTable<PrimaryKey extends string, IndexNames extends string>(
  config: TableDef<PrimaryKey, IndexNames>,
) {
  return config;
}

export function generatePrefixedKey<Prefix extends Stringable = string, Value extends Stringable = string>(
  prefix: Prefix,
  value: Value,
): `${Prefix}#${Value}` {
  return `${prefix}#${value}`;
}

// @TODO: better generics so return type can be inferred from provided "key"
export function parsePrefixedKey<Value extends string = string>(prefix: string, key: string) {
  const prefixComponent = `${prefix}#`;
  if (!key.startsWith(prefixComponent)) throw new Error(`Dynamo - "${prefix}" not found in "${key}"`);
  return key.replace(prefixComponent, "") as Value;
}

export interface DefineTableWithMethodsParams<IndexNames extends string> {
  client: DynamoDBDocumentClient;
  name: string;
  primaryKey: DynamoPrimaryKey;
  secondaryIndexes: Record<IndexNames, DynamoPrimaryKey>;
}

export function defineTableWithMethods<IndexNames extends string>(params: DefineTableWithMethodsParams<IndexNames>) {
  const indexes = Object.keys(params.secondaryIndexes) as (keyof typeof params.secondaryIndexes)[];
  const extractSortKey = (primaryKey: DynamoPrimaryKey) => {
    if (isTypeOf<DynamoCompositePrimaryKey>(primaryKey, (key) => key.sortKey !== undefined)) return primaryKey.sortKey;
    return undefined;
  };
  const table = defineTable({
    tableName: params.name,
    primaryIndex: {
      pk: params.primaryKey.partitionKey,
      sk: extractSortKey(params.primaryKey),
    },
    secondaryIndexes: indexes.map((index) => ({
      name: index,
      pk: params.secondaryIndexes[index].partitionKey,
      sk: extractSortKey(params.secondaryIndexes[index]),
    })),
  });
  const tableObject = {
    query: <Item extends BaseItem, Schema extends z.ZodType<Item> = z.ZodType<Item>>(
      p: Omit<Parameters<typeof query>[0], "table" | "client" | "schema"> & { schema: Schema },
    ) =>
      query({
        ...p,
        client: params.client,
        table,
        indexName: p.indexName as IndexNames, // @TODO: temporary solution until access to secondary indexes are fixed
      }) as Promise<z.infer<(typeof p)["schema"]>[]>,
    get: <Schema extends z.ZodType<BaseItem> = z.ZodType<BaseItem>>(
      p: Omit<Parameters<typeof get>[0], "table" | "client" | "schema"> & { schema: Schema },
    ) => get({ ...p, client: params.client, table }) as Promise<undefined | z.infer<(typeof p)["schema"]>>,
    batchWrite: (p: Omit<Parameters<typeof batchWrite>[0], "table" | "client">) =>
      batchWrite({ ...p, client: params.client, table }),
    create: (p: Omit<Parameters<typeof create>[0], "table" | "client">) =>
      create({ ...p, client: params.client, table }),
    remove: (p: Omit<Parameters<typeof remove>[0], "table" | "client">) =>
      remove({ ...p, client: params.client, table }),
    update: <AttributeNames extends string, Schema extends z.ZodObject<BaseItem> = z.ZodObject<BaseItem>>(p: {
      attributes: PartialRecord<AttributeNames, unknown>;
      schema: Schema;
    }) => {
      return update({ ...p, client: params.client, table }) as Promise<
        Pick<z.infer<(typeof p)["schema"]>, keyof (typeof p)["attributes"]>
      >;
    },
    ...indexes.reduce(
      (acc, index) => ({
        ...acc,
        [index]: {
          query: <Schema extends z.ZodType<BaseItem> = z.ZodType<BaseItem>>(
            p: Omit<Parameters<typeof query>[0], "table" | "client" | "schema"> & { schema: Schema },
          ) =>
            query({ ...p, client: params.client, table, indexName: index }) as Promise<z.infer<(typeof p)["schema"]>[]>,
        },
      }),
      {},
    ),
  };
  return tableObject;
}
