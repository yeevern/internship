"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CameraSelection,
  ContentShareControl,
  MicSelection,
  MicrophoneActivity,
  QualitySelection,
  RosterAttendee,
  SpeakerSelection,
  VideoInputControl,
  VideoTileGrid,
  useMeetingManager,
} from "amazon-chime-sdk-component-library-react";
import { MeetingSessionConfiguration } from "amazon-chime-sdk-js";
import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@netizen/ui";
import { AlertTitle, Alert, Button, Input, Textarea } from "@netizen/ui/server";
import { useAlertContext, useAlertDispatchContext } from "@/context/alertProvider";
import { windowIsDefined } from "@/utils/types";
import { createMeetingAction, getAttendeeJoinInfoAction, getMeetingInfoAction } from "./action";
import { getAttendeeJoinInfoSchema, createMeetingSchema, getMeetingSchema } from "./entities";

function SubmitButton() {
  const dispatch = useAlertDispatchContext();
  const { pending } = useFormStatus();
  useEffect(() => {
    if (pending)
      dispatch({
        type: "add",
        message: {
          id: "loading",
          type: "info",
          message: "¡¡¡¡¡!!!!!¡¡¡¡¡!!!!!¡¡¡¡¡!!!!!Loading¡¡¡¡¡!!!!!¡¡¡¡¡!!!!!¡¡¡¡¡!!!!!",
        },
      });
    else dispatch({ type: "remove", id: "loading" });
  }, [pending, dispatch]);
  return (
    <div className="flex justify-end">
      <Button type="submit" aria-disabled={pending}>
        Submit
      </Button>
    </div>
  );
}

function CreateMeetingForm() {
  const dispatch = useAlertDispatchContext();
  const [hidden, setHidden] = useState(false);
  const form = useForm<z.infer<typeof createMeetingSchema>>({
    resolver: zodResolver(createMeetingSchema),
    defaultValues: {
      sessionId: windowIsDefined((w) => (w ? w.crypto.randomUUID() : "")),
      attendees: {
        moderator: windowIsDefined((w) => (w ? w.crypto.randomUUID() : "")),
        observer: windowIsDefined((w) => (w ? w.crypto.randomUUID() : "")),
        tester: windowIsDefined((w) => (w ? w.crypto.randomUUID() : "")),
      },
    },
  });
  const [state, createMeetingFormAction] = useFormState(createMeetingAction, { success: undefined });
  useEffect(() => {
    if (state.success) {
      dispatch({ type: "add", message: { type: "success", message: `Meeting Created: ${state.data.sessionId}` } });
      setHidden(true);
    } else if (state.success === false)
      dispatch({ type: "add", message: { type: "danger", message: `Error: ${state.error.message}` } });
  }, [state, dispatch]);

  return (
    <Form {...form}>
      <form
        action={() => {
          form.handleSubmit(createMeetingFormAction)();
        }}
        className="max-w-xl space-y-6"
      >
        <FormField
          control={form.control}
          name="sessionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Session Id</FormLabel>
              <FormControl>
                <Input type="string" autoComplete="off" {...field} />
              </FormControl>
              <FormDescription>Session Id</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="attendees.moderator"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Moderator User Id</FormLabel>
              <FormControl>
                <Input type="string" autoComplete="off" {...field} />
              </FormControl>
              <FormDescription>Only 1 in example. Can be more than 1.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="attendees.tester"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tester User Id</FormLabel>
              <FormControl>
                <Input type="string" autoComplete="off" {...field} />
              </FormControl>
              <FormDescription>Only 1 in example. Can be more than 1.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="attendees.observer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observer User Id</FormLabel>
              <FormControl>
                <Input type="string" autoComplete="off" {...field} />
              </FormControl>
              <FormDescription>Only 1 in example. Can be more than 1.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {!hidden && <SubmitButton />}
      </form>
    </Form>
  );
}

