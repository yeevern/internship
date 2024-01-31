"use client";

import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { Button } from "@netizen/ui/server";

interface ActiveToggleProps {
  projectId: string;
  active: boolean;
}

export function ActiveToggle({ active, projectId }: ActiveToggleProps) {
  const router = useRouter();
  const handleClick = async () => {
    // @TODO: turn into server action
    if (active) {
      await fetch(`/api/event/admin/${projectId}/deactivate`);
    } else {
      await fetch(`/api/event/admin/${projectId}/activate`);
    }
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <Button variant={active ? "danger" : "primary"} onClick={handleClick}>
      {active ? "Deactivate" : "Activate"}
    </Button>
  );
}
