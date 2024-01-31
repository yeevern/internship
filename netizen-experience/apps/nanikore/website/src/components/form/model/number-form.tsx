"use client";

import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@netizen/ui";
import { Input } from "@netizen/ui/server";
import { EditModelFormValues } from "./index";

export function NumberForm() {
  const form = useFormContext<EditModelFormValues>();
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="min"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Min</FormLabel>
            <FormControl>
              <Input type="number" inputMode="numeric" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="max"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Max</FormLabel>
            <FormControl>
              <Input type="number" inputMode="numeric" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
