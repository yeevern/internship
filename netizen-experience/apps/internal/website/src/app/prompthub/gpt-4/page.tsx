"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { useFormState } from "react-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, toast } from "@netizen/ui";
import { Textarea } from "@netizen/ui/server";
import { SubmitButton } from "../component/submitButton";
import { startChatAction } from "./actions";
import { startChatSchema } from "./entities";

export default function GPT4Panel() {
  const form = useForm<z.infer<typeof startChatSchema>>({
    resolver: zodResolver(startChatSchema),
    defaultValues: {
      system: "Hello, I am a chatbot design to assist you in your work.",
    },
  });

  const [state, startChatFormAction] = useFormState(startChatAction, { success: undefined });
  useEffect(() => {
    if (state.success) {
      redirect(`/prompthub/gpt-4/chat/${state.data.id}`);
    } else if (state.success === false) {
      toast("Error", {
        description: state.error.message,
        cancel: { label: "close" },
      });
    }
  }, [state]);

  return (
    <div className="bg-gray-100 flex h-full w-full items-center justify-center">
      <div className="max-w-md rounded border p-4">
        <Form {...form}>
          <form
            action={() => {
              form.handleSubmit(startChatFormAction)();
            }}
            className="max-w-xl space-y-6"
          >
            <FormField
              control={form.control}
              name="system"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chatbot Setup</FormLabel>
                  <FormControl>
                    <Textarea autoComplete="off" {...field} />
                  </FormControl>
                  <FormDescription>
                    System Message to customize your GPT 4.0 Chatbot to suite your needs
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SubmitButton>Start new chat</SubmitButton>
          </form>
        </Form>
      </div>
    </div>
  );
}
