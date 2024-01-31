"use server";

import { Link, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@netizen/ui/server";
import { listGptHistory } from "@internal/libs-prompt-hub";
import { checkSession } from "@/googleAuth/session";
import { toLocalDateTimeString } from "@/utils/types";

export default async function ChatHistory() {
  const session = await checkSession(["prompt"]);
  const items = await listGptHistory({ id: session.id });
  return (
    <>
      <div>History</div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>System Message</TableHead>
            <TableHead>View</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(({ chatId, system }) => (
            <TableRow key={chatId}>
              <TableCell>{toLocalDateTimeString(new Date(chatId))}</TableCell>
              <TableCell>{system}</TableCell>
              <TableCell>
                <Link href={`/prompthub/gpt-4/chat/${chatId}`}>Continue chat</Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
