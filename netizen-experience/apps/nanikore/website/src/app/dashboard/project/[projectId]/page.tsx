import { type UUID } from "crypto";
import { RIGHTS } from "@nanikore/libs-user";
import { authCheck } from "@/auth";
import CreateEvent from "./create-event";
import { EventList } from "./events-list";

export default async function ProjectDetail({ params }: { params: { projectId: UUID } }) {
  await authCheck([RIGHTS.ADMIN]);

  return (
    <>
      <h1>Project Detail of Project ID: {params.projectId}</h1>
      <CreateEvent projectId={params.projectId} />
      <EventList projectId={params.projectId} />
    </>
  );
}
