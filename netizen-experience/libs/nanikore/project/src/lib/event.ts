import { randomUUID, type UUID } from "crypto";
import {
  generatePrefixedKey,
  parsePrefixedKey,
  unsafe__create,
  unsafe__query,
  unsafe__remove,
  unsafe__update,
} from "@netizen/utils-aws";
import { RequiredBy } from "@netizen/utils-types";
import { initProjectLib } from "../init";
import { Event, EventFormType } from "../types/event";
import { eventSchema } from "./entities";

// Create new event under a project
// @TODO: include respondent criteria
export async function createEvent(values: EventFormType) {
  const {
    aws: { dynamo: client },
    config: { projectsTable: table },
  } = initProjectLib();

  const id = randomUUID();
  const { projectId, ...attributes } = values;
  await unsafe__create({
    client,
    table,
    schema: eventSchema,
    item: {
      partition: projectId,
      sort: generatePrefixedKey("event", id),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      fulfilledCriteria: 0,
      hasConfirmedSchedule: 0,
      ...attributes,
    },
  });
  return { id };
}

// Get all events for a given projectId
export async function listEventsByProjectId(projectId: UUID) {
  const {
    aws: { dynamo: client },
    config: { projectsTable: table },
  } = initProjectLib();
  const events = await unsafe__query({
    client,
    table,
    keyConditionExpression: "#partition = :partition AND begins_with(#sort, :sort)",
    attributes: { partition: projectId, sort: "event#" },
    schema: eventSchema,
  });
  return events.map<Event>((event) => ({
    projectId: event.partition,
    eventId: parsePrefixedKey("event", event.sort),
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
    surveyId: event.surveyId,
    fulfilledCriteria: event.fulfilledCriteria,
    hasConfirmedSchedule: event.hasConfirmedSchedule,
    discussionGuideId: event.discussionGuideId,
    testerPool: event.testerPool,
    prototypeLinkList: event.prototypeLinkList,
    consentForm: event.consentForm,
  }));
}

// Get event details for a given eventId
export async function getEventbyId({ eventId, projectId }: { eventId: UUID; projectId: UUID }) {
  try {
    const {
      aws: { dynamo: client },
      config: { projectsTable: table },
    } = initProjectLib();
    const [eventDetail] = await unsafe__query({
      client,
      table,
      attributes: { partition: projectId, sort: generatePrefixedKey("event", eventId) },
      schema: eventSchema,
    });
    if (eventDetail === undefined) throw new Error("Event not found");

    const event: Event = {
      projectId: projectId,
      eventId: eventId,
      createdAt: eventDetail.createdAt,
      updatedAt: eventDetail.updatedAt,
      surveyId: eventDetail.surveyId,
      fulfilledCriteria: eventDetail.fulfilledCriteria,
      hasConfirmedSchedule: eventDetail.hasConfirmedSchedule,
      discussionGuideId: eventDetail.discussionGuideId,
      testerPool: eventDetail.testerPool,
      prototypeLinkList: eventDetail.prototypeLinkList,
      consentForm: eventDetail.consentForm,
    };
    return event;
  } catch (e) {
    if (e instanceof TypeError) throw new Error("Invalid event");
    throw new Error("Unknown error");
  }
}

type UpdateEventParams = Omit<RequiredBy<Event, "eventId" | "projectId">, "updatedAt" | "createdAt">;

// Update existing event
export async function updateEvent(params: UpdateEventParams) {
  const {
    aws: { dynamo: client },
    config: { projectsTable: table },
  } = initProjectLib();
  const { eventId, projectId, ...attributes } = params;
  const dbEventId = generatePrefixedKey("event", eventId);

  const [event] = await unsafe__query({
    client,
    table,
    schema: eventSchema,
    attributes: { partition: projectId, sort: dbEventId },
  });

  if (event === undefined) throw new Error("Event not found");

  await unsafe__update({
    client,
    table,
    schema: eventSchema,
    attributes: {
      partition: projectId,
      sort: dbEventId,
      updatedAt: Date.now(),
      ...attributes,
    },
  });

  return { eventId };
}

// Delete event by id
export async function deleteEvent({ eventId, projectId }: { eventId: UUID; projectId: UUID }) {
  const {
    aws: { dynamo: client },
    config: { projectsTable: table },
  } = initProjectLib();
  const dbEventId = generatePrefixedKey("event", eventId);

  const [event] = await unsafe__query({
    client,
    table,
    attributes: { partition: projectId, sort: dbEventId },
    schema: eventSchema,
  });
  if (event === undefined) throw new Error("Event not found");

  await unsafe__remove({
    client,
    table,
    keys: { partition: projectId, sort: dbEventId },
  });

  return {};
}
