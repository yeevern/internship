"use server";

import { TableHeader, TableRow, TableHead, TableBody, TableCell, Link, Table } from "@netizen/ui/server";
import { toLocalDateTimeString } from "@/utils/types";
import { listAssistant } from "./actions";
import { ListAssistantParams } from "./types";

export default async function GPTAssistantList({
  searchParams: { after, before },
}: {
  searchParams: { after: string | string[] | undefined; before: string | string[] | undefined };
}) {
  let params: ListAssistantParams | undefined;
  if (typeof after === "string") params = { after };
  else if (typeof before === "string") params = { before };
  const { after: listAfter, before: listBefore, items } = await listAssistant(params);
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Start New Thread</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(({ created_at, description, id, name }) => (
            <TableRow key={id}>
              <TableCell>{toLocalDateTimeString(new Date(created_at))}</TableCell>
              <TableCell>{name}</TableCell>
              <TableCell>{description}</TableCell>
              <TableCell>
                <Link href={`/prompthub/gpt-assistant/${id}`}>Start Chat</Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div>
        {listBefore && <Link href={`/prompthub/gpt-assistant?before=${listBefore}`}>Prev</Link>}
        {listAfter && <Link href={`/prompthub/gpt-assistant?after=${listAfter}`}>Next</Link>}
      </div>
    </div>
  );
}
