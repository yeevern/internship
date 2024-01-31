"use client";

import { UUID } from "crypto";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash } from "@phosphor-icons/react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  ToggleGroup,
  ToggleGroupItem,
} from "@netizen/ui";
import { Button, IconButton, Input } from "@netizen/ui/server";
import { useBoolean } from "@netizen/utils-hooks";
import { isUuid } from "@netizen/utils-types";
import { createEventEntry } from "./action";

const eventFormSchema = z.object({
  // @TODO: refine and link survey and discussion guide
  surveyId: z.string().refine(isUuid, "Invalid Survey ID"),
  discussionGuideId: z.string().refine(isUuid, "Invalid Discussion ID"),
  testerPool: z.boolean(),
  prototypeLinkList: z.array(z.object({ value: z.union([z.string().url(), z.literal("")]) })).refine((arr) => {
    const filteredArr = arr.filter((link) => link.value !== "");
    return filteredArr.length === new Set(filteredArr).size;
  }, "Duplicate Links"),
  activeLink: z.string().optional(),
  // @TODO: change schema to take UUID for consentForm, and store user upload file to S3?
  consentForm: z.any().optional(),
});

interface EventFormProps {
  closeDialog: () => void;
  projectId: UUID;
}

function EventForm({ closeDialog, projectId }: EventFormProps) {
  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      prototypeLinkList: [{ value: "" }],
    },
  });

  const { append, fields, remove } = useFieldArray({
    control: form.control,
    name: "prototypeLinkList",
  });

  async function onSubmit(values: z.infer<typeof eventFormSchema>) {
    const { prototypeLinkList, ...attributes } = values;
    await createEventEntry({
      projectId,
      prototypeLinkList: prototypeLinkList.filter((link) => link.value !== "").map((link) => link.value),
      ...attributes,
    });
    closeDialog();
  }

  return (
    <Form {...form}>
      <form className="overflow-auto" onSubmit={form.handleSubmit(onSubmit)} method="post">
        <FormField
          control={form.control}
          name="surveyId"
          render={({ field }) => (
            <FormItem className="my-2">
              <FormLabel>Survey</FormLabel>
              <FormControl>
                <Input placeholder="Survey" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="discussionGuideId"
          render={({ field }) => (
            <FormItem className="my-2">
              <FormLabel>Discussion Guide</FormLabel>
              <FormControl>
                <Input placeholder="Discussion Guide" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="testerPool"
          render={() => (
            <FormItem className="my-2">
              <FormLabel>Pool of Testers</FormLabel>
              <FormControl>
                <ToggleGroup
                  className="justify-start"
                  type="single"
                  variant="outline"
                  size="lg"
                  onValueChange={(e: string) =>
                    e === "nanikore"
                      ? form.setValue("testerPool", true)
                      : e === "private"
                        ? form.setValue("testerPool", false)
                        : form.resetField("testerPool")
                  }
                >
                  <ToggleGroupItem value="nanikore">Nanikore Pool of Tester</ToggleGroupItem>
                  <ToggleGroupItem value="private">Private Pool of Tester</ToggleGroupItem>
                </ToggleGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="my-2 space-y-1">
          <FormLabel>Prototype Links</FormLabel>
          {fields.length > 1 ? (
            <>
              {fields.map((_, index) => (
                <FormField
                  key={index}
                  control={form.control}
                  name={`prototypeLinkList.${index}.value`}
                  render={() => (
                    <FormItem>
                      <FormControl>
                        <div className="flex justify-between">
                          <Input
                            className="w-11/12"
                            placeholder="Prototype Link"
                            {...form.register(`prototypeLinkList.${index}.value`)}
                          />
                          <IconButton
                            className="m-auto"
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                          >
                            <Trash size={16} />
                          </IconButton>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </>
          ) : (
            <FormField
              control={form.control}
              name={"prototypeLinkList.0.value"}
              render={() => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Prototype Link" {...form.register(`prototypeLinkList.0.value`)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <Button variant="secondary" onClick={() => append({ value: "" })}>
            Add Link
          </Button>
        </div>
        <FormField
          control={form.control}
          name="consentForm"
          render={() => (
            <FormItem className="my-2">
              <FormLabel>Consent Form</FormLabel>
              <FormControl>
                <Input disabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="mt-4 flex justify-between">
          <Button type="button" variant="secondary" onClick={closeDialog}>
            Cancel
          </Button>
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Form>
  );
}

export default function CreateEvent({ projectId }: { projectId: UUID }) {
  const [open, setOpen] = useBoolean();

  return (
    <Dialog open={open} onOpenChange={setOpen.toggle}>
      <DialogTrigger asChild>
        <Button>New Event</Button>
      </DialogTrigger>
      <DialogContent className="max-h-full overflow-auto">
        <DialogHeader>
          <DialogTitle>New Event</DialogTitle>
        </DialogHeader>
        <EventForm closeDialog={setOpen.off} projectId={projectId} />
      </DialogContent>
    </Dialog>
  );
}
