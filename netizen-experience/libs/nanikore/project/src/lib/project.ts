import { UUID, randomUUID } from "crypto";
import { unsafe__create, unsafe__query, unsafe__remove, unsafe__update } from "@netizen/utils-aws";
import { RequiredBy } from "@netizen/utils-types";
import { initProjectLib } from "../init";
import {
  FocusGroupProjectAttributes,
  ModeratedTestingProjectAttributes,
  ProjectBaseAttributes,
  ProjectMeta,
  ProjectStatus,
  ProjectType,
  RecruitmentProjectAttributes,
  SurveyProjectAttributes,
  UnmoderatedTestingProjectAttributes,
  UserInterviewProjectAttributes,
} from "../types/project";
import {
  baseProjectSchema,
  focusGroupProjectSchema,
  moderatedTestingProjectSchema,
  projectMetaSchema,
  recruitmentProjectSchema,
  surveyProjectSchema,
  unmoderatedTestingProjectSchema,
  userInterviewProjectSchema,
} from "./entities";

function getTypedProjectSchema(type: ProjectType) {
  switch (type) {
    case "recruitment":
      return recruitmentProjectSchema;
    case "survey":
      return surveyProjectSchema;
    case "focusGroup":
      return focusGroupProjectSchema;
    case "userInterview":
      return userInterviewProjectSchema;
    case "moderatedTesting":
      return moderatedTestingProjectSchema;
    case "unmoderatedTesting":
      return unmoderatedTestingProjectSchema;
    default:
      throw new Error("Project - Invalid project type");
  }
}

type CreateProjectParams = Omit<ProjectBaseAttributes, "projectId" | "createdAt" | "updatedAt"> &
  (
    | RecruitmentProjectAttributes
    | SurveyProjectAttributes
    | FocusGroupProjectAttributes
    | UserInterviewProjectAttributes
    | ModeratedTestingProjectAttributes
    | UnmoderatedTestingProjectAttributes
  );

export async function createProject(params: CreateProjectParams) {
  const {
    aws: { dynamo: client },
    config: { projectsTable: table },
  } = initProjectLib();

  const projectId = randomUUID();
  await unsafe__create({
    client,
    table: table,
    schema: projectMetaSchema,
    item: {
      ...params,
      partition: projectId,
      sort: "meta",
      createdAt: Date.now(),
    },
  });
  return { projectId };
}

export async function getProject(projectId: UUID) {
  const {
    aws: { dynamo: client },
    config: { projectsTable: table },
  } = initProjectLib();

  const [meta] = await unsafe__query({
    client,
    table: table,
    schema: projectMetaSchema,
    attributes: { partition: projectId, sort: "meta" },
  });
  if (meta === undefined) throw new Error("Project - Project not found");

  const { partition, sort: _, ...attributes } = meta;
  const project: ProjectMeta = { projectId: partition, ...attributes };
  return project;
}

export async function listProjectsByStatus(statuses: ProjectStatus[]) {
  const {
    aws: { dynamo: client },
    config: { projectsTable: table },
  } = initProjectLib();

  const currentTime = Date.now();
  const projectsList = await Promise.all(
    statuses.map((status) => {
      return unsafe__query({
        client,
        table,
        schema: projectMetaSchema,
        indexName: "statusGSI",
        attributes: { status, createdAt: currentTime },
        keyConditionExpression: `#status = :status AND #createdAt <= :createdAt`,
      });
    }),
  );

  return projectsList.reduce<ProjectMeta[]>((list, projects) => {
    list.push(
      ...projects.map<ProjectMeta>((project) => {
        const { partition, sort: _, ...attributes } = project;
        return {
          projectId: partition,
          ...attributes,
        };
      }),
    );
    return list;
  }, []);
}

type UpdateProjectParams = Omit<RequiredBy<ProjectBaseAttributes, "projectId">, "createdAt" | "updatedAt"> &
  (
    | RequiredBy<RecruitmentProjectAttributes, "type">
    | RequiredBy<SurveyProjectAttributes, "type">
    | RequiredBy<FocusGroupProjectAttributes, "type">
    | RequiredBy<UserInterviewProjectAttributes, "type">
    | RequiredBy<ModeratedTestingProjectAttributes, "type">
    | RequiredBy<UnmoderatedTestingProjectAttributes, "type">
  );

export async function updateProject(params: UpdateProjectParams) {
  const {
    aws: { dynamo: client },
    config: { projectsTable: table },
  } = initProjectLib();

  const { projectId, type, ...attributes } = params;

  const [meta] = await unsafe__query({
    client,
    table,
    schema: projectMetaSchema,
    attributes: { partition: projectId, sort: "meta" },
  });
  if (meta === undefined) throw new Error("Project - Project not found");

  await unsafe__update({
    client,
    table,
    schema: baseProjectSchema.merge(getTypedProjectSchema(type)),
    attributes: {
      partition: projectId,
      sort: "meta",
      updatedAt: Date.now(),
      ...attributes,
    },
  });
  return {};
}

export async function removeProject(projectId: UUID) {
  const {
    aws: { dynamo: client },
    config: { projectsTable: table },
  } = initProjectLib();

  await unsafe__remove({
    client,
    table,
    keys: { partition: projectId, sort: "meta" },
  });
  return {};
}
