import { RIGHTS, getUser } from "@nanikore/libs-user";
import { getWebsiteAwsClients } from "@/utils/aws";
import { getNaniKoreServerSession } from "./session";

export async function AuthRouteCheck(rights?: RIGHTS[]) {
  const { serverSession } = await getNaniKoreServerSession();
  const { cognitoProvider: client } = getWebsiteAwsClients();
  const user = await getUser(client, serverSession.accessToken);
  const userRights = user.rights;
  if (rights) if (!rights.some((right) => userRights.includes(right))) throw new Error("Infufficient rights");
  return user;
}
