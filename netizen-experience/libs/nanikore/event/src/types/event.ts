import type { UUID } from "crypto";

export type EventSessionId = `session#${UUID}`;

export type EventStatus = "active" | "inactive";

export interface EventSession {
  sessionId: EventSessionId;
  createdAt: number;
  updatedAt?: number;
  timeslot: number;
  duration: number;
  userId?: UUID;
  change?: boolean;
}

export interface Event {
  projectId: UUID;
  createdAt: number;
  updatedAt?: number;
  startDate: number;
  endDate: number;
  status: EventStatus;
  sessions: EventSession[];
}
