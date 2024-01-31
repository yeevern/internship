"use server";

import { revalidatePath } from "next/cache";
import { UserAttributeName, verifyUserAttribute } from "@nanikore/libs-user";
import { getWebsiteAwsClients } from "@/utils/aws";

export async function verifyAttribute(accessToken: string, attributeName: UserAttributeName, code: string) {
  const { cognitoProvider: client } = getWebsiteAwsClients();
  await verifyUserAttribute(client, accessToken, attributeName, code);
  revalidatePath("/dashboard/user");
}
