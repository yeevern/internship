"use server";

import { revalidatePath } from "next/cache";
import { RedirectType, redirect } from "next/navigation";
import { deleteSurveyPermanently, publishSurvey, updateSurvey } from "@nanikore/libs-survey";
import { RIGHTS } from "@nanikore/libs-user";
import { authCheck } from "@/auth";
import { ServerActionState, handleServerActionError, updateServerActionSuccessState } from "@/utils/types";

export async function updateSurveyAction(
  state: ServerActionState<{
    title?: string;
    description?: string;
    startDate?: number;
    endDate?: number;
  }>,
  payload: {
    surveyId: string;
    title?: string;
    description?: string;
    startDate?: number;
    endDate?: number;
  },
) {
  try {
    const { surveyId, ...attributes } = payload;
    await authCheck([RIGHTS.ADMIN]);
    await updateSurvey(payload); // @TODO: add updater's user id
    updateServerActionSuccessState(state, attributes);
    revalidatePath(`/dashboard/surveys/${surveyId}`);
  } catch (e) {
    handleServerActionError(state, e);
  }
  return state;
}

export async function publishSurveyAction(payload: { surveyId: string; publish: boolean }) {
  await authCheck([RIGHTS.ADMIN]);
  await publishSurvey(payload);
  revalidatePath(`/dashboard/surveys/${payload.surveyId}`);
}

export async function deleteSurveyAction(payload: { surveyId: string }) {
  await authCheck([RIGHTS.ADMIN]);
  await deleteSurveyPermanently(payload);
  redirect(`/dashboard/surveys`, RedirectType.replace);
}
