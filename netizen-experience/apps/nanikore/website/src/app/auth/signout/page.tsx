"use client";

import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect } from "react";

export default function Page() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      signOut({ callbackUrl: "/", redirect: true });
    } else {
      router.push("/");
    }
  }, [status, router]);

  return null;
}
