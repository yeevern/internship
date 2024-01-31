"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CaretDown, CircleNotch } from "@phosphor-icons/react/dist/ssr";
import { lightFormat } from "date-fns";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Calendar,
  Checkbox,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@netizen/ui";
import { Button, Input } from "@netizen/ui/server";
import { isUuid } from "@netizen/utils-types";
import { SessionUpdateRequest } from "@nanikore/libs-event";

interface UpdateSessionFormProps {
  projectId: string;
  sessionId: string;
  onUpdated: () => void;
}

const formSchema = z.object({
  userId: z.string().refine(isUuid, "Invalid user ID").optional(),
  date: z.date().optional(),
  time: z.string().optional(),
  duration: z.coerce.number().min(10, "Session duration must be longer than ten minutes.").optional(),
  change: z.boolean().default(false).optional(),
});

function UpdateSessionForm({ onUpdated, projectId, sessionId }: UpdateSessionFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // @TODO: turn this into server action
    const request: SessionUpdateRequest = {
      userId: values.userId,
      duration: values.duration,
      change: Boolean(values.change),
    };
    if (values.date && values.time) {
      // @TODO: add time values
      request.timeslot = values.date.getTime();
    }
    setLoading(true);
    await fetch(`/api/event/admin/${projectId}/${sessionId}`, {
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
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>User ID</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
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
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Session duration</FormLabel>
              <FormControl>
                <Input type="number" inputMode="decimal" autoComplete="off" min="10" {...field} />
              </FormControl>
              <FormDescription>Duration in minutes (minimum 10)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="change"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-4 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="leading-none">Request changes</FormLabel>
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button className="w-20">{loading ? <CircleNotch className="animate-spin" /> : "Update"}</Button>
        </div>
      </form>
    </Form>
  );
}

interface UpdateSessionProps {
  projectId: string;
  sessionId: string;
}

export default function UpdateSession(props: UpdateSessionProps) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update session</DialogTitle>
        </DialogHeader>
        <UpdateSessionForm {...props} onUpdated={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
