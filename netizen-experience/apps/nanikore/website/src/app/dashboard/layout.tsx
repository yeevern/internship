import Link from "next/link";
import { Button } from "@netizen/ui/server";
import { RIGHTS } from "@nanikore/libs-user";
import { authCheck } from "@/auth";
import Provider from "@/context/client-provider";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const auth = await authCheck();
  return (
    <Provider session={auth.session}>
      <header className="bg-neutral-100 py-8">
        <div className="container flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-2xl font-bold">
              <Link href="/dashboard">{auth.user.rights.includes(RIGHTS.ADMIN) ? "Admin Dashboard" : "Dashboard"}</Link>
            </h1>
            <p className="text-xs">
              <span className="select-none">User ID: </span>
              <code>{auth.user.id}</code>
            </p>
            <Link href="/settings">Profile</Link>
          </div>
          <Button variant="secondary" asChild>
            <Link href={process.env.NEXT_PUBLIC_COGNITO_SIGNOUT_URL ?? ""}>Sign out</Link>
          </Button>
        </div>
      </header>
      <main className="container mt-8 pb-16">{children}</main>
    </Provider>
  );
}
