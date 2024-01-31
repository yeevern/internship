import { RemovalPolicy, StackProps, aws_iam as iam } from "aws-cdk-lib";
import * as cdk from "aws-cdk-lib";
import { AttributeType, BillingMode, Table, TableEncryption } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { StackWithContext } from "@netizen/utils-aws-cdk";

export class SurveyStack extends StackWithContext {
  public iamStatements: iam.PolicyStatement[] = [];

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    // Setup table for survey stack
    const production = this.deploymentTarget === "production";
    const removalPolicy = production ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY;
    const tableModels = new Table(this, "models", {
      partitionKey: { name: "partition", type: AttributeType.STRING },
      sortKey: { name: "sort", type: AttributeType.STRING },
      encryption: TableEncryption.DEFAULT,
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy,
    });
    tableModels.addLocalSecondaryIndex({
      indexName: "modelIdLSI",
      sortKey: { name: "modelId", type: AttributeType.STRING },
    });
    tableModels.addGlobalSecondaryIndex({
      indexName: "modelIdGSI",
      partitionKey: { name: "modelId", type: AttributeType.STRING },
    });

    const tableSurveys = new Table(this, "surveys", {
      partitionKey: { name: "partition", type: AttributeType.STRING },
      sortKey: { name: "sort", type: AttributeType.STRING },
      encryption: TableEncryption.DEFAULT,
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy,
    });
    tableSurveys.addGlobalSecondaryIndex({
      indexName: "modelIdGSI",
      partitionKey: { name: "modelId", type: AttributeType.STRING },
      sortKey: { name: "sort", type: AttributeType.STRING },
    });
    tableSurveys.addGlobalSecondaryIndex({
      indexName: "statusGSI",
      partitionKey: { name: "status", type: AttributeType.STRING },
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
        resources: [`${tableModels.tableArn}*`],
      }),
    );
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
        resources: [`${tableSurveys.tableArn}*`],
      }),
    );

    new cdk.CfnOutput(this, "tableModels", {
      value: tableModels.tableName,
    });
    new cdk.CfnOutput(this, "tableArnModels", {
      value: tableModels.tableArn,
    });
    new cdk.CfnOutput(this, "tableSurveys", {
      value: tableSurveys.tableName,
    });
    new cdk.CfnOutput(this, "tableArnSurveys", {
      value: tableSurveys.tableArn,
    });
  }
}
