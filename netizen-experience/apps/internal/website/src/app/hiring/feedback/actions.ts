"use server";

import { getSession } from "@/googleAuth/session";
import { FeedbackFormData } from "./schema";

export async function handleSubmitFeedback(formData: FeedbackFormData) {
  const session = await getSession();
  const interviewerId = session?.id;

  const combinedData = { ...formData, interviewerId };

  return combinedData;
}
