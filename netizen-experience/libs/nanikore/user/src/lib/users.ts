import type { UUID } from "crypto";
import {
  type CognitoIdentityProviderClient,
  GetUserCommand,
  UpdateUserAttributesCommand,
  VerifyUserAttributeCommand,
  AdminGetUserCommand,
  AdminGetUserCommandInput,
  AdminGetUserCommandOutput,
  UserNotFoundException,
} from "@aws-sdk/client-cognito-identity-provider";
import { isUuid } from "@netizen/utils-types";

export enum RIGHTS {
  ADMIN = 1,
}

export interface NaniKoreUser extends MutableUserAttributes {
  id: UUID;
  rights: RIGHTS[];
  emailVerified: boolean;
  phoneVerified: boolean;
}

export interface MutableUserAttributes {
  email?: string;
  picture?: string;
  name?: string;
  phone?: string;
}

const userAttributeName = ["name", "picture", "phone_number", "email"] as const;

export type UserAttributeName = (typeof userAttributeName)[number];

export async function getUser(client: CognitoIdentityProviderClient, accessToken: string): Promise<NaniKoreUser> {
  const input = {
    AccessToken: accessToken,
  };
  const command = new GetUserCommand(input);
  const response = await client.send(command);
  if (response.UserAttributes) {
    const user = response.UserAttributes.reduce<NaniKoreUser>(
      (user, attribute) => {
        switch (attribute.Name) {
          case "sub":
            if (attribute.Value && isUuid(attribute.Value)) user.id = attribute.Value;
            break;
          case "custom:rights":
            if (attribute.Value) {
              const userRights = parseInt(attribute.Value);
              for (const right in RIGHTS) {
                const value = RIGHTS[right];
                if (typeof value === "string") if (userRights & parseInt(right)) user.rights.push(parseInt(right));
              }
            }
            break;
          case "email":
            if (attribute.Value) user.email = attribute.Value;
            break;
          case "picture":
            if (attribute.Value) user.picture = attribute.Value;
            break;
          case "name":
            if (attribute.Value) user.name = attribute.Value;
            break;
          case "email_verified":
            if (attribute.Value) user.emailVerified = attribute.Value === "true";
            break;
          case "phone_number":
            if (attribute.Value) user.phone = attribute.Value;
            break;
          case "phone_number_verified":
            if (attribute.Value) user.phoneVerified = attribute.Value === "true";
            break;
        }
        return user;
      },
      {
        id: "----",
        rights: [],
        emailVerified: false,
        phoneVerified: false,
      },
    );
    return user;
  }
  throw new Error("Auth - No user profile");
}

export async function updateUserAttributes(
  client: CognitoIdentityProviderClient,
  mutableUserAttributes: MutableUserAttributes,
  accessToken: string,
) {
  const userAttributes: { Name: UserAttributeName; Value: string }[] = [];
  const keys = Object.keys(mutableUserAttributes) as (keyof typeof mutableUserAttributes)[];

  for (const key of keys) {
    let attributeName: UserAttributeName;
    switch (key) {
      case "name":
        attributeName = "name";
        break;
      case "email":
        attributeName = "email";
        break;
      case "phone":
        attributeName = "phone_number";
        break;
      case "picture":
        attributeName = "picture";
        break;
    }

    userAttributes.push({
      Name: attributeName,
      Value: mutableUserAttributes[key] ?? "",
    });
  }

  if (!userAttributes.length) return;
  if (userAttributes.some((attribute) => !userAttributeName.includes(attribute.Name))) {
    throw new Error(`Invalid user attribute name provided. Valid attribute names: ${userAttributeName.join(", ")}`);
  }
  const params = {
    AccessToken: accessToken,
    UserAttributes: userAttributes,
  };
  const command = new UpdateUserAttributesCommand(params);
  try {
    await client.send(command);
  } catch (ex) {
    throw new Error("User - Invalid update request");
  }
}

export async function verifyUserAttribute(
  client: CognitoIdentityProviderClient,
  accessToken: string,
  attributeName: UserAttributeName,
  verificationCode: string,
) {
  const params = {
    AccessToken: accessToken,
    AttributeName: attributeName,
    Code: verificationCode,
  };
  const command = new VerifyUserAttributeCommand(params);
  try {
    await client.send(command);
  } catch (ex) {
    throw new Error("User - Invalid verfication code");
  }
}

export const getUserByEmail = async (
  client: CognitoIdentityProviderClient,
  userPoolId: string,
  email: string,
): Promise<AdminGetUserCommandOutput> => {
  const params: AdminGetUserCommandInput = {
    UserPoolId: userPoolId,
    Username: email,
  };
  const command = new AdminGetUserCommand(params);
  try {
    const response = await client.send(command);
    return response;
  } catch (ex) {
    if (ex instanceof UserNotFoundException) {
      throw ex;
    } else {
      throw new Error("User - Get user error");
    }
  }
};
