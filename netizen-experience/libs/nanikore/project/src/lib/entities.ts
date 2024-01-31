import type { UUID } from "crypto";
import { z } from "zod";
import { isUuid, uuidSchema } from "@netizen/utils-types";
import {
  projectDeviceTypeValues,
  projectRecruitmentStageValues,
  projectStageValues,
  projectStatusValues,
  projectTypeValues,
} from "../types/project";

export const baseProjectSchema = z.object({
  partition: uuidSchema,
  sort: z.literal("meta"),
  createdAt: z.number(),
  updatedAt: z.number().optional(),
  type: z.enum(projectTypeValues),
  name: z.string(),
  company: z.string(),
  status: z.enum(projectStatusValues),
  recruitmentStage: z.enum(projectRecruitmentStageValues),
  stage: z.enum(projectStageValues),
  startDate: z.number(),
  endDate: z.number(),
  ownerId: uuidSchema,
  clientIds: uuidSchema.array(),
  researcherIds: uuidSchema.array(),
  language: z.string().array(),
  interpretedLanguage: z.string().array(),
  respondentCount: z.number(),
  incentive: z.object({ amount: z.number(), currency: z.string() }),
});

export const recruitmentProjectSchema = baseProjectSchema.extend({
  type: z.enum(projectTypeValues).extract(["recruitment"]),
  backupRespondentCount: z.number(),
});

export const surveyProjectSchema = baseProjectSchema.extend({
  type: z.enum(projectTypeValues).extract(["survey"]),
});

export const focusGroupProjectSchema = baseProjectSchema.extend({
  type: z.enum(projectTypeValues).extract(["focusGroup"]),
  observerIds: uuidSchema.array(),
  moderatorIds: uuidSchema.array(),
  backupRespondentCount: z.number(),
  isRemote: z.boolean(),
});

export const userInterviewProjectSchema = baseProjectSchema.extend({
  type: z.enum(projectTypeValues).extract(["userInterview"]),
  observerIds: uuidSchema.array(),
  moderatorIds: uuidSchema.array(),
  backupRespondentCount: z.number(),
  isRemote: z.boolean(),
});

export const moderatedTestingProjectSchema = baseProjectSchema.extend({
  type: z.enum(projectTypeValues).extract(["moderatedTesting"]),
  observerIds: uuidSchema.array(),
  moderatorIds: uuidSchema.array(),
  backupRespondentCount: z.number(),
  isRemote: z.boolean(),
  deviceType: z.enum(projectDeviceTypeValues).array(),
});

export const unmoderatedTestingProjectSchema = baseProjectSchema.extend({
  type: z.enum(projectTypeValues).extract(["unmoderatedTesting"]),
  deviceType: z.enum(projectDeviceTypeValues).array(),
});

export const projectMetaSchema = baseProjectSchema.and(
  z.discriminatedUnion("type", [
    z.object({
      type: z.enum(projectTypeValues).extract(["recruitment"]),
      backupRespondentCount: z.number(),
    }),
    z.object({
      type: z.enum(projectTypeValues).extract(["survey"]),
    }),
    z.object({
      type: z.enum(projectTypeValues).extract(["focusGroup"]),
      observerIds: uuidSchema.array(),
      moderatorIds: uuidSchema.array(),
      backupRespondentCount: z.number(),
      isRemote: z.boolean(),
    }),
    z.object({
      type: z.enum(projectTypeValues).extract(["userInterview"]),
      observerIds: uuidSchema.array(),
      moderatorIds: uuidSchema.array(),
      backupRespondentCount: z.number(),
      isRemote: z.boolean(),
    }),
    z.object({
      type: z.enum(projectTypeValues).extract(["moderatedTesting"]),
      observerIds: uuidSchema.array(),
      moderatorIds: uuidSchema.array(),
      backupRespondentCount: z.number(),
      isRemote: z.boolean(),
      deviceType: z.enum(projectDeviceTypeValues).array(),
    }),
    z.object({
      type: z.enum(projectTypeValues).extract(["unmoderatedTesting"]),
      deviceType: z.enum(projectDeviceTypeValues).array(),
    }),
  ]),
);

export const eventSchema = z.object({
  partition: uuidSchema,
  sort: z.string().refine((s): s is `event#${UUID}` => {
    const [prefix, id] = s.split("#");
    return prefix === "event" && isUuid(id);
  }),
  createdAt: z.number(),
  updatedAt: z.number(),
  surveyId: uuidSchema,
  fulfilledCriteria: z.number(),
  hasConfirmedSchedule: z.number(),
  discussionGuideId: uuidSchema,
  testerPool: z.boolean(),
  prototypeLinkList: z.array(z.string()),
  consentForm: uuidSchema.optional(),
});

export const sessionSchema = z.object({
  partition: uuidSchema,
  sort: z.string().refine((s): s is `session#${UUID}` => {
    const [prefix, id] = s.split("#");
    return prefix === "session" && isUuid(id);
  }),
  createdAt: z.number(),
  updatedAt: z.number(),
  eventId: uuidSchema,
  userId: uuidSchema,
  observerIds: uuidSchema.array(),
  transactionId: uuidSchema.optional(),
  startTime: z.number(),
  duration: z.number(),
  changeRequested: z.boolean(),
  videoRecording: z
    .object({
      id: uuidSchema,
      published: z.boolean(),
    })
    .optional(),
  sentimentAnalysis: z
    .object({
      id: uuidSchema,
      published: z.boolean(),
    })
    .optional(),
  guestLinkIds: uuidSchema.array(),
});
