"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  toast,
} from "@netizen/ui";
import { Button, Heading, Input, Textarea } from "@netizen/ui/server";
import { createCandidate } from "./actions";
import { candidateSchema } from "./schema";

export default function CreateForm() {
  const form = useForm<z.infer<typeof candidateSchema>>({
    resolver: zodResolver(candidateSchema),
    defaultValues: {
      candidateName: "",
      candidateEmail: "",
      rejectionReason: "",
    },
  });

  const isRejected = form.watch("candidateStatus") === "Rejected";

  const onSubmit = async (candidateData: z.infer<typeof candidateSchema>) => {
    try {
      const response = await createCandidate(candidateData);

      if (response.emailResponse) {
        toast.info(JSON.stringify(response.candidateData));
        toast.success("Email sent successfully");
      } else {
        toast.error("Failed to send email successfully");
      }
    } catch (error) {
      toast.error("Failed to send email successfully");
    }
  };

  return (
    <section>
      <Heading>Candidate Creation Form</Heading>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="candidateName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Candidate's Name:</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Enter candidate's name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="candidateEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Candidate's Email:</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Enter candidate's email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="jobRole"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Role:</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select the job role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Intern Tech">Intern Tech</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="candidateSource"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Candidate Source:</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select the source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Email">Email</SelectItem>
                      <SelectItem value="Job Street">JobStreet</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="candidateStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status:</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select the status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Career Pack">CAREER PACK</SelectItem>
                      <SelectItem value="Rejected">REJECTED</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {isRejected && (
            <FormField
              control={form.control}
              name="rejectionReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Rejection:</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter your reason" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <div>
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </Form>
    </section>
  );
}
