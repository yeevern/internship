import { randomUUID } from "crypto";
import { add, set } from "date-fns";
import { batchDeleteItems, getAwsClients } from "@netizen/utils-aws";
import { getEnvironmentValue } from "@netizen/utils-env";
import {
  activateEvent,
  createEvent,
  deactivateEvent,
  getEvent,
  getEventSession,
  listEvents,
  updateEvent,
  updateEventSession,
} from "./admin";
import { getFreeSessions, registerForSession, requestSessionChange } from "./user";

const projectId = randomUUID();
const userId = randomUUID();

function generateSessions(value: number) {
  const sessions = [];
  const start = set(add(Date.now(), { days: 2 }), { hours: 9, minutes: 0, seconds: 0, milliseconds: 0 });
  for (let i = 0; i < value; i++) {
    sessions.push({
      duration: 60 * 3,
      timeslot: add(start, { hours: Math.floor(i / 2) * 24 + (i % 2) * 5 }).getTime(),
    });
  }
  return sessions;
}
const numberOfSessions = 30;

describe("Create Event", () => {
  it("Create event", async () => {
    await createEvent({
      projectId,
      startDate: Date.now(),
      endDate: Date.now(),
      status: "active",
      sessions: generateSessions(numberOfSessions),
    });
  });
});

describe("Event Related Test", () => {
  it("Events", async () => {
    const event = await getEvent({ projectId });
    expect(event).toBeDefined();
    expect(event.projectId).toBe(projectId);
    expect(event.sessions.length).toBe(numberOfSessions);
    const session = event.sessions[0];
    const geSessionResponse = await getEventSession({ projectId, sessionId: session.sessionId });
    expect(geSessionResponse).toBeDefined();
    expect(geSessionResponse.sessionId).toBe(session.sessionId);
    const endDate = add(Date.now(), { days: 2 }).getTime();
    const duration = 60;
    await updateEvent({ projectId, endDate });
    await updateEventSession({
      projectId,
      sessionId: session.sessionId,
      duration,
    });
    await deactivateEvent({ projectId });
    const updatedEvent = await getEvent({ projectId });
    expect(updatedEvent).toBeDefined();
    expect(updatedEvent.endDate).toBe(endDate);
    expect(updatedEvent.status).toBe("active");
    const updatedSessionResponse = await getEventSession({
      projectId,
      sessionId: session.sessionId,
    });
    expect(updatedSessionResponse).toBeDefined();
    expect(updatedSessionResponse.duration).toBe(duration);
    await activateEvent({ projectId });
  });

  it("List event", async () => {
    const events = await listEvents();
    expect(events).toBeDefined();
    expect(events.length).toBeGreaterThan(0);
  });
});

describe("User interaction", () => {
  it("User session", async () => {
    let freeSessions = await getFreeSessions({ projectId });
    expect(freeSessions).toBeDefined();
    expect(freeSessions.length).toBe(numberOfSessions);
    await registerForSession({ projectId, sessionId: freeSessions[0].sessionId, userId });
    await requestSessionChange({ projectId, sessionId: freeSessions[0].sessionId, userId });
    freeSessions = await getFreeSessions({ projectId });
    expect(freeSessions).toBeDefined();
    expect(freeSessions.length).toBe(numberOfSessions - 1);
    const event = await getEvent({ projectId });
    expect(event).toBeDefined();
    const userSession = event.sessions.find((session) => session.userId === userId);
    expect(userSession).toBeDefined();
    expect(userSession?.change).toBe(true);
    expect(userSession?.userId).toBe(userId);
  });
});

afterAll(async () => {
  const event = await getEvent({ projectId });
  const keys = [];
  keys.push({ projectId, sort: "meta" });
  event.sessions.forEach((session) => keys.push({ projectId, sort: session.sessionId }));
  await batchDeleteItems({
    client: getAwsClients().dynamo,
    tableName: getEnvironmentValue("DYNAMO_EVENTS"),
    keys,
  });
});