function GetMeetingInfoForm() {
  const dispatch = useAlertDispatchContext();
  const form = useForm<z.infer<typeof getMeetingSchema>>({
    resolver: zodResolver(getMeetingSchema),
    defaultValues: {
      sessionId: "",
    },
  });
  const [state, getMeetingInfoFormAction] = useFormState(getMeetingInfoAction, { success: undefined });
  useEffect(() => {
    if (state.success === false)
      dispatch({ type: "add", message: { type: "danger", message: `Error: ${state.error.message}` } });
  }, [state, dispatch]);
  return (
    <>
      <Form {...form}>
        <form
          action={() => {
            form.handleSubmit(getMeetingInfoFormAction)();
          }}
          className="max-w-xl space-y-6"
        >
          <FormField
            control={form.control}
            name="sessionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Session Id</FormLabel>
                <FormControl>
                  <Input type="string" autoComplete="off" {...field} />
                </FormControl>
                <FormDescription>Session Id</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <SubmitButton />
        </form>
      </Form>
      <hr />
      {state.success && (
        <>
          <h2>Meeting Id:</h2>
          <p>{state.data.meetingId}</p>
          <hr />
          <h2>Meeting Media Placement:</h2>
          <pre>{JSON.stringify(state.data.mediaPlacement, null, 2)}</pre>
        </>
      )}
    </>
  );
}

function GetAttendeeInfoForm() {
  const dispatch = useAlertDispatchContext();
  const form = useForm<z.infer<typeof getAttendeeJoinInfoSchema>>({
    resolver: zodResolver(getAttendeeJoinInfoSchema),
    defaultValues: {
      sessionId: "",
      userId: "",
    },
  });
  const [state, getAttendeeInfoFormAction] = useFormState(getAttendeeJoinInfoAction, { success: undefined });
  useEffect(() => {
    if (state.success === false)
      dispatch({ type: "add", message: { type: "danger", message: `Error: ${state.error.message}` } });
  }, [state, dispatch]);
  return (
    <>
      <Form {...form}>
        <form
          action={() => {
            form.handleSubmit(getAttendeeInfoFormAction)();
          }}
          className="max-w-xl space-y-6"
        >
          <FormField
            control={form.control}
            name="sessionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Session Id</FormLabel>
                <FormControl>
                  <Input type="string" autoComplete="off" {...field} />
                </FormControl>
                <FormDescription>Session Id</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User Id</FormLabel>
                <FormControl>
                  <Input type="string" autoComplete="off" {...field} />
                </FormControl>
                <FormDescription>Attendee Id</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <SubmitButton />
        </form>
      </Form>
      <hr />
      {state.success && (
        <>
          <h2>Attendee Id:</h2>
          <p>{state.data.attendeeId}</p>
          <hr />
          <h2>Token:</h2>
          <p>{state.data.token}</p>
        </>
      )}
    </>
  );
}

