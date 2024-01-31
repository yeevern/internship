import { capitalize, joinWords } from "@netizen/utils-string";
import { getModelByModelId, getSurveyForm } from "@nanikore/libs-survey";
import { QuestionAccordions } from "./question-accordion";

export async function QuestionList({ surveyId }: { surveyId: string }) {
  const surveyForm = await getSurveyForm(surveyId);
  const questions = surveyForm?.tree.questions.sort((a, b) => a.questionIndex - b.questionIndex) ?? [];
  const items = await Promise.all(
    questions.map(async (question) => {
      const model = await getModelByModelId(question.modelId);
      const attributes: Record<string, string> = {
        "Question type": `${capitalize(model.type)} / ${capitalize(question.type)}`,
        "Model name": model.name,
      };
      if (model.type === "selection") {
        attributes["Options"] = joinWords(model.selections, {
          singular: "more option",
          plural: "more options",
        });
      }
      return {
        id: question.id,
        questionIndex: question.questionIndex,
        question: question.question,
        type: `${question.type}`,
        attributes,
      };
    }),
  );

  return <QuestionAccordions items={items} />;
}
