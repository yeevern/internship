import type { UUID } from "crypto";

export interface EventFormType {
  projectId: UUID;
  surveyId: UUID;
  discussionGuideId: UUID;
  testerPool: boolean;
  prototypeLinkList: string[];
  consentForm?: UUID;
}

export interface Event extends EventFormType {
  eventId: UUID;
  createdAt: number;
  updatedAt: number;
  // @TODO: respondentCriteria - TBD
  fulfilledCriteria: number;
  hasConfirmedSchedule: number;
}
