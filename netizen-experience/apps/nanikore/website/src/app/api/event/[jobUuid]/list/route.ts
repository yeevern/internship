import type { UUID } from "crypto";
import { NextResponse } from "next/server";
import { routeApiHandler } from "@netizen/utils-next";
import { getFreeSessions } from "@nanikore/libs-event";
import { AuthRouteCheck } from "@/auth";

export const GET = routeApiHandler<never, { projectId: UUID }>({
  async handler({ params: { projectId } }) {
    await AuthRouteCheck();
    return NextResponse.json(await getFreeSessions({ projectId }));
  },
});
