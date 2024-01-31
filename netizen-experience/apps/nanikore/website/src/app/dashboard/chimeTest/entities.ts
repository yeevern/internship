import { z } from "zod";

export const createMeetingSchema = z.object({
  sessionId: z.string().uuid(),
  attendees: z.object({
    moderator: z.string().uuid(),
    tester: z.string().uuid(),
    observer: z.string().uuid(),
  }),
});

export const getMeetingSchema = z.object({
  sessionId: z.string().uuid(),
});

export const getAttendeeJoinInfoSchema = z.object({
  sessionId: z.string().uuid(),
  userId: z.string().uuid(),
});
