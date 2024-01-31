import { FolderPlus } from "@phosphor-icons/react/dist/ssr";
import { format } from "date-fns";
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
import { listActiveSurveys, listUpcomingSurveys } from "@nanikore/libs-survey";

export default async function Surveys() {
  const [upcomingSurveys, activeSurveys] = await Promise.all([listUpcomingSurveys(), listActiveSurveys()]);
  const surveys = [...upcomingSurveys, ...activeSurveys].sort((a, b) => a.startDate - b.startDate);
  return (
    <section className="mt-4">
      {surveys.length ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Survey period</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {surveys.map(({ endDate, startDate, status, surveyId, title }) => (
              <TableRow key={surveyId}>
                <TableCell>
                  <Link href={`/dashboard/surveys/${surveyId}`} className={linkVariants()}>
                    {title}
                  </Link>
                </TableCell>
                <TableCell>
                  {format(startDate, "dd/MM/yyyy")} - {format(endDate, "dd/MM/yyyy")}
                </TableCell>
                <TableCell className="text-center capitalize">{status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState>
          <EmptyStateIcon>
            <FolderPlus />
          </EmptyStateIcon>
          <EmptyStateTitle>No upcoming or active surveys</EmptyStateTitle>
          <EmptyStateDescription>Get started by creating a new survey.</EmptyStateDescription>
        </EmptyState>
      )}
    </section>
  );
}
