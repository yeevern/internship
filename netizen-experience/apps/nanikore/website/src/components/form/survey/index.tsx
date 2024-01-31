"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CaretDown, CircleNotch } from "@phosphor-icons/react/dist/ssr";
import { format, set, subDays } from "date-fns";
import { useFormStatus } from "react-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Calendar,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@netizen/ui";
import { Button, Input, Textarea } from "@netizen/ui/server";

const surveyFormSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  dateRange: z.tuple([z.date(), z.date()]),
});

type SurveyFormValues = z.infer<typeof surveyFormSchema>;

function SubmitButton() {
  const status = useFormStatus();

  return (
    <div className="flex justify-end">
      <Button type="submit" disabled={status.pending}>
        {status.pending && <CircleNotch className="animate-spin" />}
        <span>Submit</span>
      </Button>
    </div>
  );
}

type SurveyFormProps =
  | {
      mode: "create";
      onAction: (values: SurveyFormValues) => void;
      initialValues?: never;
    }
  | {
      mode: "update";
      onAction: (values: Partial<SurveyFormValues>) => void;
      initialValues?: Partial<SurveyFormValues>;
    };

function SurveyForm({ initialValues, mode, onAction }: SurveyFormProps) {
  const form = useForm<SurveyFormValues>({
    resolver: zodResolver(surveyFormSchema),
    defaultValues: {
      title: "",
      dateRange: [],
      ...initialValues,
    },
  });

  const handleAction = () => {
    form.handleSubmit((values) => {
      if (mode === "update") {
        const { dirtyFields } = form.formState;
        onAction({
          ...(dirtyFields.title ? { title: values.title } : {}),
          ...(dirtyFields.description ? { description: values.description } : {}),
          ...(dirtyFields.dateRange ? { dateRange: values.dateRange } : {}),
        });
      } else {
        onAction(values);
      }
    })();
  };

  return (
    <Form {...form}>
      <form action={handleAction} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
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
                <Textarea placeholder="Describe the survey" className="min-h-[320px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dateRange"
          render={({ field }) => (
            <FormItem className="flex flex-col items-start">
              <FormLabel>Survey period</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button variant="secondary" size="lg" className="w-full justify-between text-base font-normal">
                      <span>
                        {field.value[0] && field.value[1]
                          ? `${format(field.value[0], "dd/MM/yyyy")} - ${format(field.value[1], "dd/MM/yyyy")}`
                          : "Pick a date"}
                      </span>
                      <CaretDown size={24} className="ml-4" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent align="start" className="p-6 shadow-sm">
                  <Calendar
                    mode="range"
                    selected={{ from: field.value[0], to: field.value[1] }}
                    onSelect={(range) =>
                      range &&
                      field.onChange([range.from, range.to && set(range.to, { hours: 23, minutes: 59, seconds: 59 })])
                    }
                    initialFocus
                    disabled={(date) => date >= new Date("1900-01-01") && date < subDays(new Date(), 1)}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <SubmitButton />
      </form>
    </Form>
  );
}

export { SurveyForm };
