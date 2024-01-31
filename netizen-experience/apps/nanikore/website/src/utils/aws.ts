import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { getEnvironmentValue } from "@netizen/utils-env";

export interface AwsClients {
  dynamo: DynamoDBDocumentClient;
  cognitoProvider: CognitoIdentityProviderClient;
}

let awsClients: AwsClients | undefined;

export function getWebsiteAwsClients(): AwsClients {
  if (awsClients) return awsClients;
  const region = getEnvironmentValue("AWS_REGION");
  const dynamo = DynamoDBDocumentClient.from(new DynamoDB({ region }));
  const cognitoProvider = new CognitoIdentityProviderClient({ region });
  return (awsClients = { dynamo, cognitoProvider });
}
