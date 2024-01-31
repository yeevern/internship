"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@netizen/ui";
import { Button, Input } from "@netizen/ui/server";
import { MutableUserAttributes, NaniKoreUser } from "@nanikore/libs-user";
import { updateUserDetails } from "./actions";

export default function EditForm({ accessToken, user }: { user: NaniKoreUser; accessToken: string }) {
  const router = useRouter();
  const formSchema = z
    .object({
      name: z.string().optional(),
      email: z
        .string()
        .email()
        .optional()
        .or(z.literal(""))
        .refine(
          (value) => {
            if (!value) return !user.email;
            else return true;
          },
          { message: "Email cannot be removed." },
        ),
      phone: z
        .string()
        .optional()
        .refine(
          (value) => {
            if (value) return /^\+\d{1,3}\d{6,14}$/.test(value);
            else return true;
          },
          { message: "Enter a phone number, including + and the country code, for example +12065551212." },
        ),
      picture: z.string().url().optional().or(z.literal("")),
    })
    .refine((value) => !(value.email !== user.email && value.phone !== user.phone), {
      message: "The email and phone number field cannot be updated simultaneously",
      path: ["email"],
    });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      phone: user.phone,
      picture: user.picture,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const userAttributes: MutableUserAttributes = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      picture: values.picture,
    };
    await updateUserDetails(accessToken, userAttributes);
    startTransition(() => {
      if (values.email && values.email !== user.email) {
        router.push("edit/verification/email");
      } else if (values.phone && values.phone !== user.phone) {
        router.push("edit/verification/phone");
      } else {
        router.push("/dashboard/user");
      }
    });
  };

  return (
    <div>
      <Form {...form}>
        <h2 className="mb-4 text-xl font-bold">Edit Profile</h2>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
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
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="picture"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Picture</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button>Save</Button>
        </form>
      </Form>
    </div>
  );
}
