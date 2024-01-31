import { Heading } from "@netizen/ui/server";
import { getSurveyForm, listModelMetas } from "@nanikore/libs-survey";
import { RIGHTS } from "@nanikore/libs-user";
import { authCheck } from "@/auth";
import { DetailsForm } from "./details-form";
import { NoSurveyState } from "./no-survey";
import { QuestionBuilder } from "./question-forms";
import { QuestionList } from "./question-list";

export default async function FormBuilder({ params: { surveyId } }: { params: { surveyId: string } }) {
  const [surveyForm, modelMetas] = await Promise.all([
    getSurveyForm(surveyId),
    listModelMetas(),
    authCheck([RIGHTS.ADMIN]),
  ]);

  return (
    <div className="space-y-8">
      <Heading className="font-bold">Form Builder</Heading>
      {surveyForm === null ? (
        <NoSurveyState surveyId={surveyId} />
      ) : (
        <>
          <DetailsForm {...surveyForm} />
          <QuestionBuilder
            {...surveyForm}
            modelMetas={modelMetas}
            questionList={<QuestionList surveyId={surveyId} />}
          />
        </>
      )}
    </div>
  );
}
