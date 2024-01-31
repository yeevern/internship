import Link from "next/link";
import {
  Button,
  DescriptionList,
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
  EmptyState,
  EmptyStateButton,
  EmptyStateDescription,
  EmptyStateTitle,
  Heading,
} from "@netizen/ui/server";
import { getSurveyForm } from "@nanikore/libs-survey";

export async function SurveyForm(props: { surveyId: string }) {
  const surveyForm = await getSurveyForm(props.surveyId);

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading as="h3" className="flex-1 text-xl font-bold">
          Survey Form
        </Heading>
        {surveyForm !== null && (
          <Button asChild>
            <Link href={`/dashboard/surveys/${props.surveyId}/form-builder`}>Edit form</Link>
          </Button>
        )}
      </div>
      {surveyForm === null ? (
        <EmptyState className="mt-8 rounded-lg border border-dashed p-8">
          <EmptyStateTitle>No survey form</EmptyStateTitle>
          <EmptyStateDescription>Start this survey by creating a form</EmptyStateDescription>
          <EmptyStateButton asChild>
            <Link href={`/dashboard/surveys/${props.surveyId}/form-builder`}>Create form</Link>
          </EmptyStateButton>
        </EmptyState>
      ) : (
        <DescriptionList>
          <DescriptionListItem>
            <DescriptionListTerm>Survey title</DescriptionListTerm>
            <DescriptionListDetails>{surveyForm.title}</DescriptionListDetails>
          </DescriptionListItem>
          {surveyForm.description && (
            <DescriptionListItem>
              <DescriptionListTerm>Survey description</DescriptionListTerm>
              <DescriptionListDetails>{surveyForm.description}</DescriptionListDetails>
            </DescriptionListItem>
          )}
        </DescriptionList>
      )}
    </>
  );
}
