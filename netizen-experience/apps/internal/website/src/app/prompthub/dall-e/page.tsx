"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription, toast } from "@netizen/ui";
import { Input, Textarea } from "@netizen/ui/server";
import { SubmitButton } from "../component/submitButton";
import { generateImageAction } from "./actions";
import { generateImageSchema } from "./entities";

export default function DallePage() {
  const [image, setImage] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const form = useForm<z.infer<typeof generateImageSchema>>({
    resolver: zodResolver(generateImageSchema),
    defaultValues: {
      prompt: "A painting of a cat sitting on a chair",
      n: 1,
      quality: "standard",
      style: "natural",
    },
  });
  const [state, generateImageFormAction] = useFormState(generateImageAction, { success: undefined });
  useEffect(() => {
    if (state.success) {
      setPrompt(state.data.revisedPrompt);
      setImage(state.data.url);
    } else if (state.success === false) {
      toast.error("Error", {
        description: state.error.message,
        cancel: { label: "close" },
      });
    }
  }, [state]);
  return (
    <>
      {image && (
        <div className="basis-5/6">
          <div className="grid grid-cols-1 gap-1">
            <div>
              <img src={image} alt={prompt} />
            </div>
            <hr />
            <div>
              <p>Revised Prompt</p>
              <p>{prompt}</p>
            </div>
          </div>
        </div>
      )}
      <Form {...form}>
        <form
          action={() => {
            setImage("");
            form.handleSubmit(generateImageFormAction)();
          }}
          className="max-w-xl space-y-6"
        >
          <FormField
            control={form.control}
            name="prompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prompt</FormLabel>
                <FormControl>
                  <Textarea autoComplete="off" {...field} />
                </FormControl>
                <FormDescription>Prompt for image generation</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="style"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Style</FormLabel>
                <FormControl>
                  <Input type="string" autoComplete="off" {...field} />
                </FormControl>
                <FormDescription>
                  natural or vivid. The style of the generated images. Must be one of vivid or natural. Vivid causes the
                  model to lean towards generating hyper-real and dramatic images. Natural causes the model to produce
                  more natural, less hyper-real looking images. This param is only supported for dall-e-3.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <SubmitButton>Submit</SubmitButton>
        </form>
      </Form>
    </>
  );
}
