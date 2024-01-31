"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CaretDown } from "@phosphor-icons/react/dist/ssr";
import { add, lightFormat, set, subDays } from "date-fns";
import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Calendar,
  Checkbox,
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
import { cn } from "@netizen/utils-ui";
import { EventCreateRequest, EventSessionCreateRequest } from "@nanikore/libs-event";

enum WeekDay {
  Sunday,
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
}

// const PROJECT_ID = "c63be203-b26b-44d8-b709-0ee97b8e47d6";
const PROJECT_ID = "aa35529d-94a4-4978-84e6-490ce682ae25";

const formSchema = z.object({
  projectId: z.string().refine(isUuid, "Invalid project ID"),
  startDate: z.date(),
  days: z.array(z.string()).nonempty("You have to select at least one day."),
  sessions: z.coerce.number().int().min(1, "You have to configure at least one session per day."),
  duration: z.coerce.number().min(10, "Session duration must be longer than ten minutes."),
  workingHours: z.tuple([z.coerce.number().int().min(0).max(23), z.coerce.number().int().min(0).max(23)]),
  avoidHours: z.string(),
});

export function CreateEvent() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectId: PROJECT_ID,
      startDate: new Date(),
      days: [],
      sessions: 5,
      duration: 60,
      workingHours: [9, 17],
      avoidHours: "12,13",
    },
  });

  const onGenerateUuid: React.MouseEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.crypto) {
      const uuid = window.crypto.randomUUID();
      if (isUuid(uuid)) form.setValue("projectId", uuid);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // @TODO: turn this into server action
    const duration = Math.ceil(values.duration / 30) * 30;
    const avoidHours = values.avoidHours.split(",").reduce<number[]>((hours, h) => {
      const parsedHour = parseInt(h.trim());
      if (!isNaN(parsedHour) && parsedHour >= 0 && parsedHour < 24) return [...hours, parsedHour];
      return hours;
    }, []);
    let numberOfSessions = values.sessions;
    let endDate = set(values.startDate, { hours: values.workingHours[0] });
    let infiniteLoopCheck = 0;
    const sessions: EventSessionCreateRequest[] = [];
    // @TODO: move to next slot if end hours falls in avoid hours
    while (numberOfSessions--) {
      if (values.days.map((value) => Number(value)).includes(endDate.getDay())) {
        sessions.push({
          timeslot: endDate.getTime(),
          duration,
        });
        endDate = add(endDate, { minutes: duration });
        while (
          Array(add(endDate, { minutes: duration }).getHours() - endDate.getHours())
            .fill(0)
            .map((_, i) => endDate.getHours() + i) // eslint-disable-line no-loop-func -- While loop is required here to recursively create sessions until requirements are met.
            .some((hour) => avoidHours.includes(hour))
        ) {
          endDate = add(set(endDate, { minutes: 0 }), { hours: 1 });
        }
        if (endDate.getHours() >= values.workingHours[1]) {
          endDate = set(add(endDate, { days: 1 }), { hours: values.workingHours[0] });
        }
      } else {
        numberOfSessions++;
        endDate = set(add(endDate, { days: 1 }), { hours: values.workingHours[0] });
      }
      if (infiniteLoopCheck++ > 1000) throw new Error("Infinite loop detected");
    }

    const request: EventCreateRequest = {
      projectId: values.projectId,
      startDate: values.startDate.getTime(),
      endDate: endDate.getTime(),
      status: "active",
      sessions,
    };
    await fetch("/api/event/admin", { method: "POST", body: JSON.stringify(request) });
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-xl space-y-6">
        <FormField
          control={form.control}
          name="projectId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project ID</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input readOnly disabled {...field} />
                  <Button
                    variant="secondary"
                    className={cn(
                      "absolute right-0 top-0 h-14 rounded-l-none",
                      globalThis.window && globalThis.window.crypto === undefined && "hidden",
                    )}
                    onClick={onGenerateUuid}
                  >
                    Generate UUID
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="flex flex-col items-start">
              <FormLabel>Start date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button variant="secondary" className="h-14 w-[248px] justify-between text-base font-normal">
                      <span>{field.value ? lightFormat(field.value, "dd/MM/yyyy") : "Pick a date"}</span>
                      <CaretDown size={24} className="ml-4" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar
                    mode="single"
                    initialFocus
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date >= new Date("1900-01-01") && date < subDays(new Date(), 1)}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="days"
          render={() => (
            <FormItem className="space-y-2">
              <FormLabel>Days</FormLabel>
              {Object.keys(WeekDay)
                .filter((value) => !isNaN(Number(value)))
                .map((day) => (
                  <FormField
                    key={day}
                    control={form.control}
                    name="days"
                    render={({ field }) => (
                      <FormItem key={day}>
                        <FormControl>
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id={`days-${day}`}
                              checked={field.value?.includes(day)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, day])
                                  : field.onChange(field.value?.filter((value) => value !== day));
                              }}
                            />
                            <label htmlFor={`days-${day}`}>{WeekDay[Number(day)]}</label>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="sessions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of sessions</FormLabel>
              <FormControl>
                <Input type="number" inputMode="decimal" autoComplete="off" min="1" {...field} />
              </FormControl>
              <FormDescription>Minimum of one session</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event duration</FormLabel>
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
          name="workingHours"
          render={() => (
            <FormItem>
              <FormLabel>Working Hours</FormLabel>
              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="workingHours.0"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormControl>
                        <Input type="number" inputMode="decimal" autoComplete="off" placeholder="Start" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="workingHours.1"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormControl>
                        <Input type="number" inputMode="decimal" autoComplete="off" placeholder="End" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormDescription>Hours in 24-hour format</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="avoidHours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Off hours</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>Hours in 24-hour format separated by commas</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Form>
  );
}
