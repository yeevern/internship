"use server";

import { Link, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@netizen/ui/server";
import { listDalleHistory } from "@internal/libs-prompt-hub";
import { checkSession } from "@/googleAuth/session";
import { toLocalDateTimeString } from "@/utils/types";

export default async function DalleHistoryPanel() {
  const session = await checkSession(["prompt"]);
  const items = await listDalleHistory({ id: session.id });
  return (
    <>
      <div>History</div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Prompt</TableHead>
            <TableHead>View</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(({ prompt, promptedId }) => (
            <TableRow key={promptedId}>
              <TableCell>{toLocalDateTimeString(new Date(promptedId))}</TableCell>
              <TableCell>{prompt}</TableCell>
              <TableCell>
                <Link href={`/prompthub/dall-e/history/${promptedId}`}>Details</Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
