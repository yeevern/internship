import { getServerSession } from "next-auth/next";
import Provider from "@/context/client-provider";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  return <Provider session={session}>{children}</Provider>;
}