function ChimeMeetingPage() {
  const [attendeeId, setAttendeeId] = useState("");
  const meetingSchema = z.object({
    meetingId: z.string().uuid(),
    mediaPlacement: z.string(),
    userId: z.string().uuid(),
    attendeeId: z.string().uuid(),
    joinToken: z.string(),
  });
  const form = useForm<z.infer<typeof meetingSchema>>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      meetingId: "",
      userId: "",
      attendeeId: "",
      joinToken: "",
      mediaPlacement: "",
    },
  });

  const meetingManager = useMeetingManager();

  const startMeeting = async () => {
    await meetingManager.start();
  };

  const onSubmit = async (value: z.infer<typeof meetingSchema>) => {
    const meetingSessionConfiguration = new MeetingSessionConfiguration(
      {
        MeetingId: value.meetingId,
        MediaPlacement: JSON.parse(value.mediaPlacement),
      },
      {
        ExternalUserId: value.userId,
        AttendeeId: value.attendeeId,
        JoinToken: value.joinToken,
      },
    );
    setAttendeeId(value.attendeeId);

    // Create a `MeetingSession` using `join()` function with the `MeetingSessionConfiguration`
    await meetingManager.join(meetingSessionConfiguration);

    // At this point you could let users setup their devices, or by default
    // the SDK will select the first device in the list for the kind indicated
    // by `deviceLabels` (the default value is DeviceLabels.AudioAndVideo)
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-xl space-y-6">
          <FormField
            control={form.control}
            name="meetingId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meeting Id</FormLabel>
                <FormControl>
                  <Input type="string" autoComplete="off" {...field} />
                </FormControl>
                <FormDescription>Meeting Id</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mediaPlacement"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Media Placement</FormLabel>
                <FormControl>
                  <Textarea autoComplete="off" {...field} />
                </FormControl>
                <FormDescription>Media Placement JSON</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User Id</FormLabel>
                <FormControl>
                  <Input type="string" autoComplete="off" {...field} />
                </FormControl>
                <FormDescription>User Id</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="attendeeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Attendee Id</FormLabel>
                <FormControl>
                  <Input type="string" autoComplete="off" {...field} />
                </FormControl>
                <FormDescription>Attendee Id</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="joinToken"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Join Token</FormLabel>
                <FormControl>
                  <Input type="string" autoComplete="off" {...field} />
                </FormControl>
                <FormDescription>Join Token</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <SubmitButton />
        </form>
      </Form>
      <Button onClick={startMeeting}>Start Meeting</Button>
      <h2>Camera</h2>
      <CameraSelection />
      <QualitySelection />
      <hr />
      <h2>Sound</h2>
      <MicSelection />
      <SpeakerSelection />
      <hr />
      <h2>Preview</h2>
      {/* <PreviewVideo /> */}
      <hr />
      <h2>Videos</h2>
      <div style={{ height: "30rem", width: "100%" }}>
        <VideoTileGrid />
      </div>
      <hr />
      <VideoInputControl />
      <ContentShareControl />
      <MicrophoneActivity attendeeId={attendeeId} />
      <RosterAttendee attendeeId={attendeeId} />
      <hr />
    </>
  );
}

// @TODO: Remove this page once chime is integrated into the app.
// This is a test page to illustrate the use of the chime api. It is not intended to be used in production.
export default function ChimeTestPage() {
  const alerts = useAlertContext();
  const dispatch = useAlertDispatchContext();
  const [index, updateIndex] = useState(0);
  return (
    <>
      {alerts.map((alert, i) => {
        if (alert.timout)
          setTimeout(() => {
            dispatch({ type: "remove", index: i });
          }, alert.timout);
        return (
          <Alert
            key={i}
            variant={alert.type}
            onDismiss={() => {
              dispatch({ type: "remove", index: i });
            }}
          >
            <AlertTitle>{alert.message}</AlertTitle>
          </Alert>
        );
      })}
      <hr />
      <h1>This is a page to test chime</h1>
      <hr />
      <Button onClick={() => updateIndex(0)}>Create Meeting</Button>
      <Button onClick={() => updateIndex(1)}>Get Meeting Info</Button>
      <Button onClick={() => updateIndex(2)}>Get Attendee Info</Button>
      <Button onClick={() => updateIndex(3)}>Join Meeting</Button>
      <hr />
      <div className={index === 0 ? "block" : "hidden"}>
        <h2>Create Meeting</h2>
        <CreateMeetingForm />
      </div>
      <div className={index === 1 ? "block" : "hidden"}>
        <h2>Get Meeting Info</h2>
        <GetMeetingInfoForm />
      </div>
      <div className={index === 2 ? "block" : "hidden"}>
        <h2>Get Attendee Info</h2>
        <GetAttendeeInfoForm />
      </div>
      <div className={index === 3 ? "block" : "hidden"}>
        <h2>Join Meeting</h2>
        <ChimeMeetingPage />
      </div>
    </>
  );
}
