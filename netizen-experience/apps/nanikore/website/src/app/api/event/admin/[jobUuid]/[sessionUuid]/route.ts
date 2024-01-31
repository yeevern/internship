import type { UUID } from "crypto";
import { NextResponse } from "next/server";
import { routeApiHandler, routeApiHandlerWithSchema } from "@netizen/utils-next";
import {
  EventSessionId,
  SessionUpdateRequest,
  eventSchema,
  getEventSession,
  updateEventSession,
} from "@nanikore/libs-event";
import { RIGHTS } from "@nanikore/libs-user";
import { AuthRouteCheck } from "@/auth";

export const GET = routeApiHandler<never, { projectId: UUID; sessionId: EventSessionId }>({
  async handler({ params: { projectId, sessionId } }) {
    await AuthRouteCheck([RIGHTS.ADMIN]);
    return NextResponse.json(await getEventSession({ projectId, sessionId }));
  },
});

export const POST = routeApiHandlerWithSchema<SessionUpdateRequest, { projectId: UUID; sessionId: EventSessionId }>({
  schema: eventSchema.session.update,
  async handler({ body, params: { projectId, sessionId } }) {
    await AuthRouteCheck([RIGHTS.ADMIN]);
    await updateEventSession({
      projectId,
      sessionId,
      change: body.change,
      duration: body.duration,
      timeslot: body.timeslot,
      userId: body.userId,
    });
    return NextResponse.json({});
  },
});
