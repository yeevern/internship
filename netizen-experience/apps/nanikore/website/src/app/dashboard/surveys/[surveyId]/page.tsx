import { format } from "date-fns";
import {
  DescriptionList,
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
  Heading,
} from "@netizen/ui/server";
import { capitalize } from "@netizen/utils-string";
import { getSurvey } from "@nanikore/libs-survey";
import { SurveyActions } from "./survey-actions";
import { SurveyForm } from "./survey-form";

export default async function SurveyDetails({ params: { surveyId } }: { params: { surveyId: string } }) {
  const survey = await getSurvey(surveyId);
  const details = {
    ...(survey.description ? { Description: survey.description } : {}),
    "Created on": format(survey.createdAt, "dd/MM/yyyy HH:mm:ss"),
    "Last updated": format(survey.updatedAt ?? survey.createdAt, "dd/MM/yyyy HH:mm:ss"),
    Status: capitalize(survey.status),
    "Survey owner": survey.ownerId,
    "Survey period": `${format(survey.startDate, "dd/MM/yyyy")} - ${format(survey.endDate, "dd/MM/yyyy")}`,
  };
  return (
    <div className="space-y-16">
      <section>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Heading as="h3" className="text-xl font-bold">
              {survey.title}
            </Heading>
          </div>
          <SurveyActions {...survey} />
        </div>
        <DescriptionList>
          {Object.entries(details).map(([key, value]) => (
            <DescriptionListItem key={key}>
              <DescriptionListTerm>{key}</DescriptionListTerm>
              <DescriptionListDetails>{value}</DescriptionListDetails>
            </DescriptionListItem>
          ))}
        </DescriptionList>
      </section>
      <section>
        <SurveyForm surveyId={surveyId} />
      </section>
    </div>
  );
}
