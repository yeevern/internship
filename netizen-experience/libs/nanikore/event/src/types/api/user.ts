import type { UUID } from "crypto";

export interface SessionResponse {
  userId?: UUID;
  sessionId: string;
  change: boolean;
  timeslot: string;
  duration: number;
}

export type ListSessionsResponse = SessionResponse[];
