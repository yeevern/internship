"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useFormState } from "react-dom";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, toast } from "@netizen/ui";
import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle, Input, Textarea } from "@netizen/ui/server";
import { capitalize, joinWords } from "@netizen/utils-string";
import { SurveyForm } from "@nanikore/libs-survey";
import { updateSurveyInfoAction } from "./actions";
import { DetailsFormValues, detailsFormSchema } from "./schema";

export function DetailsForm(props: SurveyForm) {
  const leafNode = props.tree.children[0]?.destination;
  const form = useForm<DetailsFormValues>({
    resolver: zodResolver(detailsFormSchema),
    defaultValues: {
      title: props.title,
      description: props.description ?? "",
      completionMessage: leafNode.title,
    },
  });
  const [formState, dispatchAction] = useFormState(updateSurveyInfoAction, { success: undefined });

  const handleAction = () => {
    const { dirtyFields } = form.formState;
    form.handleSubmit((values) => {
      dispatchAction({
        surveyId: props.surveyId,
        leafId: leafNode.id,
        ...(dirtyFields.title ? { title: values.title } : {}),
        ...(dirtyFields.description ? { description: values.description } : {}),
        ...(dirtyFields.completionMessage ? { completionMessage: values.completionMessage } : {}),
      });
    })();
  };

  useEffect(() => {
    if (formState.success !== undefined) {
      if (formState.success) {
        const attributeNames: Record<string, string> = {
          title: "survey title",
          description: "survey description",
          completionMessage: "completion message",
        };
        const updatedAttributeNames = Object.keys(formState.data).map((key) => attributeNames[key]);
        toast.success("Survey details updated", {
          description: capitalize(
            `${joinWords(updatedAttributeNames, { singular: "other attribute", plural: "other attributes" })} ${
              updatedAttributeNames.length === 1 ? "has" : "have"
            } been modified`,
          ),
        });
      } else {
        toast.error("Failed to update survey details", { description: formState.error.message });
      }
    }
  }, [formState]);

  return (
    <Form {...form}>
      <form action={handleAction}>
        <Card>
          <CardHeader>
            <CardTitle>Survey Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Survey title</FormLabel>
                  <FormControl>
                    <Input placeholder="Survey title" {...field} />
                  </FormControl>
                  <FormDescription>This title is shown to the respondents.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Survey description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the survey" {...field} />
                  </FormControl>
                  <FormDescription>
                    This will be shown to the respondents in the welcoming screen of this survey.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="completionMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Completion message</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Thank you for taking the time to complete this survey!" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit">Save</Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
