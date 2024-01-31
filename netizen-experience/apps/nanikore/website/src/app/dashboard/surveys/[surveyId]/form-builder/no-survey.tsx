"use client";

import { toast } from "@netizen/ui";
import { EmptyState, EmptyStateButton, EmptyStateDescription, EmptyStateTitle } from "@netizen/ui/server";
import { initializeSurveyFormAction } from "./actions";

export function NoSurveyState(props: { surveyId: string }) {
  const handleClick = async () => {
    try {
      await initializeSurveyFormAction({ surveyId: props.surveyId });
      toast.success("Survey form initialized");
    } catch (e) {
      toast.error("Failed to initialize survey form");
    }
  };

  return (
    <EmptyState className="rounded-lg border border-dashed p-8">
      <EmptyStateTitle>No survey form</EmptyStateTitle>
      <EmptyStateDescription>
        Create a survey form to kickstart the recruitment. Start by using a single-page form template
      </EmptyStateDescription>
      <EmptyStateButton onClick={handleClick}>Initialize survey</EmptyStateButton>
    </EmptyState>
  );
}
