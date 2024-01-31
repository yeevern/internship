"use server";

import { revalidatePath } from "next/cache";
import { MutableUserAttributes, updateUserAttributes } from "@nanikore/libs-user";
import { authCheck } from "@/auth";
import { getWebsiteAwsClients } from "@/utils/aws";

export async function updateUserDetails(accessToken: string, userAttributes: MutableUserAttributes) {
  const auth = await authCheck();
  const user = auth.user;
  const { cognitoProvider: client } = getWebsiteAwsClients();

  const modifiedUserAttributes: MutableUserAttributes = {};
  const keys = Object.keys(userAttributes) as (keyof typeof userAttributes)[];

  for (const key of keys) {
    if (user[key] !== userAttributes[key]) modifiedUserAttributes[key] = userAttributes[key];
  }
  await updateUserAttributes(client, modifiedUserAttributes, accessToken);
  revalidatePath("/dashboard/user");
}
