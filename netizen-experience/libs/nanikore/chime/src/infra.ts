import { RemovalPolicy, StackProps, aws_iam as iam } from "aws-cdk-lib";
import * as cdk from "aws-cdk-lib";
import { AttributeType, BillingMode, Table, TableEncryption } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { StackWithContext } from "@netizen/utils-aws-cdk";

export class ChimeStack extends StackWithContext {
  public iamStatements: iam.PolicyStatement[] = [];

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const production = this.deploymentTarget === "production";
    const removalPolicy = production ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY;
    const tableChime = new Table(this, "chime", {
      partitionKey: { name: "sessionId", type: AttributeType.STRING },
      sortKey: { name: "sort", type: AttributeType.STRING },
      encryption: TableEncryption.DEFAULT,
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy,
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
        resources: [`${tableChime.tableArn}*`],
      }),
    );

    this.iamStatements.push(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "chime:CreateMeeting",
          "chime:DeleteMeeting",
          "chime:GetMeeting",
          "chime:ListMeetings",
          "chime:CreateAttendee",
          "chime:BatchCreateAttendee",
          "chime:DeleteAttendee",
          "chime:GetAttendee",
          "chime:ListAttendees",
        ],
        resources: ["*"],
      }),
    );

    new cdk.CfnOutput(this, "tableModel", {
      value: tableChime.tableName,
    });
    new cdk.CfnOutput(this, "tableArnModel", {
      value: tableChime.tableArn,
    });
  }
}
