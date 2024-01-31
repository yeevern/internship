import { UUID } from "crypto";

export const projectTypeValues = [
  "recruitment",
  "survey",
  "focusGroup",
  "userInterview",
  "moderatedTesting",
  "unmoderatedTesting",
] as const;
export const projectStatusValues = [
  "draft",
  "inReview",
  "inProgress",
  "pendingPayment",
  "completed",
  "cancelled",
] as const;
export const projectDeviceTypeValues = ["mobile", "desktop", "tablet"] as const;
export const projectRecruitmentStageValues = ["inactive", "active", "completed"] as const;
export const projectStageValues = ["preparation", "pre-fieldwork", "fieldwork", "completed"] as const;

export const projectTypeLabels: Record<ProjectType, string> = {
  recruitment: "Recruitment",
  survey: "Survey",
  focusGroup: "Focus Group",
  userInterview: "User Interview",
  moderatedTesting: "Moderated Testing",
  unmoderatedTesting: "Unmoderated Testing",
};
export const projectStageLabels: Record<ProjectStage, string> = {
  preparation: "Recruitment",
  "pre-fieldwork": "Pre-fieldwork",
  fieldwork: "Fieldwork",
  completed: "Completed",
};

export type ProjectType = (typeof projectTypeValues)[number];
export type ProjectStatus = (typeof projectStatusValues)[number];
export type ProjectDeviceType = (typeof projectDeviceTypeValues)[number];
export type ProjectRecruitmentStage = (typeof projectRecruitmentStageValues)[number];
export type ProjectStage = (typeof projectStageValues)[number];

export interface ProjectBaseAttributes {
  projectId: UUID;
  createdAt: number;
  updatedAt?: number;
  type: ProjectType;
  name: string;
  company: string;
  status: ProjectStatus;
  recruitmentStage: ProjectRecruitmentStage;
  stage: ProjectStage;
  startDate: number;
  endDate: number;
  ownerId: UUID;
  clientIds: UUID[];
  researcherIds: UUID[];
  language: string[];
  interpretedLanguage: string[];
  respondentCount: number;
  incentive: { amount: number; currency: string };
}
export interface RecruitmentProjectAttributes {
  type: Extract<ProjectType, "recruitment">;
  backupRespondentCount: number;
}
export interface SurveyProjectAttributes {
  type: Extract<ProjectType, "survey">;
}
export interface FocusGroupProjectAttributes {
  type: Extract<ProjectType, "focusGroup">;
  observerIds: UUID[];
  moderatorIds: UUID[];
  backupRespondentCount: number;
  isRemote: boolean;
}
export interface UserInterviewProjectAttributes {
  type: Extract<ProjectType, "userInterview">;
  observerIds: UUID[];
  moderatorIds: UUID[];
  backupRespondentCount: number;
  isRemote: boolean;
}
export interface ModeratedTestingProjectAttributes {
  type: Extract<ProjectType, "moderatedTesting">;
  observerIds: UUID[];
  moderatorIds: UUID[];
  backupRespondentCount: number;
  isRemote: boolean;
  deviceType: ProjectDeviceType[];
}
export interface UnmoderatedTestingProjectAttributes {
  type: Extract<ProjectType, "unmoderatedTesting">;
  deviceType: ProjectDeviceType[];
}

export type ProjectMeta = ProjectBaseAttributes &
  (
    | RecruitmentProjectAttributes
    | SurveyProjectAttributes
    | FocusGroupProjectAttributes
    | UserInterviewProjectAttributes
    | ModeratedTestingProjectAttributes
    | UnmoderatedTestingProjectAttributes
  );
