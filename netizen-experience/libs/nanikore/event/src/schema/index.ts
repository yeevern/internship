import * as schemaCreateEvent from "./event/create.json";
import * as schemaUpdateEvent from "./event/update.json";
import * as schemaUpdateSession from "./session/update.json";

export const eventSchema = {
  event: {
    create: schemaCreateEvent,
    update: schemaUpdateEvent,
  },
  session: {
    update: schemaUpdateSession,
  },
};
