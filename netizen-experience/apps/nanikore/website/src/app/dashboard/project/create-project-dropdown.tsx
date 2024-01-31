"use client";

import { Plus } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@netizen/ui";
import { Button } from "@netizen/ui/server";
import { projectTypeLabels, projectTypeValues } from "@nanikore/libs-project";

export default function CreateProjectDropdown() {
  const pathname = usePathname();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <Plus />
          <span>Create project</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {projectTypeValues.map((type) => (
          <Link key={type} href={{ pathname: `${pathname}/create`, query: { type } }}>
            <DropdownMenuItem>{projectTypeLabels[type]}</DropdownMenuItem>
          </Link>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
