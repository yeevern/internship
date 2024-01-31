import { redirect } from "next/navigation";
import { Session } from "next-auth";
import { cache } from "react";
import { RIGHTS, getUser, NaniKoreUser } from "@nanikore/libs-user";
import { getWebsiteAwsClients } from "@/utils/aws";
import { ServerSession, getNaniKoreServerSession } from "./session";

export interface AuthParams {
  session: Session;
  serverSession: ServerSession;
  user: NaniKoreUser;
}

export const authCheck = cache(async (rights?: RIGHTS[]) => {
  try {
    const { serverSession, session } = await getNaniKoreServerSession();
    const { cognitoProvider: client } = getWebsiteAwsClients();
    const user = await getUser(client, serverSession.accessToken);
    const userRights = user.rights;
    if (rights)
      if (!rights.some((right) => userRights.includes(right))) {
        // User does not have sufficient rights to view the current page.
        // @TODO: Add insufficient rights page.
        redirect("/error");
      }
    return { user, serverSession, session };
  } catch (ex) {
    if (ex instanceof Error && ex.message === "Access Token has expired")
      redirect("/auth/expired?callbackUrl=/dashboard");
    else throw ex;
  }
});
