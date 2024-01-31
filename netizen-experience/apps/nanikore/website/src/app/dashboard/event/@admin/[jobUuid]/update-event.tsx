"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CaretDown, CircleNotch } from "@phosphor-icons/react/dist/ssr";
import { lightFormat, set } from "date-fns";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Calendar,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@netizen/ui";
import { Button, Input } from "@netizen/ui/server";
import { EventUpdateRequest } from "@nanikore/libs-event";

interface UpdateEventFormProps {
  projectId: string;
  startDate: number;
  endDate: number;
  onUpdated: () => void;
}

const formSchema = z.object({
  startDate: z.date(),
  startTime: z.string(),
  endDate: z.date(),
  endTime: z.string(),
});

function UpdateEventForm({ endDate, onUpdated, projectId, startDate }: UpdateEventFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startDate: set(startDate, { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }),
      startTime: lightFormat(startDate, "HH:mm"),
      endDate: set(endDate, { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }),
      endTime: lightFormat(endDate, "HH:mm"),
    },
  });
  const watchStartDate = form.watch("startDate");

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // @TODO: turn this into server action
    const request: EventUpdateRequest = {
      // @TODO: add time values
      startDate: values.startDate.getTime(),
      endDate: values.endDate.getTime(),
    };
    setLoading(true);
    await fetch(`/api/event/admin/${projectId}`, {
      method: "POST",
      body: JSON.stringify(request),
    });
    onUpdated();
    startTransition(() => {
      setLoading(false);
      router.refresh();
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant="secondary" className="h-14 w-full justify-between text-base font-normal">
                        <span>{field.value ? lightFormat(field.value, "dd/MM/yyyy") : "Pick a date"}</span>
                        <CaretDown />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-0">
                    <Calendar mode="single" initialFocus selected={field.value} onSelect={field.onChange} />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant="secondary" className="h-14 w-full justify-between text-base font-normal">
                        <span>{field.value ? lightFormat(field.value, "dd/MM/yyyy") : "Pick a date"}</span>
                        <CaretDown />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-0">
                    <Calendar
                      mode="single"
                      initialFocus
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={[{ before: watchStartDate }]}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end">
          <Button className="w-20">{loading ? <CircleNotch className="animate-spin" /> : "Update"}</Button>
        </div>
      </form>
    </Form>
  );
}

interface UpdateEventProps {
  projectId: string;
  startDate: number;
  endDate: number;
}

export default function UpdateEvent({ endDate, projectId, startDate }: UpdateEventProps) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">Edit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update event</DialogTitle>
        </DialogHeader>
        <UpdateEventForm
          projectId={projectId}
          startDate={startDate}
          endDate={endDate}
          onUpdated={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
