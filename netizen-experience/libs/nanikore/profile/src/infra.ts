import { StackProps, RemovalPolicy, aws_iam as iam, CfnOutput } from "aws-cdk-lib";
import { AttributeType, BillingMode, Table, TableEncryption } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { StackWithContext } from "@netizen/utils-aws-cdk";

interface ProfileStackProps extends StackProps {
  lightsailPolicy?: iam.Policy;
}

export class ProfileStack extends StackWithContext {
  constructor(scope: Construct, id: string, props: ProfileStackProps) {
    super(scope, id, props);

    const tableProfile = new Table(this, "profiles", {
      partitionKey: { name: "userId", type: AttributeType.STRING },
      sortKey: { name: "sort", type: AttributeType.STRING },
      encryption: TableEncryption.DEFAULT,
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: this.deploymentTarget === "production" ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    });

    new CfnOutput(this, "tableProfiles", {
      value: tableProfile.tableName,
    });

    new CfnOutput(this, "tableArnProfiles", {
      value: tableProfile.tableArn,
    });

    const tableTransaction = new Table(this, "transactions", {
      partitionKey: { name: "userId", type: AttributeType.STRING },
      sortKey: { name: "transactionId", type: AttributeType.NUMBER },
      encryption: TableEncryption.DEFAULT,
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: this.deploymentTarget === "production" ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    });

    tableTransaction.addGlobalSecondaryIndex({
      indexName: "projectIdGSI",
      partitionKey: { name: "projectId", type: AttributeType.STRING },
    });

    if (props.lightsailPolicy) tableProfile.grantReadWriteData(props.lightsailPolicy);
  }
}
