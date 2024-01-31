import type { UUID } from "crypto";
import { queryAll } from "@netizen/utils-aws";
import { isTypeOf } from "@netizen/utils-types";
import { initEventLib } from "../init";
import type { DbEventSession } from "../types/db";
import type { EventSession, EventSessionId } from "../types/event";
import { getEvent, getEventSession, updateEventSession } from "./admin";

export async function getFreeSessions({ projectId }: { projectId: UUID }) {
  const event = await getEvent({ projectId });
  return event.sessions.filter((session) => !session.userId);
}

export async function requestSessionChange({
  projectId,
  sessionId,
  userId,
}: {
  projectId: UUID;
  sessionId: EventSessionId;
  userId: UUID;
}) {
  const session = await getEventSession({ projectId, sessionId });
  if (session.userId !== userId) throw new Error("Event - Session does not belong to user");
  if (session.change) throw new Error("Event - User already requested for change");
  await updateEventSession({
    projectId: projectId,
    sessionId: sessionId,
    change: true,
  });
}

export async function registerForSession({
  projectId,
  sessionId,
  userId,
}: {
  projectId: UUID;
  sessionId: EventSessionId;
  userId: UUID;
}) {
  const session = await getEventSession({ projectId, sessionId });
  if (session.userId) throw new Error("Event - Session already taken");
  try {
    await getUserSession({ projectId, userId });
    throw new Error("Event - User already registered for a session");
  } catch (ex) {
    if (ex instanceof Error) {
      if (ex.message !== "Event - Session not found") throw ex;
    } else throw ex;
  }
  await updateEventSession({
    projectId,
    sessionId,
    userId,
  });
}

export async function getUserSession({ projectId, userId }: { projectId: UUID; userId: UUID }) {
  const {
    aws: { dynamo: client },
    config: { tableEvents: tableName },
  } = initEventLib();
  const response = await queryAll({
    client,
    tableName,
    indexName: "userIdLSI",
    keys: { projectId, userId },
  });
  const item = response[0];
  if (isTypeOf<DbEventSession>(item, (arg) => arg.sort.startsWith("session#"))) {
    const session: EventSession = {
      sessionId: item.sort,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      timeslot: item.timeslot,
      duration: item.duration,
      userId: item.userId,
      change: item.change,
    };
    return session;
  }
  throw new Error("Event - Session not found");
}
