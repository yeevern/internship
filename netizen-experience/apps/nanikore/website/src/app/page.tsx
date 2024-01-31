"use client";

import NextLink from "next/link";
import { signIn } from "next-auth/react";
import { Link, linkVariants } from "@netizen/ui/server";

export default function NaniKore() {
  return (
    <main className="container py-8">
      <h1 className="mb-4 text-2xl font-bold">Temporary Navigation</h1>
      <ul className="list-inside list-disc">
        <li>
          <Link onClick={() => signIn("cognito", { callbackUrl: "/dashboard", redirect: true })}>Sign in</Link>
        </li>
        <li>
          <NextLink className={linkVariants()} href={process.env.NEXT_PUBLIC_COGNITO_SIGNOUT_URL ?? ""}>
            Sign out
          </NextLink>
        </li>
      </ul>
    </main>
  );
}
