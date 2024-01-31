import { RemovalPolicy, StackProps, aws_iam as iam } from "aws-cdk-lib";
import * as cdk from "aws-cdk-lib";
import { AttributeType, BillingMode, Table, TableEncryption } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { StackWithContext } from "@netizen/utils-aws-cdk";

export class EventStack extends StackWithContext {
  public iamStatements: iam.PolicyStatement[] = [];

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    // Setup table for survey stack
    const production = this.deploymentTarget === "production";
    const removalPolicy = production ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY;
    const tableEvents = new Table(this, "events", {
      partitionKey: { name: "projectId", type: AttributeType.STRING },
      sortKey: { name: "sort", type: AttributeType.STRING },
      encryption: TableEncryption.DEFAULT,
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy,
    });
    tableEvents.addLocalSecondaryIndex({
      indexName: "userIdLSI",
      sortKey: { name: "userId", type: AttributeType.STRING },
    });
    tableEvents.addGlobalSecondaryIndex({
      indexName: "metaGSI",
      partitionKey: { name: "sort", type: AttributeType.STRING },
      sortKey: { name: "createdAt", type: AttributeType.NUMBER },
    });

    this.iamStatements.push(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "dynamodb:PutItem",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:GetItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:BatchWriteItem",
          "dynamodb:BatchGetItem",
          "dynamodb:DescribeTable",
        ],
        resources: [`${tableEvents.tableArn}*`],
      }),
    );

    new cdk.CfnOutput(this, "tableModel", {
      value: tableEvents.tableName,
    });
    new cdk.CfnOutput(this, "tableArnModel", {
      value: tableEvents.tableArn,
    });
  }
}
