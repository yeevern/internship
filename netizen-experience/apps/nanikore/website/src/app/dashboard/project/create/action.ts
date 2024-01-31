"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  FocusGroupProjectAttributes,
  ModeratedTestingProjectAttributes,
  ProjectBaseAttributes,
  ProjectType,
  RecruitmentProjectAttributes,
  SurveyProjectAttributes,
  UnmoderatedTestingProjectAttributes,
  UserInterviewProjectAttributes,
  createProject,
} from "@nanikore/libs-project";
import { RIGHTS } from "@nanikore/libs-user";
import { authCheck } from "@/auth";
import { CreateProjectFormValues } from "./create-project-form";

export async function createProjectAction(type: ProjectType, formValues: CreateProjectFormValues) {
  const { user } = await authCheck([RIGHTS.ADMIN]);

  // @TODO: map actual userId array values to userID related fields after user search and select done instead of random UUID
  const baseParams: Omit<ProjectBaseAttributes, "projectId" | "createdAt" | "ownerId"> = {
    type,
    name: formValues.name,
    company: formValues.company,
    status: "draft",
    recruitmentStage: "active",
    stage: "preparation",
    startDate: Date.parse(formValues.dateRange.startDate.toDateString()),
    endDate: Date.parse(formValues.dateRange.endDate.toDateString()),
    clientIds: formValues.clientIds.map(() => randomUUID()),
    researcherIds: formValues.researcherIds.map(() => randomUUID()),
    language: formValues.language.map((v) => v.type),
    interpretedLanguage: formValues.interpretedLanguage.map((v) => v.type),
    respondentCount: formValues.respondentCount,
    incentive: { amount: formValues.incentive, currency: "MYR" },
  };

  let typedProjectParams;
  switch (type) {
    case "recruitment":
      typedProjectParams = {
        type,
        backupRespondentCount: formValues.backupRespondentCount,
      } as RecruitmentProjectAttributes;
      break;
    case "survey":
      typedProjectParams = { type } as SurveyProjectAttributes;
      break;
    case "focusGroup":
      typedProjectParams = {
        type,
        isRemote: formValues.isRemote === "remote",
        backupRespondentCount: formValues.backupRespondentCount,
        observerIds: (formValues.observerIds ?? []).map(() => randomUUID()),
        moderatorIds: (formValues.moderatorIds ?? []).map(() => randomUUID()),
      } as FocusGroupProjectAttributes;
      break;
    case "userInterview":
      typedProjectParams = {
        type,
        isRemote: formValues.isRemote === "remote",
        backupRespondentCount: formValues.backupRespondentCount,
        observerIds: (formValues.observerIds ?? []).map(() => randomUUID()),
        moderatorIds: (formValues.moderatorIds ?? []).map(() => randomUUID()),
      } as UserInterviewProjectAttributes;
      break;
    case "moderatedTesting":
      typedProjectParams = {
        type,
        isRemote: formValues.isRemote === "remote",
        backupRespondentCount: formValues.backupRespondentCount,
        deviceType: formValues.deviceType,
        observerIds: (formValues.observerIds ?? []).map(() => randomUUID()),
        moderatorIds: (formValues.moderatorIds ?? []).map(() => randomUUID()),
      } as ModeratedTestingProjectAttributes;
      break;
    case "unmoderatedTesting":
      typedProjectParams = { type, deviceType: formValues.deviceType } as UnmoderatedTestingProjectAttributes;
      break;
  }

  await createProject({
    ...baseParams,
    ...typedProjectParams,
    ownerId: user.id,
  });
  revalidatePath("/dashboard/project");
  redirect("/dashboard/project");
}
