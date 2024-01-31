import * as path from "path";
import * as cdk from "aws-cdk-lib";
import * as cdkLambda from "aws-cdk-lib/aws-lambda";
import * as cdkLambdaNode from "aws-cdk-lib/aws-lambda-nodejs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as cdkLogs from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";
import { isTypeOf } from "@netizen/utils-types";

const deploymentTargets = ["staging", "production", "local"] as const;

export type DeploymentTarget = (typeof deploymentTargets)[number];

export function checkDeploymentTarget(deploymentTarget: DeploymentTarget) {
  if (!deploymentTargets.includes(deploymentTarget))
    throw new Error(`Invalid deployment target provided. Valid targets: ${deploymentTargets.join(", ")}`);
}

export interface BuildContext {
  readonly deploymentTarget: DeploymentTarget;
}

export interface LambdaBuildCOntext extends BuildContext {
  readonly restApi: {
    readonly cors: string[];
  };
}

export type LambdaCreateFunctionsParams<Type> = {
  [Property in keyof Type]: CreateLambdaParam;
};

export interface CreateLambdaParam {
  entry: string;
  handler?: string;
  timeout?: cdk.Duration;
}

export interface LambdaStackWithContextProps extends cdk.StackProps {
  srcPath: string;
}

class StackBaseClass<Context> extends cdk.Stack {
  protected context: Context;
  protected deploymentTarget: DeploymentTarget;
  protected isProduction: boolean;
  protected removalPolicy: cdk.RemovalPolicy;

  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    const deploymentTarget = scope.node.tryGetContext("target") as unknown;
    if (deploymentTarget === undefined) throw new Error("No environment provided for context");
    else if (!isTypeOf<DeploymentTarget>(deploymentTarget, (arg) => ["staging", "production", "local"].includes(arg)))
      throw new Error("Invalid environment provided for context");
    this.deploymentTarget = deploymentTarget;
    checkDeploymentTarget(deploymentTarget);
    const context = scope.node.tryGetContext(deploymentTarget) as Context;

    // Settings for stack
    this.isProduction = deploymentTarget === "production";
    this.removalPolicy = this.isProduction ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY;

    this.context = { ...context, deploymentTarget: deploymentTarget };
  }
}

export class StackWithContext extends StackBaseClass<BuildContext> {}

export class LambdaStackWithContext extends StackBaseClass<LambdaBuildCOntext> {
  protected lambdaOptions: {
    srcPath: string;
    nodeJsFunctionProps: cdkLambdaNode.NodejsFunctionProps;
  };

  constructor(scope: Construct, id: string, props: LambdaStackWithContextProps) {
    super(scope, id, props);

    // lambda functions
    const bundling: cdkLambdaNode.BundlingOptions = {
      minify: false,
      externalModules: ["@aws-sdk/*"],
    };

    const projectRoot = path.join(__dirname, "../../../../../");
    const depsLockFilePath = path.join(projectRoot, "package-lock.json");

    this.lambdaOptions = {
      srcPath: path.join(projectRoot, props.srcPath),
      nodeJsFunctionProps: {
        bundling,
        depsLockFilePath,
        projectRoot,
        architecture:
          process.env["LOCALSTACK_ENDPOINT"] &&
          this.deploymentTarget === "local" &&
          (process.arch === "arm" || process.arch === "arm64")
            ? cdkLambda.Architecture.ARM_64
            : cdkLambda.Architecture.X86_64,
        memorySize: 1024,
        runtime: cdkLambda.Runtime.NODEJS_20_X,
        logRetention: cdkLogs.RetentionDays.ONE_WEEK,
        insightsVersion: cdkLambda.LambdaInsightsVersion.VERSION_1_0_119_0,
      },
    };
  }

  protected createFunction(
    id: string,
    entry: string,
    handler = "handler",
    timeout: cdk.Duration = cdk.Duration.seconds(3),
  ) {
    const nodeFunction = new NodejsFunction(this, id, {
      entry: path.join(this.lambdaOptions.srcPath, entry),
      handler,
      ...this.lambdaOptions.nodeJsFunctionProps,
      timeout,
    });
    if (process.env["LOCALSTACK_ENDPOINT"] && this.deploymentTarget === "local")
      nodeFunction.addEnvironment("LOCALSTACK_ENDPOINT", process.env["LOCALSTACK_ENDPOINT"]);
    return nodeFunction;
  }

  protected createFunctions<Type>(params: LambdaCreateFunctionsParams<Type>) {
    const keys = Object.keys(params) as (keyof typeof params)[];
    return keys
      .map((key) => this.createFunction(key as string, params[key].entry, params[key].handler, params[key].timeout))
      .reduce<Record<keyof typeof params, NodejsFunction>>(
        (result, value, index) => {
          result[keys[index]] = value;
          return result;
        },
        {} as Record<keyof typeof params, NodejsFunction>,
      );
  }
}
