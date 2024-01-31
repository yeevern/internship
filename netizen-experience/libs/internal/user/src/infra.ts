import { RemovalPolicy, StackProps, aws_iam as iam, CfnOutput } from "aws-cdk-lib";
import { AttributeType, BillingMode, Table, TableEncryption } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { StackWithContext } from "@netizen/utils-aws-cdk";

export class UserStack extends StackWithContext {
  public iamStatements: iam.PolicyStatement[] = [];

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const production = this.deploymentTarget === "production";
    const removalPolicy = production ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY;
    const tableUser = new Table(this, "user", {
      partitionKey: { name: "id", type: AttributeType.STRING },
      sortKey: { name: "sort", type: AttributeType.STRING },
      encryption: TableEncryption.DEFAULT,
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy,
    });

    this.iamStatements.push(
      new iam.PolicyStatement({
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
        resources: [tableUser.tableArn],
      }),
    );

    new CfnOutput(this, "table", {
      value: tableUser.tableName,
    });
    new CfnOutput(this, "tableArn", {
      value: tableUser.tableArn,
    });
  }
}
