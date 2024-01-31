import type { UUID } from "crypto";
import type { EventStatus } from "../event";

export interface EventSessionCreateRequest {
  timeslot: number;
  duration: number;
}

export interface EventCreateRequest {
  projectId: UUID;
  startDate: number;
  endDate: number;
  status: EventStatus;
  sessions: EventSessionCreateRequest[];
}

export interface EventUpdateRequest {
  startDate: number;
  endDate: number;
}

export interface EventResponse {
  projectId: string;
  created: string;
  start: string;
  end: string;
  active: boolean;
}

export interface EventSessionResponse {
  sessionId: string;
  userId?: UUID;
  timeslot: string;
  duration: number;
  change: boolean;
}

export interface EventWithSessionsResponse extends EventResponse {
  sessions: EventSessionResponse[];
}

export interface SessionUpdateRequest {
  timeslot?: number;
  duration?: number;
  change?: boolean;
  userId?: UUID;
}
