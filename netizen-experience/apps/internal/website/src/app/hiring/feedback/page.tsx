"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, toast } from "@netizen/ui";
import { Button, Textarea } from "@netizen/ui/server";
import { handleSubmitFeedback } from "./actions";
import { formSchema, FeedbackFormData } from "./schema";

export default function CreateFeedbackForm() {
  const feedbackForm = useForm<FeedbackFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      overallImpression: "",
      previousExperience: "",
      strongestAsset: "",
      biggestDoubt: "",
      blendIntoTeam: "",
      englishProficiency: "",
      proceedToInternship: undefined,
      remarks: "",
    },
  });

  const onSubmit = async (values: FeedbackFormData) => {
    try {
      const result = await handleSubmitFeedback(values);
      toast(`Submitted Data: ${JSON.stringify(result)}`);
      toast.success("Your feedback has been successfully submitted");
    } catch (error) {
      console.error("Error submitting feedback", error);
      toast.error("Error submitting feedback");
    }
  };

  return (
    <Form {...feedbackForm}>
      <h2 className="col-span-full mb-4 text-xl font-bold">Interview Feedback Form</h2>
      <form onSubmit={feedbackForm.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={feedbackForm.control}
          name="overallImpression"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="overallImpression">What is your overall impression of the candidate?</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={feedbackForm.control}
          name="previousExperience"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="previousExperience">
                Does the candidate possess any previous experience that will be valuable to this role?
              </FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={feedbackForm.control}
          name="strongestAsset"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="strongestAsset">
                What do you think is the strongest asset the candidate can bring to the team?
              </FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={feedbackForm.control}
          name="biggestDoubt"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="biggestDoubt">What is your biggest doubt of this candidate?</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={feedbackForm.control}
          name="blendIntoTeam"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="blendIntoTeam">Can the candidate blend into the team?</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={feedbackForm.control}
          name="englishProficiency"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="englishProficiency">
                What is the English proficiency level of the candidate? Comparing with their resume/career pack reply,
                which was more impressive?
              </FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={feedbackForm.control}
          name="proceedToInternship"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proceed to accept for internship?</FormLabel>
              <FormControl>
                <div>
                  <input
                    type="radio"
                    id="proceedToInternshipYes"
                    name="proceedToInternship"
                    value="true"
                    onChange={() => field.onChange(true)}
                  />
                  <label htmlFor="proceedToInternshipYes">Yes</label>
                  <input
                    type="radio"
                    id="proceedToInternshipNo"
                    name="proceedToInternship"
                    value="false"
                    onChange={() => field.onChange(false)}
                  />
                  <label htmlFor="proceedToInternshipNo">No</label>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={feedbackForm.control}
          name="remarks"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="remarks">Remarks (optional)</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit Feedback</Button>
      </form>
    </Form>
  );
}
