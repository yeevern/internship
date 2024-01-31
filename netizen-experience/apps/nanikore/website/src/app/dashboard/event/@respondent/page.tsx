import { add, format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@netizen/ui/server";
import { getFreeSessions, getUserSession } from "@nanikore/libs-event";
import { authCheck } from "../../../../auth";
import RegisterSession from "./register-session";
import RequestChange from "./request-change";

const PROJECT_ID = "aa35529d-94a4-4978-84e6-490ce682ae25";

export default async function Events() {
  const {
    user: { id: userId },
  } = await authCheck();

  const [freeSessionsResponse, registeredSession] = await Promise.all([
    getFreeSessions({ projectId: PROJECT_ID }),
    getUserSession({ projectId: PROJECT_ID, userId }).catch(() => null),
  ]);
  const registeredSessionDetails: [string, string][] = [];
  if (registeredSession !== null) {
    registeredSessionDetails.push(
      ["Project ID", PROJECT_ID],
      ["Session ID", registeredSession.sessionId],
      ["Date", format(registeredSession.timeslot, "yyyy-MM-dd")],
      [
        "Time slot",
        `${format(registeredSession.timeslot, "h:mm a")} - ${format(
          add(registeredSession.timeslot, { minutes: registeredSession.duration }),
          "h:mm a",
        )}`,
      ],
    );
  }

  const sessions = freeSessionsResponse
    .sort((a, b) => (a.timeslot < b.timeslot ? -1 : a.timeslot > b.timeslot ? 1 : 0))
    .map((session) => ({
      sessionId: session.sessionId,
      date: format(session.timeslot, "EEE, dd/MM"),
      timeStart: format(session.timeslot, "HH:mm"),
      timeEnd: format(add(session.timeslot, { minutes: session.duration }), "HH:mm"),
    }));

  return (
    <section>
      <h2 className="mb-4 text-xl font-bold">{registeredSession ? "My Session" : "Available Sessions"}</h2>
      {registeredSession ? (
        <>
          <ul className="mb-4 max-w-xl space-y-1">
            {registeredSessionDetails.map(([label, value]) => (
              <li key={label} className="grid grid-cols-[1fr_2fr]">
                <span>{label}:</span>
                <span>{label.toLowerCase().endsWith("Id") ? <code>{value}</code> : value}</span>
              </li>
            ))}
          </ul>
          <RequestChange
            projectId={PROJECT_ID}
            sessionId={registeredSession.sessionId}
            changeRequested={registeredSession.change}
          />
        </>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-6 text-right">#</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time Slot</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map(({ date, sessionId, timeEnd, timeStart }, index) => (
              <TableRow key={sessionId} className="group">
                <TableCell className="w-6 text-right font-bold">{index + 1}</TableCell>
                <TableCell>{date}</TableCell>
                <TableCell>
                  {timeStart} - {timeEnd}
                </TableCell>
                <TableCell className="text-right">
                  <div className="invisible group-hover:visible">
                    <RegisterSession projectId={PROJECT_ID} sessionId={sessionId} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  );
}
