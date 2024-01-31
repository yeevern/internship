import type { UUID } from "crypto";

export interface Session {
  projectId: UUID;
  sessionId: UUID;
  createdAt: number;
  updatedAt: number;
  eventId: UUID;
  userId: UUID;
  observerIds: UUID[];
  transactionId?: UUID;
  startTime: number;
  duration: number;
  changeRequested: boolean;
  videoRecording?: { id: UUID; published: boolean };
  sentimentAnalysis?: { id: UUID; published: boolean };
  guestLinkIds: UUID[];
}
