import { Heading } from "@netizen/ui/server";
import {
  ProjectMeta,
  ProjectType,
  listProjectsByStatus,
  projectStageValues,
  projectTypeValues,
  ProjectStage,
} from "@nanikore/libs-project";
import CreateProjectDropdown from "./create-project-dropdown";
import ProjectsDisplayOptions, { OrderParams, SortParams, ViewParams } from "./projects-display-options";
import ProjectsList from "./projects-list";

interface PageProps {
  searchParams?: {
    sort: SortParams;
    order: OrderParams;
    view: ViewParams;
    type: string;
    company: string;
    stage: string;
    query: string;
  };
}

export default async function Page({ searchParams }: PageProps) {
  const { company, order, query, sort, stage, type, view } = searchParams ?? {};
  const projectsList = await listProjectsByStatus(["draft", "inReview", "inProgress", "pendingPayment"]);
  const sortedProjects = sortProject(projectsList, sort);
  const filteredProjects = filterProjects(sortedProjects, type, company, stage, query);

  function sortProject(projects: ProjectMeta[], sort?: SortParams) {
    switch (sort) {
      case "name":
        projects.sort((a, b) => a.name.localeCompare(b.name));
        if (order === "desc") projects.reverse();
        break;
      case "date":
      case undefined:
        projects.sort((a, b) => (a.startDate > b.startDate ? 1 : a.startDate < b.startDate ? -1 : 0));
        break;
      // @TODO: sort projects with updates to be listed first
      case "updates":
        projects.sort((a, b) => (a.startDate > b.startDate ? 1 : a.startDate < b.startDate ? -1 : 0));
        break;
      default:
        projects.sort((a, b) => (a.startDate > b.startDate ? 1 : a.startDate < b.startDate ? -1 : 0));
        break;
    }
    return projects;
  }

  function filterProjects(projects: ProjectMeta[], type?: string, company?: string, stage?: string, query?: string) {
    let filteredProjects: ProjectMeta[] = projects;
    if (type !== undefined) {
      const typeFilterParams = type.split(",").filter((param) => projectTypeValues.includes(param as ProjectType));
      if (typeFilterParams.length > 0)
        filteredProjects = filteredProjects.filter((project) => typeFilterParams.includes(project.type));
    }

    if (company !== undefined) {
      // @TODO: filter projects after getting list of companies
    }

    if (stage !== undefined) {
      const stageFilterParams = stage.split(",").filter((param) => projectStageValues.includes(param as ProjectStage));
      if (stageFilterParams.length > 0) {
        filteredProjects = filteredProjects.filter((project) => {
          if (project.recruitmentStage === "active" && stageFilterParams.includes("recruitment")) return true;
          return stageFilterParams.includes(project.stage);
        });
      }
    }

    if (query !== undefined) {
      filteredProjects = filteredProjects.filter((project) => project.name.toLowerCase().includes(query));
    }
    return filteredProjects;
  }

  // @TODO: return projects grid component for grid view
  const ProjectsView = () => {
    return view && view === "grid" ? null : <ProjectsList projects={filteredProjects} />;
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading>Projects</Heading>
        <CreateProjectDropdown />
      </div>
      <ProjectsDisplayOptions />
      <ProjectsView />
    </>
  );
}
