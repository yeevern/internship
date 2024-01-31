"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@netizen/ui";
import { Button, Input } from "@netizen/ui/server";
import { verifyAttribute } from "./actions";

export default function VerificationForm({
  accessToken,
  verificationAttribute,
}: {
  accessToken: string;
  verificationAttribute: string;
}) {
  const attributeName = verificationAttribute === "phone" ? "phone_number" : "email";
  const router = useRouter();
  const formSchema = z.object({
    code: z
      .string()
      .min(1, "Enter your verification code.")
      .regex(/^\d{6}$/, "Invalid verification code format."),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await verifyAttribute(accessToken, attributeName, values.code);
    startTransition(() => {
      router.push("/dashboard/user");
    });
  };

  return (
    <div>
      <Form {...form}>
        <h2 className="mb-4 text-xl font-bold">
          Verify {verificationAttribute === "email" ? "Email" : "Phone Number"}
        </h2>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button>Verify</Button>
        </form>
      </Form>
    </div>
  );
}
