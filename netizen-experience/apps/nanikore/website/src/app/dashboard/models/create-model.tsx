"use client";

import { Plus } from "@phosphor-icons/react/dist/ssr";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@netizen/ui";
import { Button } from "@netizen/ui/server";
import { useBoolean } from "@netizen/utils-hooks";
import { EditModelForm } from "@/components/form/model";
import { createModelAction } from "./actions";

export default function CreateModel() {
  const [open, setOpen] = useBoolean();
  return (
    <Sheet open={open} onOpenChange={setOpen.toggle}>
      <SheetTrigger asChild>
        <Button>
          <Plus />
          <span>Create</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        className="w-[578px] overflow-y-auto sm:max-w-none"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <SheetHeader className="mb-6">
          <SheetTitle>Create model</SheetTitle>
          <SheetDescription>
            Define the data model to link to the data points that are collected in the survey.
          </SheetDescription>
        </SheetHeader>
        <EditModelForm
          onSubmit={({ dateRange, selections, ...values }) => {
            createModelAction({
              ...values,
              ...(values.type === "selection" && selections ? { selections: selections.map((s) => s.option) } : {}),
              ...(values.type === "date" && dateRange
                ? { min: dateRange.from.getTime(), max: dateRange.to.getTime() }
                : {}),
            });
            setOpen.off();
          }}
        />
      </SheetContent>
    </Sheet>
  );
}
