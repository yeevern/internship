import { getAwsClients } from "../clients";
import { defineTableWithMethods } from "./utils";

describe("dynamo utils test", () => {
  it("Define table", () => {
    const { dynamo: client } = getAwsClients();
    const table = defineTableWithMethods({
      client,
      name: "tableName",
      primaryKey: { partitionKey: "randomPK", sortKey: "randomSK" },
      secondaryIndexes: {
        indexName1: { partitionKey: "randomPK", sortKey: "randomSK" },
        indexName2: { partitionKey: "randomPK", sortKey: "randomSK" },
      },
    });
    expect(table.get).toBeDefined();
    expect(table.query).toBeDefined();
    expect(table.batchWrite).toBeDefined();
    expect(table.create).toBeDefined();
    expect(table.update).toBeDefined();

    expect(table.indexName1.get).toBeDefined();
    expect(table.indexName1.query).toBeDefined();
    expect(table.indexName1.batchWrite).toBeDefined();
    expect(table.indexName1.create).toBeDefined();
    expect(table.indexName1.update).toBeDefined();

    expect(table.indexName2.get).toBeDefined();
    expect(table.indexName2.query).toBeDefined();
    expect(table.indexName2.batchWrite).toBeDefined();
    expect(table.indexName2.create).toBeDefined();
    expect(table.indexName2.update).toBeDefined();
  });
});
