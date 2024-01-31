"use client";

import { CalendarPlus } from "@phosphor-icons/react/dist/ssr";
import { format } from "date-fns";
import { useFormContext } from "react-hook-form";
import {
  Calendar,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@netizen/ui";
import { Button } from "@netizen/ui/server";
import { EditModelFormValues } from "./index";

export function DateForm() {
  const form = useFormContext<EditModelFormValues>();
  return (
    <FormField
      control={form.control}
      name="dateRange"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Allowed range (optional)</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button variant="secondary" className="w-[320px] justify-start font-normal">
                  <CalendarPlus weight="light" />
                  {field.value ? (
                    <span>
                      {format(field.value.from, "MMM do, yyyy")}
                      {field.value.to ? ` - ${format(field.value.to, "MMM do, yyyy")}` : ""}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Select range</span>
                  )}
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent align="start" className="p-4 shadow-lg">
              <Calendar
                mode="range"
                initialFocus
                numberOfMonths={2}
                selected={field.value}
                onSelect={(range) => {
                  range && field.onChange(range);
                }}
              />
              <div className="mt-2 flex justify-end">
                <Button variant="secondary" size="sm" onClick={() => form.resetField("dateRange")}>
                  Clear
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
