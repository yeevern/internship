import {
  CloudFormationClient,
  CreateStackCommand,
  DescribeStackResourceCommand,
  DescribeStacksCommand,
  ListStackResourcesCommand,
  ListStacksCommand,
  UpdateStackCommand,
} from "@aws-sdk/client-cloudformation";
import * as path from "path";
import * as _ from "lodash";
import * as fs from "fs";

import { parseArgs } from "node:util";

type S3Resource = {
  Type: "AWS::S3::Bucket";
  Properties: {
    BucketName: string;
  };
};

type DynamoDBResource = {
  Type: "AWS::DynamoDB::Table";
  Properties: {
    TableName: string;
  };
};
type Resources = S3Resource | DynamoDBResource;
type CloudFormationTemplate = {
  Resources: Record<string, Resources>;
};

const {
  values: { template },
} = parseArgs({
  options: {
    template: {
      type: "string",
      short: "t",
    },
  },
});

if (!template) throw new Error("Template is required");

// Read template from cdk.out folder
const templatePath = path.join(process.cwd(), template);
let templateContent = fs.readFileSync(templatePath, "utf-8");
const templateJson: CloudFormationTemplate = JSON.parse(templateContent);
const name = /([^/]*)\.template\.json$/.exec(templatePath)?.[1];

if (!name) throw new Error("Cannot extract name from template");

const client = new CloudFormationClient({ endpoint: process.env["LOCALSTACK_ENDPOINT"] });

// Modify template and keep only if the resource type is AWS::S3::Bucket or AWS::DynamoDB::Table

const localStackCloudFormation: CloudFormationTemplate = { Resources: {} };
_.forIn(templateJson.Resources, (resource, key) => {
  if (resource.Type === "AWS::DynamoDB::Table" || resource.Type === "AWS::S3::Bucket")
    localStackCloudFormation.Resources[key] = resource;
});

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  const { StackSummaries } = await client.send(new ListStacksCommand({}));
  if (!StackSummaries) throw new Error("Cannot find stack summaries");
  const stack = StackSummaries.find((stack) => stack.StackName === name);
  const isStackAvilable = stack !== undefined && stack?.StackStatus !== "DELETE_COMPLETE";
  if (isStackAvilable) {
    console.log("Stack is available, updating");
    await client.send(
      new UpdateStackCommand({ StackName: name, TemplateBody: JSON.stringify(localStackCloudFormation) }),
    );
  } else {
    console.log(`Creating stack ${name}`);
    await client.send(
      new CreateStackCommand({ StackName: name, TemplateBody: JSON.stringify(localStackCloudFormation) }),
    );
  }
  const checkStatus = async () => {
    const describeResult = await client.send(new DescribeStacksCommand({ StackName: name }));
    console.log(`Latest status is ${describeResult.Stacks?.[0].StackStatus}`);
    return describeResult;
  };
  while (
    await (async () => {
      const status = (await checkStatus()).Stacks?.[0].StackStatus;
      if (status === "CREATE_COMPLETE" || status === "UPDATE_COMPLETE") return false;
      return true;
    })()
  )
    await sleep(50);
  console.log(`Stack ${name} is ready`);
  const { StackResourceSummaries } = await client.send(new ListStackResourcesCommand({ StackName: name }));
  if (!StackResourceSummaries) throw new Error("Cannot find stack resource summaries");
  const resources = await Promise.all(
    StackResourceSummaries.map((resource) => {
      return client.send(
        new DescribeStackResourceCommand({ StackName: name, LogicalResourceId: resource.LogicalResourceId }),
      );
    }),
  );
  const details = resources.map((resource) => {
    if (resource.StackResourceDetail === undefined) throw new Error("Cannot find stack resource detail");
    if (resource.StackResourceDetail.LogicalResourceId === undefined)
      throw new Error("Cannot find stack logical resource id");
    if (resource.StackResourceDetail.PhysicalResourceId === undefined)
      throw new Error("Cannot find stack physical resource id");
    return {
      logical: resource.StackResourceDetail.LogicalResourceId,
      physical: resource.StackResourceDetail.PhysicalResourceId,
    };
  });
  details.forEach((detail) => {
    const regex = new RegExp(`{\\s*"Ref":\\s*"${detail.logical}"\\s*}`, "gm");
    templateContent = templateContent.replace(regex, `"${detail.physical}"`);
  });
  fs.writeFileSync(templatePath, templateContent);
  console.log(`Template ${templatePath} is updated`);
})();
