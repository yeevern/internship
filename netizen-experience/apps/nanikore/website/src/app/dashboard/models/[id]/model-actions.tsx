"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DotsThreeVertical, PencilSimple, Trash } from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@netizen/ui";
import { InlineCode, Input } from "@netizen/ui/server";
import { useBoolean } from "@netizen/utils-hooks";
import { Model } from "@nanikore/libs-survey";
import { EditModelForm, type EditModelFormValues } from "@/components/form/model";
import { deleteModelAction, updateModelAction } from "./actions";

function EditModel({ model }: { model: Model }) {
  const [open, setOpen] = useBoolean();

  const initialValues: Partial<EditModelFormValues> = {
    name: model.name,
    description: model.description,
    type: model.type,
    ...(model.type === "selection"
      ? {
          selections: model.selections.map((option) => ({ option })),
          allowOthers: model.allowOthers,
        }
      : {}),
    ...(model.type === "date" && model.min && model.max
      ? { dateRange: { from: new Date(model.min), to: new Date(model.max) } }
      : {}),
    ...(model.type === "number" ? { min: model.min, max: model.max } : {}),
  };

  return (
    <Sheet open={open} onOpenChange={setOpen.toggle}>
      <SheetTrigger asChild>
        <ButtonGroupItem>
          <PencilSimple />
          <span>Edit model</span>
        </ButtonGroupItem>
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
          <SheetTitle>Edit model</SheetTitle>
          <SheetDescription>
            Define the data model to link to the data points that are collected in the survey.
          </SheetDescription>
        </SheetHeader>
        <EditModelForm
          initialValues={initialValues}
          onSubmit={({ dateRange, selections, ...values }) => {
            updateModelAction({
              id: model.id,
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

const deleteModelFormSchema = z.object({
  id: z.string().min(1, "ID does not match"),
});

function DeleteModel({ id }: { id: string }) {
  const router = useRouter();
  const [open, setOpen] = useBoolean();
  const form = useForm<z.infer<typeof deleteModelFormSchema>>({
    resolver: zodResolver(deleteModelFormSchema),
    defaultValues: { id: "" },
  });

  const onSubmit = async (values: z.infer<typeof deleteModelFormSchema>) => {
    if (values.id !== id) {
      form.setError("id", { message: "ID does not match" });
      return;
    }
    await deleteModelAction(values.id);
    router.replace("/dashboard/models");
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen.toggle}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <ButtonGroupIconItem>
            <DotsThreeVertical />
          </ButtonGroupIconItem>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[160px]">
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="text-danger-foreground">
              <DropdownMenuItemIcon>
                <Trash />
              </DropdownMenuItemIcon>
              <span>Delete model</span>
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>Deleting a model may affect an ongoing survey or project</AlertDialogDescription>
        </AlertDialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Please type <InlineCode>{id}</InlineCode> to confirm.
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <AlertDialogFooter className="flex justify-end">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction type="submit" variant="danger">
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function ModelActions({ model }: { model: Model }) {
  return (
    <ButtonGroup>
      <EditModel model={model} />
      <DeleteModel id={model.id} />
    </ButtonGroup>
  );
}
