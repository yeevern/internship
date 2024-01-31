import { AuthOptions } from "next-auth";
import CognitoProvider from "next-auth/providers/cognito";
import { getEnvironmentValue } from "@netizen/utils-env";

export const authOptions: AuthOptions = {
  providers: [
    CognitoProvider({
      clientId: getEnvironmentValue("COGNITO_CLIENT_ID"),
      clientSecret: getEnvironmentValue("COGNITO_CLIENT_SECRET"),
      issuer: `https://cognito-idp.${getEnvironmentValue("AWS_REGION")}.amazonaws.com/${getEnvironmentValue(
        "COGNITO_USERPOOL_ID",
      )}`,
      checks: ["pkce", "nonce"],
      authorization: {
        params: {
          scope: "openid profile email aws.cognito.signin.user.admin",
        },
      },
    }),
  ],
  callbacks: {
    jwt({ account, token }) {
      if (account) {
        if (account.provider === "cognito") {
          token.accessToken = account?.access_token;
          const id_token = account?.id_token;
          if (id_token) {
            const tokenParsed = JSON.parse(Buffer.from(id_token.split(".")[1], "base64").toString());
            token.username = tokenParsed["cognito:username"];
          }
        }
      }
      return token;
    },
  },
};
