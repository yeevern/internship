import { RemovalPolicy, StackProps, aws_iam as iam } from "aws-cdk-lib";
import * as cdk from "aws-cdk-lib";
import { AttributeType, BillingMode, Table, TableEncryption } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { StackWithContext } from "@netizen/utils-aws-cdk";

export class ProjectStack extends StackWithContext {
  public iamStatements: iam.PolicyStatement[] = [];

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    // Setup table for project stack
    const production = this.deploymentTarget === "production";
    const removalPolicy = production ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY;
    const tableProjects = new Table(this, "projects", {
      partitionKey: { name: "partition", type: AttributeType.STRING },
      sortKey: { name: "sort", type: AttributeType.STRING },
      encryption: TableEncryption.DEFAULT,
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy,
    });
    tableProjects.addLocalSecondaryIndex({
      indexName: "eventIdLSI",
      sortKey: { name: "eventId", type: AttributeType.STRING },
    });
    tableProjects.addGlobalSecondaryIndex({
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
        resources: [`${tableProjects.tableArn}*`],
      }),
    );

    new cdk.CfnOutput(this, "tableProjects", {
      value: tableProjects.tableName,
    });
    new cdk.CfnOutput(this, "tableArnProjects", {
      value: tableProjects.tableArn,
    });
  }
}
