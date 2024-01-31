import { randomUUID, type UUID } from "crypto";
import {
  generatePrefixedKey,
  parsePrefixedKey,
  unsafe__create,
  unsafe__query,
  unsafe__remove,
  unsafe__update,
} from "@netizen/utils-aws";
import { PartialBy, RequiredBy } from "@netizen/utils-types";
import { initProjectLib } from "../init";
import { Session } from "../types/session";
import { sessionSchema } from "./entities";

type CreateSessionAttribute = Pick<
  Session,
  "projectId" | "eventId" | "userId" | "startTime" | "duration" | "observerIds" | "guestLinkIds"
>;
type CreateSessionParam = PartialBy<CreateSessionAttribute, "observerIds" | "guestLinkIds">;
type UpdateSessionParam = Omit<
  RequiredBy<Session, "projectId" | "sessionId">,
  "createdAt" | "updatedAt" | "userId" | "eventId"
>;

// Create (schedule) new session
export async function createSession(params: CreateSessionParam) {
  const {
    aws: { dynamo: client },
    config: { projectsTable: table },
  } = initProjectLib();

  const id = randomUUID();

  await unsafe__create({
    client,
    table,
    schema: sessionSchema,
    item: {
      partition: params.projectId,
      sort: generatePrefixedKey("session", id),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      eventId: params.eventId,
      userId: params.userId,
      observerIds: params.observerIds ?? [],
      startTime: params.startTime,
      duration: params.duration,
      changeRequested: false,
      guestLinkIds: params.guestLinkIds ?? [],
    },
  });

  return { id };
}

// Get all sessions under a project for a given projectId
export async function listSessionsByProjectId(projectId: UUID) {
  const {
    aws: { dynamo: client },
    config: { projectsTable: table },
  } = initProjectLib();

  const sessions = await unsafe__query({
    client,
    table,
    keyConditionExpression: "#partition = :partition AND begins_with(#sort, :sort)",
    attributes: { partition: projectId, sort: "session#" },
    schema: sessionSchema,
    order: "ascending",
  });
  return sessions.map<Session>((session) => ({
    projectId: session.partition,
    sessionId: parsePrefixedKey("session", session.sort),
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    eventId: session.eventId,
    userId: session.userId,
    observerIds: session.observerIds,
    transactionId: session.transactionId,
    startTime: session.startTime,
    duration: session.duration,
    changeRequested: session.changeRequested,
    videoRecording: session.videoRecording,
    sentimentAnalysis: session.sentimentAnalysis,
    guestLinkIds: session.guestLinkIds,
  }));
}

// Get all session for a given eventId
export async function listSessionsByEventId(eventId: UUID) {
  const {
    aws: { dynamo: client },
    config: { projectsTable: table },
  } = initProjectLib();

  const sessions = await unsafe__query({
    client,
    table,
    indexName: "eventIdLSI",
    attributes: { eventId },
    schema: sessionSchema,
    order: "ascending",
  });
  return sessions.map<Session>((session) => ({
    projectId: session.partition,
    sessionId: parsePrefixedKey("session", session.sort),
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    eventId: session.eventId,
    userId: session.userId,
    observerIds: session.observerIds,
    transactionId: session.transactionId ?? undefined,
    startTime: session.startTime,
    duration: session.duration,
    changeRequested: session.changeRequested,
    videoRecording: session.videoRecording,
    sentimentAnalysis: session.sentimentAnalysis,
    guestLinkIds: session.guestLinkIds,
  }));
}

// Get session details for a given sessionId
export async function getSessionById({ projectId, sessionId }: { projectId: UUID; sessionId: UUID }) {
  try {
    const {
      aws: { dynamo: client },
      config: { projectsTable: table },
    } = initProjectLib();
    const [sessionDetail] = await unsafe__query({
      client,
      table,
      attributes: { partition: projectId, sort: generatePrefixedKey("session", sessionId) },
      schema: sessionSchema,
    });
    if (sessionDetail === undefined) throw new Error("Session not found");

    const session: Session = {
      projectId: sessionDetail.partition,
      sessionId: parsePrefixedKey("session", sessionDetail.sort),
      createdAt: sessionDetail.createdAt,
      updatedAt: sessionDetail.updatedAt,
      eventId: sessionDetail.eventId,
      userId: sessionDetail.userId,
      observerIds: sessionDetail.observerIds,
      transactionId: sessionDetail.transactionId ?? undefined,
      startTime: sessionDetail.startTime,
      duration: sessionDetail.duration,
      changeRequested: sessionDetail.changeRequested,
      videoRecording: sessionDetail.videoRecording,
      sentimentAnalysis: sessionDetail.sentimentAnalysis,
      guestLinkIds: sessionDetail.guestLinkIds,
    };
    return session;
  } catch (e) {
    if (e instanceof TypeError) throw new Error("Invalid session");
    throw new Error("Unknown error");
  }
}

// Update existing session
export async function updateSession(params: UpdateSessionParam) {
  const {
    aws: { dynamo: client },
    config: { projectsTable: table },
  } = initProjectLib();

  const { projectId, sessionId, ...attributes } = params;
  const dbSessionId = generatePrefixedKey("session", sessionId);
  const hasAttributeUpdates = Object.keys(attributes).length > 0;

  if (hasAttributeUpdates) {
    const [session] = await unsafe__query({
      client,
      table,
      attributes: { partition: projectId, sort: dbSessionId },
      schema: sessionSchema,
    });

    if (session === undefined) throw new Error("Session not found");

    await unsafe__update({
      client,
      table,
      schema: sessionSchema,
      attributes: {
        partition: projectId,
        sort: dbSessionId,
        updatedAt: Date.now(),
        ...attributes,
      },
    });
  }
  return { sessionId };
}

// Delete session by id
export async function deleteSession({ projectId, sessionId }: { projectId: UUID; sessionId: UUID }) {
  const {
    aws: { dynamo: client },
    config: { projectsTable: table },
  } = initProjectLib();
  const dbSessionId = generatePrefixedKey("session", sessionId);

  const [session] = await unsafe__query({
    client,
    table,
    attributes: { partition: projectId, sort: dbSessionId },
    schema: sessionSchema,
  });
  if (session === undefined) throw new Error("Event not found");

  await unsafe__remove({
    client,
    table,
    keys: { partition: projectId, sort: dbSessionId },
  });

  return {};
}
