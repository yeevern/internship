import * as path from "path";
import { cwd } from "process";
import { App, Stack, StackProps, CfnOutput } from "aws-cdk-lib";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3_deployment from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";

// To ensure that it is targetting the correct account and region
const region = "ap-southeast-1";
const account = "383533471768";

class StorybookStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const bucket = new s3.Bucket(this, `${id}-bucket`, { accessControl: s3.BucketAccessControl.PRIVATE });
    new s3_deployment.BucketDeployment(this, `${id}-bucketDeployment`, {
      destinationBucket: bucket,
      sources: [s3_deployment.Source.asset(path.resolve(cwd(), "../../dist/storybook/ui"))],
    });
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, "OriginAccessIdentity");
    bucket.grantRead(originAccessIdentity);
    const distribution = new cloudfront.Distribution(this, `${id}-distribution`, {
      defaultRootObject: "index.html",
      defaultBehavior: {
        origin: new origins.S3Origin(bucket, { originAccessIdentity }),
      },
    });
    new CfnOutput(this, "bucket-name", {
      value: bucket.bucketName,
    });
    new CfnOutput(this, "distribution-domain-name", {
      value: distribution.distributionDomainName,
    });
  }
}

const app = new App();
new StorybookStack(app, "storybook", { env: { account, region } });
