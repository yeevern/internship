import { randomUUID, type UUID } from "crypto";
import { PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { batchWriteItems, generateUpdateExpression, getItem, queryAll } from "@netizen/utils-aws";
import { isTypeOf, RequiredBy } from "@netizen/utils-types";
import { initEventLib } from "../init";
import { DbEvent, DbEventMeta, DbEventSession } from "../types/db";
import { Event, EventSession, EventSessionId, EventStatus } from "../types/event";

export async function listEvents() {
  const {
    aws: { dynamo: client },
    config: { tableEvents: tableName },
  } = initEventLib();
  const events: Event[] = [];
  const items = await queryAll<DbEvent>({
    client,
    tableName,
    indexName: "metaGSI",
    keys: { sort: "meta" },
  });
  if (isTypeOf<DbEventMeta[]>(items, (arg) => arg.every((item) => item.sort === "meta")))
    items.forEach((item) => {
      events.push({
        projectId: item.projectId,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        startDate: item.startDate,
        endDate: item.endDate,
        status: item.status,
        sessions: [],
      });
    });
  return events;
}

export async function getEvent({ projectId }: { projectId: UUID }) {
  const {
    aws: { dynamo: client },
    config: { tableEvents: tableName },
  } = initEventLib();
  const eventItems = await queryAll<DbEvent>({
    client,
    tableName,
    keys: { projectId },
  });
  if (eventItems.length === 0) throw new Error("Event - Event not found");
  const event = eventItems.reduce<Event>(
    (result, item) => {
      if (isTypeOf<DbEventMeta, DbEvent>(item, (arg) => arg.sort === "meta")) {
        result.projectId = item.projectId;
        result.createdAt = item.createdAt;
        result.updatedAt = item.updatedAt;
        result.startDate = item.startDate;
        result.endDate = item.endDate;
        result.status = item.status;
      } else if (isTypeOf<DbEventSession, DbEvent>(item, (arg) => arg.sort.startsWith("session#"))) {
        result.sessions.push({
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          sessionId: item.sort,
          timeslot: item.timeslot,
          duration: item.duration,
          userId: item.userId,
          change: item.change,
        });
      }
      return result;
    },
    {
      projectId: "----",
      createdAt: 0,
      startDate: 0,
      endDate: 0,
      status: "inactive",
      sessions: [],
    },
  );
  return event;
}

export async function getEventSession({ projectId, sessionId }: { projectId: UUID; sessionId: EventSessionId }) {
  const {
    aws: { dynamo: client },
    config: { tableEvents: tableName },
  } = initEventLib();
  const item = await getItem<DbEvent>({
    client,
    tableName,
    keys: { projectId, sort: sessionId },
  });
  if (item === null) throw new Error("Event - Session not found");
  else if (isTypeOf<DbEventSession, DbEvent>(item, (arg) => arg.sort.startsWith("session#"))) {
    const session: EventSession = {
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      sessionId: item.sort,
      timeslot: item.timeslot,
      duration: item.duration,
      userId: item.userId,
      change: item.change,
    };
    return session;
  }
  throw new Error("Event - Session is invalid");
}

async function updateEventMeta({ projectId, ...params }: RequiredBy<Omit<Event, "sessions">, "projectId">) {
  const {
    aws: { dynamo: client },
    config: { tableEvents: tableName },
  } = initEventLib();
  await client.send(
    new UpdateCommand({
      TableName: tableName,
      Key: { projectId, sort: "meta" },
      ...generateUpdateExpression({ ...params, updatedAt: Date.now() }),
    }),
  );
}

export async function createEvent(params: {
  projectId: UUID;
  startDate: number;
  endDate: number;
  status: EventStatus;
  sessions: { timeslot: number; duration: number }[];
}) {
  const {
    aws: { dynamo: client },
    config: { tableEvents: tableName },
  } = initEventLib();
  const now = Date.now();
  await Promise.all([
    client.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          projectId: params.projectId,
          sort: "meta",
          createdAt: now,
          startDate: params.startDate,
          endDate: params.endDate,
          status: params.status,
        },
      }),
    ),
    batchWriteItems<DbEventSession>({
      client,
      tableName,
      items: params.sessions.map((session) => ({
        projectId: params.projectId,
        sort: `session#${randomUUID()}`,
        createdAt: now,
        timeslot: session.timeslot,
        duration: session.duration,
      })),
    }),
  ]);
}

export async function updateEvent(params: { projectId: UUID; startDate?: number; endDate?: number }) {
  const {
    aws: { dynamo: client },
    config: { tableEvents: tableName },
  } = initEventLib();
  const eventItem = await getItem<DbEvent>({
    client,
    tableName,
    keys: { projectId: params.projectId, sort: "meta" },
  });
  if (eventItem === null) throw new Error("Event - Event not found");
  else if (isTypeOf<DbEventMeta, DbEvent>(eventItem, (arg) => arg.sort === "meta")) {
    const startDate = params.startDate ?? eventItem.startDate;
    const endDate = params.endDate ?? eventItem.endDate;
    await updateEventMeta({ ...params, startDate, endDate });
  }
}

export async function updateEventSession({
  projectId,
  sessionId,
  ...params
}: { projectId: UUID } & RequiredBy<EventSession, "sessionId">) {
  const {
    aws: { dynamo: client },
    config: { tableEvents: tableName },
  } = initEventLib();
  await client.send(
    new UpdateCommand({
      TableName: tableName,
      Key: { projectId, sort: sessionId },
      ...generateUpdateExpression({ ...params, updatedAt: Date.now() }),
    }),
  );
}

export async function activateEvent({ projectId }: { projectId: UUID }) {
  await updateEventMeta({ projectId, status: "active" });
}

export async function deactivateEvent({ projectId }: { projectId: UUID }) {
  await updateEventMeta({ projectId, status: "inactive" });
}
