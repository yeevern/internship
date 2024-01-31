"use server";

import { type UUID } from "crypto";
import { EventFormType, createEvent, listEventsByProjectId } from "@nanikore/libs-project";

export async function createEventEntry(values: EventFormType) {
  return await createEvent(values);
}

export async function listEventEntry(projectId: UUID) {
  return await listEventsByProjectId(projectId);
}
