import { format } from "date-fns";
import { listEvents } from "@nanikore/libs-event";
import { RIGHTS } from "@nanikore/libs-user";
import { authCheck } from "@/auth";
import { CreateEvent } from "./create-event";
import { Projects } from "./projects";

export default async function Events() {
  await authCheck([RIGHTS.ADMIN]);
  const response = await listEvents();
  const projects = response.map((event) => ({
    projectId: event.projectId,
    active: event.status === "active",
    created: format(event.createdAt, "yyyy-MM-dd HH:mm"),
    start: format(event.startDate, "yyyy-MM-dd HH:mm"),
    end: format(event.endDate, "yyyy-MM-dd HH:mm"),
  }));
  return (
    <div className="divide-y divide-border">
      <section className="pb-16">
        <h2 className="mb-4 text-xl font-bold">Projects</h2>
        <Projects items={projects} />
      </section>
      <section className="py-16">
        <h2 className="mb-4 text-xl font-bold">Create Event</h2>
        <CreateEvent />
      </section>
    </div>
  );
}
