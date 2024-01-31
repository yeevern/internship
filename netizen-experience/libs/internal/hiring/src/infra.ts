import { CfnOutput, RemovalPolicy, StackProps, aws_iam as iam } from "aws-cdk-lib";
import { AttributeType, BillingMode, Table, TableEncryption } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { StackWithContext } from "@netizen/utils-aws-cdk";

interface HiringStackProps extends StackProps {
  lightsailPolicy?: iam.Policy;
}

export class HiringStack extends StackWithContext {
  constructor(scope: Construct, id: string, props: HiringStackProps) {
    super(scope, id, props);

    // Setup candidates table
    const production = this.deploymentTarget === "production";
    const removalPolicy = production ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY;
    const candidatesTable = new Table(this, "candidates", {
      partitionKey: { name: "partition", type: AttributeType.STRING },
      sortKey: { name: "sort", type: AttributeType.STRING },
      encryption: TableEncryption.DEFAULT,
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy,
    });

    if (props.lightsailPolicy) {
      candidatesTable.grantReadWriteData(props.lightsailPolicy);
    }

    new CfnOutput(this, "candidatesTableName", { value: candidatesTable.tableName });
    new CfnOutput(this, "candidatesTableArn", { value: candidatesTable.tableArn });
  }
}
