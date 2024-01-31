import { randomUUID } from "crypto";
import {
  CognitoIdentityProviderClient,
  AdminLinkProviderForUserCommand,
  AdminCreateUserCommand,
  AdminCreateUserCommandOutput,
  AdminCreateUserCommandInput,
  AdminSetUserPasswordCommand,
  AdminSetUserPasswordCommandInput,
  UserNotFoundException,
} from "@aws-sdk/client-cognito-identity-provider";
import { PreSignUpTriggerEvent } from "aws-lambda";
import { getUserByEmail } from "../lib/users";

const cognitoIdp = new CognitoIdentityProviderClient();

const linkProviderToUser = async (
  userPoolId: string,
  destUserId: string,
  destProviderName: string,
  srcProviderName: string,
  srcProviderUserId: string,
) => {
  const params = {
    DestinationUser: {
      ProviderAttributeValue: destUserId,
      ProviderName: destProviderName,
    },
    SourceUser: {
      ProviderAttributeName: "Cognito_Subject",
      ProviderAttributeValue: srcProviderUserId,
      ProviderName: srcProviderName,
    },
    UserPoolId: userPoolId,
  };

  const command = new AdminLinkProviderForUserCommand(params);
  await cognitoIdp.send(command);
};

const getProviderNameAndId = (username: string) => {
  const [providerName, providerUserId] = username.split("_");
  let provider: string;
  switch (providerName) {
    case "google":
      provider = "Google";
      break;
    case "facebook":
      provider = "Facebook";
      break;
    case "loginwithamazon":
      provider = "LoginWithAmazon";
      break;
    default:
      provider = "Cognito";
  }
  return [provider, providerUserId];
};

export async function handler(event: PreSignUpTriggerEvent) {
  const { request, triggerSource, userName, userPoolId } = event;
  if (triggerSource === "PreSignUp_ExternalProvider") {
    try {
      const existingUser = await getUserByEmail(cognitoIdp, userPoolId, request.userAttributes.email);
      const destProviderName = "Cognito";
      const [srcProviderName, srcProviderUserId] = getProviderNameAndId(userName);
      try {
        await linkProviderToUser(
          event.userPoolId,
          existingUser.Username ?? "",
          destProviderName,
          srcProviderName,
          srcProviderUserId,
        );
      } catch (ex) {
        throw new Error("User - User Link Error");
      }
      return event;
    } catch (ex) {
      if (ex instanceof UserNotFoundException) {
        const newUserParams: AdminCreateUserCommandInput = {
          UserPoolId: userPoolId,
          Username: request.userAttributes.email,
          ForceAliasCreation: true,
          MessageAction: "SUPPRESS",
          UserAttributes: [
            {
              Name: "email",
              Value: request.userAttributes.email,
            },
          ],
        };
        let createdUser: AdminCreateUserCommandOutput;
        try {
          createdUser = await cognitoIdp.send(new AdminCreateUserCommand(newUserParams));
        } catch (ex) {
          throw new Error(`User - User Creation Error`);
        }
        try {
          const setPasswordParams: AdminSetUserPasswordCommandInput = {
            Password: randomUUID(),
            UserPoolId: userPoolId,
            Username: createdUser.User?.Username ?? "",
            Permanent: true,
          };
          await cognitoIdp.send(new AdminSetUserPasswordCommand(setPasswordParams));
        } catch {
          throw new Error(`User - Password Initialization Error`);
        }
        const destProviderName = "Cognito";
        const [srcProviderName, srcProviderUserId] = getProviderNameAndId(userName);

        try {
          await linkProviderToUser(
            event.userPoolId,
            createdUser.User?.Username ?? "",
            destProviderName,
            srcProviderName,
            srcProviderUserId,
          );
        } catch (ex) {
          throw new Error("User - User Link Error");
        }
        try {
          event.response.autoVerifyEmail = true;
          event.response.autoConfirmUser = true;
        } catch (ex) {
          throw new Error("User - User Configuration Error");
        }
        return event;
      } else {
        throw ex;
      }
    }
  }
  return event;
}
