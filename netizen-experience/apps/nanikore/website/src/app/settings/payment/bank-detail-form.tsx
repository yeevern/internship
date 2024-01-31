"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@netizen/ui";
import { Button, Input } from "@netizen/ui/server";
import { BankAccount } from "@nanikore/libs-profile";
import { addPaymentDetail, updatePaymentDetails } from "./actions";

export function BankDetailForm({ bankDetails }: { readonly bankDetails: BankAccount }) {
  const formSchema = z.object({
    bankAccountHolderName: z.string(),
    bankName: z.string(),
    bankAccountNumber: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bankAccountHolderName: "",
      bankName: "",
      bankAccountNumber: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (bankDetails) {
      await updatePaymentDetails({
        ...bankDetails,
        ...data,
      });
    } else {
      await addPaymentDetail(data);
    }
  };

  useEffect(() => {
    if (bankDetails) {
      form.reset({
        bankAccountHolderName: bankDetails.bankAccountHolderName,
        bankName: bankDetails.bankName,
        bankAccountNumber: bankDetails.bankAccountNumber,
      });
    }
  }, [bankDetails, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="bankAccountHolderName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Account Holder Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bankName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bankAccountNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Account Number</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit">Update</Button>
      </form>
    </Form>
  );
}
