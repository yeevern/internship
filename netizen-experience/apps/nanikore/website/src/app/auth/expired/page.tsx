"use client";

import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useEffect } from "react";

export default function Page() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  useEffect(() => {
    signIn("cognito", { callbackUrl: callbackUrl ?? "/" });
  }, [callbackUrl]);

  return null;
}
