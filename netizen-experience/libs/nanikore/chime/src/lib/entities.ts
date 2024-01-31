import { z } from "zod";
import { uuidSchema } from "@netizen/utils-types";

export const chimeMetaEntity = z.object({
  sessionId: uuidSchema,
  sort: z.literal("meta"),
  meetingId: uuidSchema,
  meetingArn: z.string(),
  mediaPlacement: z.object({
    AudioFallbackUrl: z.string(),
    AudioHostUrl: z.string(),
    EventIngestionUrl: z.string(),
    ScreenDataUrl: z.string(),
    ScreenSharingUrl: z.string(),
    ScreenViewingUrl: z.string(),
    SignalingUrl: z.string(),
    TurnControlUrl: z.string(),
  }),
  created: z.number(),
  active: z.boolean(),
});

export const chimeAttendeeEntity = z.object({
  sessionId: uuidSchema,
  sort: uuidSchema,
  attendeeId: uuidSchema,
  token: z.string(),
});
