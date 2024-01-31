"use client";

import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { Button } from "@netizen/ui/server";

interface RequestChangeProps {
  changeRequested?: boolean;
  projectId: string;
  sessionId: string;
}

export default function RequestChange({ changeRequested, projectId, sessionId }: RequestChangeProps) {
  const router = useRouter();

  const handleClick = async () => {
    // @TODO: turn into server action
    await fetch(`/api/event/${projectId}/${sessionId}/change`);
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <Button onClick={handleClick} disabled={Boolean(changeRequested)}>
      {changeRequested ? "Change requested" : "Request change"}
    </Button>
  );
}
