import type { UUID } from "crypto";
import { NextResponse } from "next/server";
import { routeApiHandler } from "@netizen/utils-next";
import { activateEvent } from "@nanikore/libs-event";
import { RIGHTS } from "@nanikore/libs-user";
import { AuthRouteCheck } from "@/auth";

export const GET = routeApiHandler<never, { projectId: UUID }>({
  async handler({ params: { projectId } }) {
    await AuthRouteCheck([RIGHTS.ADMIN]);
    await activateEvent({ projectId });
    return NextResponse.json({});
  },
});
