import * as jose from "jose";
import { cookies } from "next/headers";
import { getEnvironmentValue } from "@netizen/utils-env";
import { BaseError } from "@netizen/utils-types";
import { Rights } from "@internal/types-user";

export async function getSession() {
  const sessionCookie = cookies().get("session");
  if (sessionCookie?.value) {
    const encryptSecretValue = jose.base64url.decode(getEnvironmentValue("JWE_SECRET"));
    const { payload } = await jose.jwtDecrypt(sessionCookie.value, encryptSecretValue);
    return {
      email: payload.email as string,
      name: payload.name as string,
      picture: payload.picture as string,
      id: payload.id as string,
      rights: payload.rights as Rights[],
    };
  }
  return;
}

export async function checkSession(rights?: Rights | Rights[]) {
  const session = await getSession();
  if (session === undefined) throw new BaseError("Invalid session");
  if (rights !== undefined)
    if (rights.length > 0) {
      const validRights = (Array.isArray(rights) ? rights : [rights]).some((right) => session.rights.includes(right));
      if (validRights === false) throw new BaseError("Invalid rights");
    }
  return session;
}
