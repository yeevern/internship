import type { UUID } from "crypto";
import type { EventSessionId, EventStatus } from "./event";

export interface DbEvent {
  projectId: UUID;
  sort: string;
  createdAt: number;
  updatedAt?: number;
  startDate?: number;
  endDate?: number;
  status?: EventStatus;
  timeslot?: number;
  duration?: number;
  userId?: UUID;
  change?: boolean;
}

export interface DbEventMeta {
  projectId: UUID;
  sort: "meta";
  createdAt: number;
  updatedAt?: number;
  startDate: number;
  endDate: number;
  status: EventStatus;
}

export interface DbEventSession {
  projectId: UUID;
  sort: EventSessionId;
  createdAt: number;
  updatedAt?: number;
  timeslot: number;
  duration: number;
  userId?: UUID;
  change?: boolean;
}
