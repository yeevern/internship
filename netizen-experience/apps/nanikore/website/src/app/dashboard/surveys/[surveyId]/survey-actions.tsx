"use client";

import { Archive, DotsThreeVertical, Export, Feather } from "@phosphor-icons/react/dist/ssr";
import { useEffect } from "react";
import { useFormState } from "react-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  ButtonGroup,
  ButtonGroupIconItem,
  ButtonGroupItem,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIcon,
  DropdownMenuTrigger,
  Sheet,
  SheetContent,
  SheetTrigger,
  toast,
} from "@netizen/ui";
import { useBoolean } from "@netizen/utils-hooks";
import { capitalize, dedupe, joinWords } from "@netizen/utils-string";
import { SurveyMeta } from "@nanikore/libs-survey";
import { SurveyForm } from "@/components/form/survey";
import { deleteSurveyAction, publishSurveyAction, updateSurveyAction } from "./actions";

interface UpdateSurveyFormProps
  extends Pick<SurveyMeta, "surveyId" | "title" | "description" | "startDate" | "endDate"> {
  onSubmitted: () => void;
}

function UpdateSurveyForm({ onSubmitted, ...props }: UpdateSurveyFormProps) {
  const [formState, dispatchUpdateSurveyAction] = useFormState(updateSurveyAction, { success: undefined });

  useEffect(() => {
    if (formState.success !== undefined) {
      if (formState.success) {
        const updatedAttributeNames = dedupe(
          Object.keys(formState.data).map((key) => {
            if (key === "startDate" || key === "endDate") return "survey period";
            return key;
          }),
        );
        toast.success("Survey updated successfully", {
          description: capitalize(
            `${joinWords(updatedAttributeNames, { singular: "other attribute", plural: "other attributes" })} ${
              updatedAttributeNames.length === 1 ? "has" : "have"
            } been modified`,
          ),
        });
      } else {
        toast.error("Failed to update survey successfully", { description: formState.error.message });
      }
      onSubmitted();
    }
  }, [formState, onSubmitted]);

  return (
    <SurveyForm
      mode="update"
      initialValues={{
        title: props.title,
        description: props.description,
        dateRange: [new Date(props.startDate), new Date(props.endDate)],
      }}
      onAction={({ dateRange, ...values }) => {
        dispatchUpdateSurveyAction({
          surveyId: props.surveyId,
          ...values,
          ...(dateRange ? { startDate: dateRange[0].getTime(), endDate: dateRange[1].getTime() } : {}),
        });
      }}
    />
  );
}

function PublishButton(props: { surveyId: string; status: SurveyMeta["status"] }) {
  const handleClick = async () => {
    const publish = props.status === "draft";
    try {
      await publishSurveyAction({
        surveyId: props.surveyId,
        publish,
      });
      toast.success(publish ? "Survey published" : "Survey unpublished");
    } catch (e) {
      toast.error(
        publish ? "Failed to publish survey successfully" : "Failed to unpublish survey successfully",
        e instanceof Error ? { description: e.message } : undefined,
      );
    }
  };

  return (
    <DropdownMenuItem onClick={handleClick} disabled={props.status === "closed"}>
      {props.status === "draft" ? (
        <>
          <DropdownMenuItemIcon>
            <Export />
          </DropdownMenuItemIcon>
          <span>Publish</span>
        </>
      ) : (
        <>
          <DropdownMenuItemIcon>
            <Feather />
          </DropdownMenuItemIcon>
          <span>Convert to draft</span>
        </>
      )}
    </DropdownMenuItem>
  );
}

function ArchiveDialog(props: { onAction: React.MouseEventHandler }) {
  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
        <AlertDialogDescription>
          Archiving a survey will unpublish it and make it inaccessible to respondents and clients. Althought it can be
          restored later, it may still affect an ongoing project.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter className="flex justify-end">
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction variant="danger" onClick={props.onAction}>
          Continue
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}

export function SurveyActions(props: SurveyMeta) {
  const [showEditSurveyForm, setShowEditSurveyForm] = useBoolean();
  const [showDeleteDialog, setShowDeleteDialog] = useBoolean();

  const handleDelete = async () => {
    try {
      await deleteSurveyAction({ surveyId: props.surveyId });
      toast.success("Survey has been archived", {
        action: {
          label: "Undo",
          onClick: () => {
            toast("Undo not implemented yet");
          },
        },
      });
    } catch (e) {
      toast.error("Failed to delete survey successfully", e instanceof Error ? { description: e.message } : undefined);
    }
  };

  return (
    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog.set}>
      <Sheet open={showEditSurveyForm} onOpenChange={setShowEditSurveyForm.set}>
        <ButtonGroup>
          <SheetTrigger asChild>
            <ButtonGroupItem>Edit</ButtonGroupItem>
          </SheetTrigger>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ButtonGroupIconItem>
                <DotsThreeVertical />
              </ButtonGroupIconItem>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <PublishButton surveyId={props.surveyId} status={props.status} />
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-danger-foreground">
                  <DropdownMenuItemIcon>
                    <Archive />
                  </DropdownMenuItemIcon>
                  <span>Archive</span>
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
        </ButtonGroup>
        <SheetContent className="sm:w-2/3 sm:max-w-none">
          <UpdateSurveyForm {...props} onSubmitted={setShowEditSurveyForm.off} />
        </SheetContent>
      </Sheet>
      <ArchiveDialog onAction={handleDelete} />
    </AlertDialog>
  );
}
