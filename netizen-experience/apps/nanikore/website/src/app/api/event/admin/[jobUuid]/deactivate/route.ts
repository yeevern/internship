import type { UUID } from "crypto";
import { NextResponse } from "next/server";
import { routeApiHandler } from "@netizen/utils-next";
import { deactivateEvent } from "@nanikore/libs-event";
import { RIGHTS } from "@nanikore/libs-user";
import { AuthRouteCheck } from "@/auth";

export const GET = routeApiHandler<never, { projectId: UUID }>({
  async handler({ params: { projectId } }) {
    await AuthRouteCheck([RIGHTS.ADMIN]);
    await deactivateEvent({ projectId });
    return NextResponse.json({});
  },
});
