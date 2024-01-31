import type { UUID } from "crypto";
import type { MediaPlacement } from "@aws-sdk/client-chime-sdk-meetings";

export interface ChimeMeta {
  sessionId: UUID;
  sort: "meta";
  meetingId: UUID;
  meetingArn: string;
  mediaPlacement: MediaPlacement;
  created: Date;
  active: boolean;
}

export interface ChimeAttendee {
  sessionId: UUID;
  sort: UUID;
  attendeeId: UUID;
  token: string;
}
