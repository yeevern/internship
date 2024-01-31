import { Session, getServerSession } from "next-auth";
import { authOptions } from "./next";

export interface ServerSession extends Session {
  sub: string;
  accessToken: string;
}

export async function getNaniKoreServerSession(): Promise<{ serverSession: ServerSession; session: Session }> {
  const session = await getServerSession({
    ...authOptions,
    callbacks: {
      ...authOptions.callbacks,
      session({ session, token }) {
        return { ...session, accessToken: token.accessToken, sub: token.sub };
      },
    },
  });
  if (session)
    return { serverSession: session as ServerSession, session: { user: session.user, expires: session.expires } };
  throw new Error("Auth - No session found");
}
