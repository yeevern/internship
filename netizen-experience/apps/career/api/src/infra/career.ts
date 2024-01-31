import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { LambdaStackWithContext } from "@netizen/utils-aws-cdk";
import * as apiGateway from "@aws-cdk/aws-apigatewayv2-alpha";
import * as dynamo from "aws-cdk-lib/aws-dynamodb";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import _ from "lodash";

export class CareerStack extends LambdaStackWithContext {
  constructor(scope: Construct, id: string) {
    super(scope, id, { srcPath: "apps/career/api/src" });

    // S3 setup
    const bucket = new s3.Bucket(this, "career");

    // Table setup
    const table = new dynamo.Table(this, "careerLogs", {
      partitionKey: { name: "email", type: dynamo.AttributeType.STRING },
      sortKey: { name: "timestamp", type: dynamo.AttributeType.STRING },
      encryption: dynamo.TableEncryption.DEFAULT,
      billingMode: dynamo.BillingMode.PAY_PER_REQUEST,
      removalPolicy: this.removalPolicy,
    });
    table.addGlobalSecondaryIndex({
      indexName: "dateGSI",
      partitionKey: { name: "date", type: dynamo.AttributeType.STRING },
    });

    // Lambda
    const lambdas = this.createFunctions({
      getRecords: { entry: "lambda/httpApi/list.ts" },
      getCandidate: { entry: "lambda/httpApi/candidate.ts" },
      getInstruction: { entry: "lambda/httpApi/instruction.ts" },
      uploadResume: { entry: "lambda/httpApi/resume.ts" },
    });
    _.forIn(lambdas, (lambda) => {
      bucket.grantReadWrite(lambda);
      lambda.addEnvironment("BUCKET_CAREER", bucket.bucketName);

      table.grantReadWriteData(lambda);
      lambda.addEnvironment("TABLE_CAREER_LOGS", table.tableName);
    });

    // API Gateway
    const httpApi = new apiGateway.HttpApi(this, `career-http-api-${this.deploymentTarget}`, {
      corsPreflight: {
        allowHeaders: ["x-amz-date", "x-amz-security-token", "x-amz-user-agent", "x-api-key", "content-type"],
        allowMethods: [apiGateway.CorsHttpMethod.GET, apiGateway.CorsHttpMethod.POST],
        allowOrigins: this.context.restApi.cors,
        maxAge: cdk.Duration.seconds(0),
        allowCredentials: true,
      },
    });
    httpApi.addRoutes({
      path: "/list",
      methods: [apiGateway.HttpMethod.GET],
      integration: new HttpLambdaIntegration("getRecords", lambdas.getRecords),
    });
    httpApi.addRoutes({
      path: "/candidate",
      methods: [apiGateway.HttpMethod.GET],
      integration: new HttpLambdaIntegration("getCandidate", lambdas.getCandidate),
    });
    httpApi.addRoutes({
      path: "/resume",
      methods: [apiGateway.HttpMethod.GET],
      integration: new HttpLambdaIntegration("getInstruction", lambdas.getInstruction),
    });
    httpApi.addRoutes({
      path: "/resume",
      methods: [apiGateway.HttpMethod.POST],
      integration: new HttpLambdaIntegration("uploadResume", lambdas.uploadResume),
    });
  }
}
