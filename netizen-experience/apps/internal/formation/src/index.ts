#!/usr/bin/env node

import * as cdk from "aws-cdk-lib";
import { DeploymentTarget, checkDeploymentTarget } from "@netizen/utils-aws-cdk";
import { HiringStack } from "@internal/infra-hiring";
import { PromptStack } from "@internal/infra-prompt-hub";
import { UserStack } from "@internal/infra-user";
import { LightsailStack } from "./lightsail";
import { RoleStack } from "./role";

// To ensure that it is targetting the correct account and region
const region = "ap-southeast-1";
const account = "383533471768";

const app = new cdk.App();
const deploymentTarget: DeploymentTarget = app.node.tryGetContext("target");
checkDeploymentTarget(deploymentTarget);

if (process.env["AWS_PROFILE"]) console.log(`AWS_PROFILE: ${process.env["AWS_PROFILE"]}`);
console.log(`CDK deployment account: ${account}`);
console.log(`CDK deployment region : ${region}`);
console.log(`CDK deployment target : ${deploymentTarget}`);

const stackProps = { env: { account, region } };

const roleStack = new RoleStack(app, `nx-internal-role-${deploymentTarget}`, stackProps);
new HiringStack(app, `nx-internal-hiring-${deploymentTarget}`, stackProps);
const promptStack = new PromptStack(app, `nx-internal-prompt-${deploymentTarget}`, stackProps);
const userStack = new UserStack(app, `nx-internal-user-${deploymentTarget}`, stackProps);

roleStack.addPolicy(promptStack.iamStatements);
roleStack.addPolicy(userStack.iamStatements);

if (deploymentTarget !== "local") new LightsailStack(app, `nx-internal-lightsail-${deploymentTarget}`, stackProps);
cdk.Tags.of(app).add("project", `nx-internal-${deploymentTarget}`);
