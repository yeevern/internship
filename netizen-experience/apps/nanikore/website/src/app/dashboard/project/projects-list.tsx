import Link from "next/link";
import { Chip, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@netizen/ui/server";
import { ProjectMeta, projectStageLabels, projectTypeLabels } from "@nanikore/libs-project";

// @TODO: display notification icon if project has updates for user
function NotificationIcon() {
  return <div className="aspect-square h-3 w-3 rounded-full bg-black" />;
}

export default function ProjectsList({ projects }: { projects: ProjectMeta[] }) {
  return (
    <Table className="border border-black">
      <TableHeader>
        <TableRow className="border border-black text-base font-medium capitalize">
          <TableHead align="center" className="w-10" />
          <TableHead align="left" className="w-1/2">
            Project
          </TableHead>
          <TableHead align="left">Type</TableHead>
          <TableHead align="left">Stage</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project) => (
          <TableRow key={project.projectId} className="border border-black">
            <TableCell align="center" className="w-10">
              <NotificationIcon />
            </TableCell>
            <TableCell align="left" className="w-1/2">
              <Link href={`/dashboard/project/${project.projectId}`}>{project.name}</Link>
            </TableCell>
            <TableCell align="left" className="w-1/4 capitalize">
              {projectTypeLabels[project.type]}
            </TableCell>
            <TableCell align="left" className="w-1/4">
              <div className="flex items-center justify-start gap-4">
                {project.recruitmentStage === "active" && (
                  <Chip className="capitalize">{projectStageLabels.preparation}</Chip>
                )}
                {project.stage !== "preparation" && (
                  <Chip className="capitalize">{projectStageLabels[project.stage]}</Chip>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
