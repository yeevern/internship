import type { NativeAttributeValue } from "@aws-sdk/util-dynamodb";

export type BaseItem = Record<string, NativeAttributeValue>;

export interface TableDef<PrimaryKey extends string = string, IndexNames extends string = string> {
  tableName: string;
  primaryIndex: {
    pk: PrimaryKey;
    sk?: PrimaryKey;
  };
  secondaryIndexes: {
    name: IndexNames;
    pk: string;
    sk?: string;
  }[];
}

export interface DynamoSimplePrimaryKey {
  partitionKey: string;
}

export interface DynamoCompositePrimaryKey {
  partitionKey: string;
  sortKey: string;
}

export type DynamoPrimaryKey = DynamoSimplePrimaryKey | DynamoCompositePrimaryKey;

export type ExtractPrimaryKeys<T> = T extends {
  pk: infer PK extends string;
  sk?: infer SK extends string;
}
  ? SK extends undefined
    ? Record<PK, NativeAttributeValue>
    : Record<PK | SK, NativeAttributeValue>
  : never;
