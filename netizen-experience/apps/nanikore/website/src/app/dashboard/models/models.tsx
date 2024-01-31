import { UserFocus } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  linkVariants,
} from "@netizen/ui/server";
import { capitalize } from "@netizen/utils-string";
import { listModelMetas } from "@nanikore/libs-survey";

export default async function Models() {
  const models = await listModelMetas();
  return (
    <section className="mt-4">
      {models.length ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {models.map(({ id, name, type }) => (
              <TableRow key={id} className="group">
                <TableCell>
                  <Link href={`/dashboard/models/${id}`} className={linkVariants()}>
                    {name}
                  </Link>
                </TableCell>
                <TableCell>{capitalize(type)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState>
          <EmptyStateIcon>
            <UserFocus />
          </EmptyStateIcon>
          <EmptyStateTitle>No models</EmptyStateTitle>
          <EmptyStateDescription>Get started by creating a new model.</EmptyStateDescription>
        </EmptyState>
      )}
    </section>
  );
}
