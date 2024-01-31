import type { UUID } from "crypto";
import {
  AttendeeCapabilities,
  CreateMeetingWithAttendeesCommand,
  DeleteMeetingCommand,
} from "@aws-sdk/client-chime-sdk-meetings";
import { chimeLibConfiguration } from "../init";
import { chimeAttendeeEntity, chimeMetaEntity } from "./entities";

const attendeeType = ["Moderator", "Tester", "Observer"] as const;
export type AttendeeType = (typeof attendeeType)[number];

export interface Attendee {
  id: UUID;
  type: AttendeeType;
}

export interface CreateMeetingParams {
  sessionId: UUID;
  attendees: Attendee[];
}

function resolveCapabilities(type: AttendeeType): AttendeeCapabilities {
  switch (type) {
    case "Moderator":
      return {
        Audio: "SendReceive",
        Video: "SendReceive",
        Content: "SendReceive",
      };
    case "Tester":
      return {
        Audio: "SendReceive",
        Video: "Send",
        Content: "Send",
      };
    case "Observer":
      return {
        Audio: "Receive",
        Video: "Receive",
        Content: "Receive",
      };
  }
}

export async function getMeeting({ sessionId }: { sessionId: UUID }) {
  const {
    config: { chimeTable },
  } = chimeLibConfiguration;
  const item = await chimeTable.get({
    schema: chimeMetaEntity,
    keys: {
      sessionId,
      sort: "meta",
    },
  });
  if (item === undefined) throw new Error("Meeting is undefined");
  return item;
}

export async function createMeeting({ attendees, sessionId }: CreateMeetingParams) {
  const {
    aws: { chime },
    config: { chimeTable, region },
  } = chimeLibConfiguration;
  const meta = await chimeTable.get({
    schema: chimeMetaEntity,
    keys: {
      sessionId,
      sort: "meta",
    },
  });
  if (meta !== undefined) throw new Error("Meeting already exists");
  const command = new CreateMeetingWithAttendeesCommand({
    ClientRequestToken: sessionId,
    MediaRegion: region,
    ExternalMeetingId: sessionId,
    Attendees: attendees.map(({ id, type }) => ({ ExternalUserId: id, Capabilities: resolveCapabilities(type) })),
  });
  const response = await chime.send(command);
  const { Attendees, Meeting } = response;
  // @TODO: Handle response error here
  if (Attendees === undefined) throw new Error("Attendees is undefined");
  if (Meeting === undefined) throw new Error("Meeting is undefined");
  await chimeTable.batchWrite({
    items: [
      {
        data: {
          sessionId,
          sort: "meta",
          meetingId: Meeting.MeetingId,
          meetingArn: Meeting.MeetingArn,
          mediaPlacement: Meeting.MediaPlacement,
          created: new Date().getTime(),
          active: true,
        },
        schema: chimeMetaEntity,
      },
      ...Attendees.map((attendee) => ({
        data: {
          sessionId,
          sort: attendee.ExternalUserId,
          attendeeId: attendee.AttendeeId,
          token: attendee.JoinToken,
        },
        schema: chimeAttendeeEntity,
      })),
    ],
  });
}

export async function cancelMeeting({ sessionId }: { sessionId: UUID }) {
  const {
    aws: { chime },
    config: { chimeTable },
  } = chimeLibConfiguration;
  const item = await chimeTable.get({
    schema: chimeMetaEntity,
    keys: {
      sessionId,
      sort: "meta",
    },
  });
  if (item === undefined) throw new Error("Meeting is undefined");
  const meetingId = item.meetingId;
  const command = new DeleteMeetingCommand({ MeetingId: meetingId });
  await chimeTable.update({
    schema: chimeMetaEntity,
    attributes: {
      sessionId,
      sort: "meta",
      active: false,
    },
  });
  await chime.send(command);
}

export async function getAttendeeJoinInfo({ sessionId, userId }: { sessionId: UUID; userId: UUID }) {
  const {
    config: { chimeTable },
  } = chimeLibConfiguration;
  const attendee = await chimeTable.get({
    schema: chimeAttendeeEntity,
    keys: {
      sessionId,
      sort: userId,
    },
  });
  if (attendee === undefined) throw new Error("Attendee is undefined");
  const { attendeeId, token } = attendee;
  return {
    attendeeId,
    token,
  };
}
