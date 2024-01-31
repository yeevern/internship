import { randomUUID } from "crypto";
import { isUuid } from "@netizen/utils-types";
import { createMeeting, Attendee, cancelMeeting, getAttendeeJoinInfo, getMeeting } from "./chime";

describe("nanikore chime", () => {
  it("Meeting Test", async () => {
    const sessionId = randomUUID();
    const userIds = [randomUUID(), randomUUID(), randomUUID()];
    const attendees: Attendee[] = userIds.map((userId, index) => ({
      id: userId,
      type: (() => {
        switch (index % 3) {
          case 1:
            return "Tester";
          case 2:
            return "Moderator";
          default:
            return "Observer";
        }
      })(),
    }));
    await createMeeting({ sessionId, attendees });

    let meetingInfo = await getMeeting({ sessionId });
    expect(meetingInfo).toBeDefined();
    expect(meetingInfo.sessionId).toEqual(sessionId);
    expect(meetingInfo.active).toBe(true);

    const tokens = await Promise.all(userIds.map((userId) => getAttendeeJoinInfo({ sessionId, userId })));
    expect(tokens).toHaveLength(userIds.length);

    tokens.forEach((token) => {
      console.log(token);
      expect(token.attendeeId).toBeDefined();

      expect(isUuid(token.attendeeId)).toBe(true);
      expect(token.token).toBeDefined();
    });

    await cancelMeeting({ sessionId });

    meetingInfo = await getMeeting({ sessionId });
    expect(meetingInfo).toBeDefined();
    expect(meetingInfo.sessionId).toEqual(sessionId);
    expect(meetingInfo.active).toBe(false);

    expect("chime").toEqual("chime");
  });
});
