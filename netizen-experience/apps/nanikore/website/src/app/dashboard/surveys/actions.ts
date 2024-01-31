"use server";

import { revalidatePath } from "next/cache";
import { createSurvey } from "@nanikore/libs-survey";
import { RIGHTS } from "@nanikore/libs-user";
import { authCheck } from "@/auth";
import { ServerActionState, handleServerActionError, updateServerActionSuccessState } from "@/utils/types";

export async function createSurveyAction(
  state: ServerActionState<{ surveyId: string; title: string }>,
  payload: { title: string; description?: string; startDate: number; endDate: number },
) {
  try {
    const { user } = await authCheck([RIGHTS.ADMIN]);
    const data = await createSurvey({
      ownerId: user.id,
      status: "draft",
      title: payload.title,
      description: payload.description,
      startDate: payload.startDate,
      endDate: payload.endDate,
    });
    updateServerActionSuccessState(state, { surveyId: data.surveyId, title: payload.title });
    revalidatePath("/dashboard/surveys");
  } catch (e) {
    handleServerActionError(state, e);
  }
  return state;
}
