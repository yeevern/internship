import { type UUID } from "crypto";
import { PencilSimple } from "@phosphor-icons/react/dist/ssr";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@netizen/ui/server";
import { listEventEntry } from "./action";

export async function EventList({ projectId }: { projectId: UUID }) {
  const eventList = (await listEventEntry(projectId))
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map((event) => ({
      eventId: event.eventId,
      attributes: {
        "Created at": format(event.createdAt, "yyyy-MM-dd HH:mm:ss"),
        "Updated at": format(event.updatedAt, "yyyy-MM-dd HH:mm:ss"),
        Survey: event.surveyId,
        "Discussion Guide": event.discussionGuideId,
        "Tester Pool": event.testerPool ? "Nanikore Pool" : "Private Pool",
        "Prototype Links": event.prototypeLinkList.join(", "),
        "Consent Form": event.consentForm,
      },
    }));

  return (
    <>
      {eventList.map((event, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex justify-between">
              <CardTitle className="w-5/6">Event {index + 1}</CardTitle>
              <PencilSimple className="cursor-pointer" size={32} />
            </div>
            <CardDescription>Event ID: {event.eventId}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {Object.entries(event.attributes).map(([key, value]) => (
                  // @TODO: Link survey, discussion guide, prototype links and consent form to their field
                  <TableRow key={key}>
                    <TableCell className="text-right font-bold">{key}</TableCell>
                    <TableCell>{value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
