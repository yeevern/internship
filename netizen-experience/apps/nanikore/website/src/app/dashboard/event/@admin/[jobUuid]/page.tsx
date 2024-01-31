import type { UUID } from "crypto";
import { CaretLeft } from "@phosphor-icons/react/dist/ssr";
import { add, format } from "date-fns";
import Link from "next/link";
import { linkVariants, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@netizen/ui/server";
import { cn } from "@netizen/utils-ui";
import { getEvent } from "@nanikore/libs-event";
import { ActiveToggle } from "./active-toggle";
import UpdateEvent from "./update-event";
import UpdateSession from "./update-session";

export default async function EventDetails({ params: { projectId } }: { params: { projectId: UUID } }) {
  const event = await getEvent({ projectId });
  const details: [string, string | boolean][] = [
    ["Project ID", event.projectId],
    ["Date created", format(event.createdAt, "yyyy-MM-dd HH:mm")],
    ["Start date", format(event.startDate, "yyyy-MM-dd HH:mm")],
    ["End date", format(event.endDate, "yyyy-MM-dd HH:mm")],
    ["Number of sessions", event.sessions.length.toString()],
    ["Status", event.status === "active"],
  ];
  const sessions = event.sessions
    .sort((a, b) => (a.timeslot < b.timeslot ? -1 : a.timeslot > b.timeslot ? 1 : 0))
    .map((session) => ({
      sessionId: session.sessionId,
      date: format(session.timeslot, "EEE, dd/MM"),
      timeStart: format(session.timeslot, "HH:mm"),
      timeEnd: format(add(session.timeslot, { minutes: session.duration }), "HH:mm"),
      changeRequested: session.change,
      assignee: session.userId,
    }));

  return (
    <div>
      <Link className={cn(linkVariants(), "inline-flex items-baseline text-sm")} href="/dashboard/event">
        <CaretLeft size={12} className="mr-1" />
        Back to projects
      </Link>
      <div className="my-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">Event Details</h2>
        <div className="space-x-2">
          <UpdateEvent projectId={projectId} startDate={event.startDate} endDate={event.endDate} />
          <ActiveToggle projectId={projectId} active={event.status === "active"} />
        </div>
      </div>
      <ul className="max-w-xl space-y-1">
        {details.map(([label, value]) => (
          <li key={label} className="grid grid-cols-[1fr_2fr]">
            <span>{label}:</span>
            {label === "Status" ? (
              <span className={value ? "text-success-foreground" : "text-danger-foreground"}>
                {value ? "Active" : "Inactive"}
              </span>
            ) : label === "Project ID" ? (
              <span>
                <code>{value}</code>
              </span>
            ) : (
              <span>{value}</span>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <h3 className="mb-4 text-lg font-bold">Sessions</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-6 text-right">#</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time Slot</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map(({ assignee, changeRequested, date, sessionId, timeEnd, timeStart }, index) => (
              <TableRow key={sessionId} className="group">
                <TableCell className="w-6 text-right font-bold">{index + 1}</TableCell>
                <TableCell>{date}</TableCell>
                <TableCell>
                  {timeStart} - {timeEnd}
                </TableCell>
                <TableCell>{assignee ? <code>{assignee}</code> : "-"}</TableCell>
                <TableCell className="text-center">{changeRequested ? "Change requested" : "-"}</TableCell>
                <TableCell className="text-right">
                  <div className="invisible group-hover:visible">
                    <UpdateSession projectId={projectId} sessionId={sessionId} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
