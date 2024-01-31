"use server";

import type { UUID } from "crypto";
import { z } from "zod";
import { BaseError } from "@netizen/utils-types";
import { AttendeeType, getAttendeeJoinInfo, createMeeting, getMeeting } from "@nanikore/libs-chime";
import { ServerActionState, handleServerActionError, updateServerActionSuccessState } from "@/utils/types";
import { getAttendeeJoinInfoSchema, createMeetingSchema, getMeetingSchema } from "./entities";

// Need to be called when the event is near. Otherwise the session is considered to be ended.
export async function createMeetingAction(
  state: ServerActionState<{
    sessionId: string;
  }>,
  data: z.infer<typeof createMeetingSchema>,
) {
  try {
    const validated = createMeetingSchema.safeParse(data);
    if (validated.success === false) throw new BaseError("Invalid data", { context: validated.error.flatten() });
    const { attendees, sessionId } = validated.data;
    await createMeeting({
      sessionId: sessionId as UUID,
      attendees: [
        { id: attendees.moderator as UUID, type: "Moderator" as AttendeeType },
        { id: attendees.observer as UUID, type: "Observer" as AttendeeType },
        { id: attendees.tester as UUID, type: "Tester" as AttendeeType },
      ],
    });
    updateServerActionSuccessState(state, { sessionId });
  } catch (ex) {
    handleServerActionError(state, ex);
  }
  return state;
}

export async function getMeetingInfoAction(
  state: ServerActionState<Awaited<ReturnType<typeof getMeeting>>>,
  data: z.infer<typeof getMeetingSchema>,
) {
  try {
    const validated = getMeetingSchema.safeParse(data);
    if (validated.success === false) throw new BaseError("Invalid data", { context: validated.error.flatten() });
    const { sessionId } = validated.data;
    const meetingInfo = await getMeeting({ sessionId: sessionId as UUID });
    updateServerActionSuccessState(state, meetingInfo);
  } catch (ex) {
    handleServerActionError(state, ex);
  }
  return state;
}

export async function getAttendeeJoinInfoAction(
  state: ServerActionState<Awaited<ReturnType<typeof getAttendeeJoinInfo>>>,
  data: z.infer<typeof getAttendeeJoinInfoSchema>,
) {
  try {
    const validated = getAttendeeJoinInfoSchema.safeParse(data);
    if (validated.success === false) throw new BaseError("Invalid data", { context: validated.error.flatten() });
    const { sessionId, userId } = validated.data;
    const joinInfo = await getAttendeeJoinInfo({ sessionId: sessionId as UUID, userId: userId as UUID });
    updateServerActionSuccessState(state, joinInfo);
  } catch (ex) {
    handleServerActionError(state, ex);
  }
  return state;
}
