import type { UUID } from "crypto";
import { NextResponse } from "next/server";
import { routeApiHandler, routeApiHandlerWithSchema } from "@netizen/utils-next";
import { EventUpdateRequest, eventSchema, getEvent, updateEvent } from "@nanikore/libs-event";
import { RIGHTS } from "@nanikore/libs-user";
import { AuthRouteCheck } from "@/auth";

export const GET = routeApiHandler<never, { projectId: UUID }>({
  async handler({ params: { projectId } }) {
    await AuthRouteCheck([RIGHTS.ADMIN]);
    return NextResponse.json(await getEvent({ projectId }));
  },
});

export const POST = routeApiHandlerWithSchema<EventUpdateRequest, { projectId: UUID }>({
  schema: eventSchema.event.update,
  async handler({ body, params: { projectId } }) {
    await AuthRouteCheck([RIGHTS.ADMIN]);
    await updateEvent({
      projectId,
      startDate: body.startDate,
      endDate: body.endDate,
    });
    return NextResponse.json({});
  },
});
