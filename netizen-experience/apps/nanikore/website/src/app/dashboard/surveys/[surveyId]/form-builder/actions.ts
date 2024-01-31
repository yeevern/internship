"use server";

import { revalidatePath } from "next/cache";
import { isTypeOf } from "@netizen/utils-types";
import {
  SurveyError,
  SurveyErrorMessage,
  createQuestion,
  deleteQuestion,
  getModelById,
  getSurveyForm,
  initializeSinglePageSurveyForm,
  updateLeaf,
  updateQuestion,
  updateRoot,
} from "@nanikore/libs-survey";
import { RIGHTS } from "@nanikore/libs-user";
import { authCheck } from "@/auth";
import { ServerActionState, handleServerActionError, updateServerActionSuccessState } from "@/utils/types";
import { DetailsFormValues, QuestionFormValues } from "./schema";

export async function getModelAction(id: string) {
  await authCheck([RIGHTS.ADMIN]);
  return await getModelById(id);
}

export async function initializeSurveyFormAction(payload: { surveyId: string }) {
  const { user } = await authCheck([RIGHTS.ADMIN]);
  await initializeSinglePageSurveyForm({ surveyId: payload.surveyId, userId: user.id });
  const surveyForm = await getSurveyForm(payload.surveyId);
  if (!surveyForm)
    throw new SurveyError("Single page survey form did not initialized successfully", {
      code: SurveyErrorMessage.SURVEY_FORM_ALREADY_INITIALIZED,
      context: { surveyId: payload.surveyId },
    });
  revalidatePath(`/dashboard/surveys/${payload.surveyId}`);
}

export async function updateSurveyInfoAction(
  state: ServerActionState<Partial<DetailsFormValues>>,
  payload: Partial<DetailsFormValues> & { surveyId: string; leafId: string },
) {
  try {
    await authCheck([RIGHTS.ADMIN]);
    const { completionMessage, leafId, surveyId, ...mutableSurveyAttributes } = payload;

    const updatePromises: Promise<unknown>[] = [];
    if (Object.keys(mutableSurveyAttributes).length) {
      updatePromises.push(updateRoot({ surveyId, ...mutableSurveyAttributes }));
    }
    if (completionMessage) {
      updateLeaf({ surveyId, leafId, title: completionMessage });
    }

    updateServerActionSuccessState(state, { completionMessage, ...mutableSurveyAttributes });
    revalidatePath(`/dashboard/surveys/${payload.surveyId}`);
  } catch (e) {
    handleServerActionError(state, e);
  }
  return state;
}

export async function createQuestionAction(
  state: ServerActionState<{ questionId: string }>,
  payload: { surveyId: string; branchId: string; questionIndex: number } & Omit<QuestionFormValues, "id" | "modelType">,
) {
  try {
    await authCheck([RIGHTS.ADMIN]);
    const { questionType, selectionOptions, ...attributes } = payload;
    const { questionId } = await createQuestion({
      ...attributes,
      type: questionType,
      selectionOptions: selectionOptions.map((option) => ({
        value: option.value,
        label: option.label ?? option.value,
      })),
    });
    updateServerActionSuccessState(state, { questionId });
    revalidatePath(`/dashboard/surveys/${payload.surveyId}`);
  } catch (e) {
    handleServerActionError(state, e);
  }
  return state;
}

interface UpdateQuestionPayload {
  surveyId: string;
  questions: ({
    questionId: string;
    branchId?: string;
    questionIndex?: number;
  } & Partial<Omit<QuestionFormValues, "id" | "modelType">>)[];
  deleteQuestions: string[];
}

export async function updateQuestionsAction(
  state: ServerActionState<{ failedQuestionIds: string[] }>,
  payload: UpdateQuestionPayload,
) {
  try {
    await authCheck([RIGHTS.ADMIN]);

    const { deleteQuestions, questions, surveyId } = payload;
    const promises = questions.map(async ({ questionId, questionType, selectionOptions, ...attributes }) => {
      await updateQuestion({
        surveyId,
        questionId,
        ...attributes,
        ...(questionType ? { type: questionType } : {}),
        ...(selectionOptions
          ? {
              selectionOptions: selectionOptions.map((option) => ({
                value: option.value,
                label: option.label ?? option.value,
              })),
            }
          : {}),
      }).catch(() => {
        throw questionId;
      });
      return questionId;
    });
    if (deleteQuestions.length) {
      promises.push(
        ...deleteQuestions.map(async (questionId) => {
          await deleteQuestion({ surveyId, questionId }).catch(() => {
            throw questionId;
          });
          return questionId;
        }),
      );
    }
    const responses = await Promise.allSettled(promises);
    const rejectedIds = responses.reduce<string[]>((acc, response) => {
      if (
        isTypeOf<PromiseRejectedResult, PromiseSettledResult<void>>(response, (arg) => arg.status === "rejected") &&
        typeof response.reason === "string"
      )
        acc.push(response.reason);
      return acc;
    }, []);
    updateServerActionSuccessState(state, { failedQuestionIds: rejectedIds });
    revalidatePath(`/dashboard/surveys/${payload.surveyId}`);
  } catch (e) {
    handleServerActionError(state, e);
  }
  return state;
}
