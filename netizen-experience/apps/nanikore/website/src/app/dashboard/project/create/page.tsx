import { redirect } from "next/navigation";
import { isTypeOf } from "@netizen/utils-types";
import { ProjectType, projectTypeValues } from "@nanikore/libs-project";
import CreateProjectForm from "./create-project-form";

interface PageProps {
  searchParams?: {
    type: ProjectType;
  };
}

export default function Page({ searchParams }: PageProps) {
  const { type } = searchParams ?? {};
  if (!(type && isTypeOf<ProjectType>(type, (arg) => projectTypeValues.includes(arg)))) redirect("/dashboard/project");

  return <CreateProjectForm type={type} />;
}
