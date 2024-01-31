"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarBlank, Hash, ListChecks } from "@phosphor-icons/react/dist/ssr";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  ToggleGroup,
  ToggleGroupItem,
} from "@netizen/ui";
import { Button, InlineCode, Input, Textarea } from "@netizen/ui/server";
import { satayCase } from "@netizen/utils-string";
import { cn } from "@netizen/utils-ui";
import { DateForm } from "./date-form";
import { NumberForm } from "./number-form";
import { SelectionForm } from "./selection-form";

const formSchema = z.object({
  name: z.string().min(1, "Please enter a name"),
  description: z.string().optional(),
  type: z.enum(["selection", "date", "number", "string"]),
  selections: z
    .array(z.object({ option: z.string() }))
    .min(2, "Model must contain at least two options")
    .optional(),
  allowOthers: z.boolean().optional(),
  dateRange: z
    .object(
      {
        from: z.date(),
        to: z.date(),
      },
      { invalid_type_error: "Please select a range" },
    )
    .optional(),
  min: z.coerce.number().optional(),
  max: z.coerce.number().optional(),
});

type EditModelFormValues = z.infer<typeof formSchema>;

interface EditModelFormProps {
  onSubmit: (values: EditModelFormValues) => void;
  initialValues?: Partial<EditModelFormValues>;
}

function EditModelForm({ initialValues, onSubmit }: EditModelFormProps) {
  const form = useForm<EditModelFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "selection",
      selections: [{ option: "Option 1" }, { option: "Option 2" }],
      allowOthers: false,
      ...initialValues,
    },
  });
  const watchName = form.watch("name");
  const watchType = form.watch("type");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Age, Gender, Nationality" {...field} />
              </FormControl>
              <FormDescription className="text-xs">
                {watchName ? (
                  <>
                    This model will be generated with{" "}
                    <InlineCode className="text-xs">{satayCase(watchName)}</InlineCode> ID
                  </>
                ) : (
                  "Spaces are allowed, hyphens and underscores should be avoided."
                )}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe the model" className="min-h-[104px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Model type</FormLabel>
              <FormControl>
                <ToggleGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  type="single"
                  variant="outline"
                  className="grid grid-cols-3 gap-2 space-x-0"
                >
                  <ToggleGroupItem value="selection" className="flex h-max flex-col space-y-1 rounded-lg p-4">
                    <ListChecks />
                    <span>Selection</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="date" className="flex h-max flex-col space-y-1 rounded-lg p-4">
                    <CalendarBlank />
                    <span>Date</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="number" className="flex h-max flex-col space-y-1 rounded-lg p-4">
                    <Hash />
                    <span>Number</span>
                  </ToggleGroupItem>
                </ToggleGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <section className={cn(watchType !== "selection" && "hidden")}>
          <SelectionForm />
        </section>
        <section className={cn(watchType !== "date" && "hidden")}>
          <DateForm />
        </section>
        <section className={cn(watchType !== "number" && "hidden")}>
          <NumberForm />
        </section>
        <div className="flex justify-end">
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Form>
  );
}

export { EditModelForm, type EditModelFormValues };
