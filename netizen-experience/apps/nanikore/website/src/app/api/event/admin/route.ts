import { NextResponse } from "next/server";
import { routeApiHandler, routeApiHandlerWithSchema } from "@netizen/utils-next";
import { EventCreateRequest, createEvent, eventSchema, listEvents } from "@nanikore/libs-event";
import { RIGHTS } from "@nanikore/libs-user";
import { AuthRouteCheck } from "@/auth";

export const GET = routeApiHandler({
  async handler() {
    await AuthRouteCheck([RIGHTS.ADMIN]);
    return NextResponse.json(await listEvents());
  },
});

export const POST = routeApiHandlerWithSchema<EventCreateRequest, never>({
  schema: eventSchema.event.create,
  async handler({ body }) {
    await AuthRouteCheck([RIGHTS.ADMIN]);
    await createEvent({
      projectId: body.projectId,
      startDate: body.startDate,
      endDate: body.endDate,
      status: body.status,
      sessions: body.sessions.map((session) => ({
        duration: session.duration,
        timeslot: session.timeslot,
      })),
    });
    return NextResponse.json({});
  },
});
