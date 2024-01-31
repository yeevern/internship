#!/usr/bin/env node

import * as cdk from "aws-cdk-lib";
import { checkDeploymentTarget, DeploymentTarget } from "@netizen/utils-aws-cdk";
import { ChimeStack } from "@nanikore/infra-chime";
import { EventStack } from "@nanikore/infra-event";
import { ProjectStack } from "@nanikore/infra-project";
import { SurveyStack } from "@nanikore/infra-survey";
import { UserStack } from "@nanikore/infra-user";
import { LightSailStack } from "./lightsail";
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

// Setting up the stacks

const roleStack = new RoleStack(app, `nx-nanikore-role-${deploymentTarget}`, { env: { account, region } });

const stackProps = { env: { account, region } };

const userStack = new UserStack(app, `nx-nanikore-user-${deploymentTarget}`, stackProps);
const surveyStack = new SurveyStack(app, `nx-nanikore-survey-${deploymentTarget}`, stackProps);
const projectStack = new ProjectStack(app, `nx-nanikore-project-${deploymentTarget}`, stackProps);
const eventStack = new EventStack(app, `nx-nanikore-event-${deploymentTarget}`, stackProps);
const chimeStack = new ChimeStack(app, `nx-nanikore-chime-${deploymentTarget}`, stackProps);

cdk.Tags.of(app).add("project", `nx-nanikore-${deploymentTarget}`);

roleStack.addPolicy(userStack.iamStatements);
roleStack.addPolicy(surveyStack.iamStatements);
roleStack.addPolicy(projectStack.iamStatements);
roleStack.addPolicy(eventStack.iamStatements);
roleStack.addPolicy(chimeStack.iamStatements);

if (deploymentTarget !== "local") {
  new LightSailStack(app, `nx-nanikore-lightsail-${deploymentTarget}`, { env: { account, region } });
}
