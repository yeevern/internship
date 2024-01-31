import { RemovalPolicy, aws_iam as iam, CfnOutput, Duration, StackProps } from "aws-cdk-lib";
import { AttributeType, BillingMode, Table, TableEncryption } from "aws-cdk-lib/aws-dynamodb";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { LambdaStackWithContext } from "@netizen/utils-aws-cdk";

export class PromptStack extends LambdaStackWithContext {
  public iamStatements: iam.PolicyStatement[] = [];

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, { ...props, srcPath: "libs/internal/prompt-hub/src" });

    const production = this.deploymentTarget === "production";
    const removalPolicy = production ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY;
    const tablePrompt = new Table(this, "prompt", {
      partitionKey: { name: "id", type: AttributeType.STRING },
      sortKey: { name: "sort", type: AttributeType.STRING },
      encryption: TableEncryption.DEFAULT,
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy,
    });

    // S3 setup
    const bucket = new s3.Bucket(this, "images", {
      intelligentTieringConfigurations: [
        {
          name: "smart-tiering",
          archiveAccessTierTime: Duration.days(90),
          deepArchiveAccessTierTime: Duration.days(180),
        },
      ],
    });

    const lambdas = this.createFunctions({
      dalleSaveHistory: { entry: "lambda/dalle/saveHistory.ts", timeout: Duration.minutes(2) },
    });

    Object.values(lambdas).forEach((lambda) => {
      lambda.addEnvironment("S3_PROMPT", bucket.bucketName);
      lambda.addEnvironment("DYNAMO_PROMPT", tablePrompt.tableName);
      bucket.grantReadWrite(lambda);
      tablePrompt.grantReadWriteData(lambda);
    });

    // this.iamPolicy = new iam.Policy(this, `${id}-policy`);
    // lambdas.dalleSaveHistory.grantInvoke(this.iamPolicy);
    // tablePrompt.grantReadWriteData(this.iamPolicy);
    // bucket.grantReadWrite(this.iamPolicy);
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
        resources: [tablePrompt.tableArn],
      }),
    );
    this.iamStatements.push(
      new iam.PolicyStatement({
        actions: ["s3:PutObject", "s3:GetObject"],
        resources: [bucket.bucketArn, `${bucket.bucketArn}/*`],
      }),
    );
    this.iamStatements.push(
      new iam.PolicyStatement({
        actions: ["lambda:InvokeFunction"],
        resources: [lambdas.dalleSaveHistory.functionArn],
      }),
    );

    new CfnOutput(this, "dalleSaveHistoryLambda", {
      value: lambdas.dalleSaveHistory.functionName,
    });

    new CfnOutput(this, "bucket", {
      value: bucket.bucketName,
    });
    new CfnOutput(this, "table", {
      value: tablePrompt.tableName,
    });
    new CfnOutput(this, "tableArn", {
      value: tablePrompt.tableArn,
    });
  }
}
