import Link from "next/link";
import { linkVariants, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@netizen/ui/server";
import { cn } from "@netizen/utils-ui";

interface ProjectsProps {
  items: {
    projectId: string;
    active: boolean;
    created: string;
    start: string;
    end: string;
  }[];
}

export function Projects({ items }: ProjectsProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Project ID</TableHead>
          <TableHead>Created on</TableHead>
          <TableHead>Start date</TableHead>
          <TableHead>End date</TableHead>
          <TableHead className="w-24 text-center">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map(({ active, created, end, projectId, start }) => (
          <TableRow key={projectId}>
            <TableCell>
              <Link href={`/dashboard/event/${projectId}`} className={cn(linkVariants(), "font-mono")}>
                {projectId}
              </Link>
            </TableCell>
            <TableCell>{created}</TableCell>
            <TableCell>{start}</TableCell>
            <TableCell>{end}</TableCell>
            <TableCell
              className={cn("w-24 text-center", active ? "text-success-foreground" : "text-danger-foreground")}
            >
              {active ? "Active" : "Inactive"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
