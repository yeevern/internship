"use server";

import * as jose from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getEnvironmentValue } from "@netizen/utils-env";
import { createUser } from "@internal/libs-user";

export async function setupSession(jwtString: string, redirectUrl = "/") {
  const jwks = jose.createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));
  const { payload } = await jose.jwtVerify(jwtString, jwks);
  const hd = payload.hd;
  if (!(hd === "netizenexperience.com" || hd === "netizentesting.com")) throw new Error("Invalid Domain");
  const expiryTime = 12;
  const encryptSecretValue = jose.base64url.decode(getEnvironmentValue("JWE_SECRET"));
  if (!payload.email) throw new Error("No email in payload");
  if (!payload.name) throw new Error("No name in payload");
  if (!payload.picture) throw new Error("No picture in payload");
  if (!payload.sub) throw new Error("No id in payload");
  const user = await createUser({
    email: payload.email as string,
    name: payload.name as string,
    picture: payload.picture as string,
    id: payload.sub,
  });
  const jwe = await new jose.EncryptJWT(user)
    .setProtectedHeader({ alg: "dir", enc: "A128CBC-HS256" })
    .setExpirationTime(`${expiryTime}h`)
    .encrypt(encryptSecretValue);
  cookies().set("session", jwe, { expires: new Date(Date.now() + expiryTime * 60 * 60 * 1000) });
  redirect(redirectUrl);
}
