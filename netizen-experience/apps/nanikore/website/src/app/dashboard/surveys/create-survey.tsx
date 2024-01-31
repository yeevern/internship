"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useFormState } from "react-dom";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, toast } from "@netizen/ui";
import { Button } from "@netizen/ui/server";
import { useBoolean } from "@netizen/utils-hooks";
import { SurveyForm } from "@/components/form/survey";
import { createSurveyAction } from "./actions";

export default function CreateSurvey() {
  const router = useRouter();
  const [open, setOpen] = useBoolean();
  const [formState, dispatchCreateSurveyAction] = useFormState(createSurveyAction, { success: undefined });

  useEffect(() => {
    if (formState.success !== undefined) {
      if (formState.success)
        toast.success(`${formState.data.title} created`, {
          action: {
            label: "View",
            onClick: () => {
              router.push(`/dashboard/surveys/${formState.data.surveyId}`);
            },
          },
        });
      else toast.error("Failed to create survey successfully", { description: formState.error.message });
      setOpen.off();
    }
  }, [formState, router, setOpen]);

  return (
    <Sheet open={open} onOpenChange={setOpen.set}>
      <SheetTrigger asChild>
        <Button>Create</Button>
      </SheetTrigger>
      <SheetContent className="sm:w-2/3 sm:max-w-none">
        <SheetHeader className="mb-6">
          <SheetTitle>Create survey</SheetTitle>
          <SheetDescription>Description of this form</SheetDescription>
        </SheetHeader>
        <SurveyForm
          mode="create"
          onAction={(values) =>
            dispatchCreateSurveyAction({
              title: values.title,
              description: values.description,
              startDate: values.dateRange[0].getTime(),
              endDate: values.dateRange[1].getTime(),
            })
          }
        />
      </SheetContent>
    </Sheet>
  );
}
