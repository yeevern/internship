#!/usr/bin/env node

import { checkDeploymentTarget, DeploymentTarget } from "@netizen/utils-aws-cdk";
import { CareerStack } from "./career";
import * as cdk from "aws-cdk-lib";

// To ensure that it is targetting the correct account and region
const region = "ap-southeast-1";
const account = "383533471768";

console.log(`CDK targeting ${account} - ${region}`);

const app = new cdk.App();
const deploymentTarget: DeploymentTarget = app.node.tryGetContext("target");
checkDeploymentTarget(deploymentTarget);

// Get Log Resources

new CareerStack(app, `nx-career-api-${deploymentTarget}`);
