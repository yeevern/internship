import type { UUID } from "crypto";
import { NextResponse } from "next/server";
import { routeApiHandler } from "@netizen/utils-next";
import { type EventSessionId, requestSessionChange } from "@nanikore/libs-event";
import { AuthRouteCheck } from "@/auth";

export const GET = routeApiHandler<never, { projectId: UUID; sessionId: EventSessionId }>({
  async handler({ params: { projectId, sessionId } }) {
    const { id: userId } = await AuthRouteCheck();
    await requestSessionChange({ projectId, sessionId, userId });
    return NextResponse.json({});
  },
});
