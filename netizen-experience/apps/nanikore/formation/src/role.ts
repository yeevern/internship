import { CfnOutput, StackProps } from "aws-cdk-lib";
import { Effect, ManagedPolicy, Policy, PolicyStatement, User } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { StackWithContext } from "@netizen/utils-aws-cdk";

export class RoleStack extends StackWithContext {
  policy: Policy;
  managedPolicy: ManagedPolicy;

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);
    this.policy = new Policy(this, `${id}-policy`);
    const user = new User(this, `${id}-user`);
    user.attachInlinePolicy(this.policy);
    this.managedPolicy = new ManagedPolicy(this, `${id}-managed-policy`, {
      statements: [],
    });

    const generalStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["s3:ListBucket", "dynamodb:ListTables"],
      resources: ["*"],
    });
    this.policy.addStatements(generalStatement);
    this.managedPolicy.addStatements(generalStatement);

    new CfnOutput(this, "managePolicyName", {
      value: this.managedPolicy.managedPolicyName,
    });
  }

  public addPolicy(policy: PolicyStatement[]) {
    this.policy.addStatements(...policy);
    this.managedPolicy.addStatements(...policy);
  }
}
