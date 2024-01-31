"use client";

import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { Button } from "@netizen/ui/server";

interface RegisterSessionProps {
  projectId: string;
  sessionId: string;
}

export default function RegisterSession({ projectId, sessionId }: RegisterSessionProps) {
  const router = useRouter();

  const handleClick = async () => {
    // @TODO: turn into server action
    await fetch(`/api/event/${projectId}/${sessionId}`);
    startTransition(() => {
      router.refresh();
    });
  };

  return <Button onClick={handleClick}>Register</Button>;
}
