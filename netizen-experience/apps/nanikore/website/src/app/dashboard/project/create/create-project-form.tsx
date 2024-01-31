"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash } from "@phosphor-icons/react/dist/ssr";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import {
  DatePicker,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  ToggleGroup,
  ToggleGroupItem,
} from "@netizen/ui";
import { Button, IconButton, Input } from "@netizen/ui/server";
import { ProjectType, projectDeviceTypeValues, projectTypeLabels } from "@nanikore/libs-project";
import { createProjectAction } from "./action";

const formSchema = z.object({
  name: z.string().refine((value) => value.length, { message: "Please enter a project name." }),
  company: z.string().refine((value) => value.length, { message: "Please enter company name." }),
  clientIds: z
    .array(z.object({ username: z.string() }))
    .min(1, { message: "Please enter at least one project client." }),
  researcherIds: z
    .array(z.object({ username: z.string() }))
    .min(1, { message: "Please enter at least one project team member." }),
  dateRange: z
    .object({
      startDate: z.date(),
      endDate: z.date(),
    })
    .refine(({ endDate, startDate }) => endDate >= startDate, {
      message: "End date cannot be earlier than start date.",
    }),
  language: z.array(z.object({ type: z.string() })).min(1, { message: "Please enter at least one language used." }),
  interpretedLanguage: z
    .array(z.object({ type: z.string() }))
    .min(1, { message: "Please enter at least one interpreter's language." }),
  incentive: z.coerce.number(),
  respondentCount: z.coerce.number(),
  isRemote: z.enum(["remote", "in-person"]).optional(),
  deviceType: z
    .enum(projectDeviceTypeValues)
    .array()
    .min(1, { message: "Please select at least one device type." })
    .optional(),
  backupRespondentCount: z.coerce.number().optional(),
  observerIds: z
    .array(z.object({ username: z.string() }))
    .min(1, { message: "Please enter at least one project observer." })
    .optional(),
  moderatorIds: z
    .array(z.object({ username: z.string() }))
    .min(1, { message: "Please enter at least one project moderator." })
    .optional(),
});

export type CreateProjectFormValues = z.infer<typeof formSchema>;

export default function CreateProjectForm({ type }: { type: ProjectType }) {
  const router = useRouter();
  const hasIsRemoteField = (["focusGroup", "userInterview", "moderatedTesting"] as ProjectType[]).includes(type);
  const hasDeviceTypeField = (["moderatedTesting", "unmoderatedTesting"] as ProjectType[]).includes(type);
  const hasBackupRespondentCountField = !(["survey", "unmoderatedTesting"] as ProjectType[]).includes(type);
  const hasObserverModeratorFields = (["focusGroup", "userInterview", "moderatedTesting"] as ProjectType[]).includes(
    type,
  );

  // @TODO: remove manual form unregister for array fields after resolve issue of removed fields still registered in form context
  const form = useForm<CreateProjectFormValues>({
    resolver: zodResolver(formSchema),
    shouldUnregister: true,
    defaultValues: {
      name: "",
      company: "",
      clientIds: [],
      researcherIds: [],
      dateRange: {
        startDate: new Date(Date.now()),
        endDate: new Date(Date.now()),
      },
      language: [],
      interpretedLanguage: [],
      incentive: 0,
      respondentCount: 0,
      isRemote: hasIsRemoteField ? "remote" : undefined,
      deviceType: hasDeviceTypeField ? ["mobile"] : undefined,
      backupRespondentCount: hasBackupRespondentCountField ? 0 : undefined,
      observerIds: hasObserverModeratorFields ? [] : undefined,
      moderatorIds: hasObserverModeratorFields ? [] : undefined,
    },
  });

  const researcherIdsFieldArray = useFieldArray({
    name: "researcherIds",
    control: form.control,
    shouldUnregister: true,
  });
  const clientIdsFieldArray = useFieldArray({ name: "clientIds", control: form.control, shouldUnregister: true });
  const languageFieldArray = useFieldArray({ name: "language", control: form.control, shouldUnregister: true });
  const interpretedLanguageFieldArray = useFieldArray({
    name: "interpretedLanguage",
    control: form.control,
    shouldUnregister: true,
  });
  const observerIdsFieldArray = useFieldArray({ name: "observerIds", control: form.control, shouldUnregister: true });
  const moderatorIdsFieldArray = useFieldArray({ name: "moderatorIds", control: form.control, shouldUnregister: true });

  const [observerIdsField, moderatorIdsField] = form.watch(["observerIds", "moderatorIds"]);

  async function onSubmit(formValues: CreateProjectFormValues) {
    await createProjectAction(type, formValues);
  }

  useEffect(() => {
    if (observerIdsField && observerIdsField.length < 1 && !hasObserverModeratorFields)
      form.setValue("observerIds", undefined);
    if (moderatorIdsField && moderatorIdsField.length < 1 && !hasObserverModeratorFields)
      form.setValue("moderatorIds", undefined);
  }, [observerIdsField, moderatorIdsField, form, hasObserverModeratorFields]);

  return (
    <div className="py-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col justify-center space-y-10">
          <div className="flex items-start justify-between">
            <div className="flex flex-col items-start justify-between space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="grid items-center space-y-4">
                    <FormControl>
                      <Input {...field} placeholder="Type Project Name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>{projectTypeLabels[type]}</div>
            </div>
            <Button type="submit">Save</Button>
          </div>
          <div className="grid space-y-6 p-8">
            <FormField
              control={form.control}
              name="researcherIds"
              render={() => (
                <FormItem className="grid grid-cols-4 items-center space-y-4">
                  <FormLabel>Team members</FormLabel>
                  {researcherIdsFieldArray.fields.length > 0 &&
                    researcherIdsFieldArray.fields.map((researcherIdsField, index) => (
                      <div key={researcherIdsField.id} className="col-span-3 col-start-2 flex items-center">
                        <FormField
                          control={form.control}
                          name={`researcherIds.${index}.username` as const}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <IconButton
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            researcherIdsFieldArray.remove(index);
                            form.unregister(`researcherIds.${index}.username`);
                          }}
                          tabIndex={-1}
                        >
                          <Trash />
                        </IconButton>
                      </div>
                    ))}
                  <Button
                    variant="secondary"
                    type="button"
                    size="lg"
                    className="col-span-3 col-start-2"
                    onClick={() => researcherIdsFieldArray.append({ username: "" })}
                  >
                    <Plus />
                    <span>Add a team member</span>
                  </Button>
                  <FormMessage className="col-span-3 col-start-2" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center space-y-4">
                  <>
                    <FormLabel>Company</FormLabel>
                    <FormControl className="col-span-3">
                      <Input {...field} />
                    </FormControl>
                  </>
                  <FormMessage className="col-span-3 col-start-2" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clientIds"
              render={() => (
                <FormItem className="grid grid-cols-4 items-center space-y-4">
                  <FormLabel>Client</FormLabel>
                  {clientIdsFieldArray.fields.length > 0 &&
                    clientIdsFieldArray.fields.map((clientIdsField, index) => (
                      <div key={clientIdsField.id} className="col-span-3 col-start-2 flex items-center">
                        <FormField
                          control={form.control}
                          name={`clientIds.${index}.username` as const}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <IconButton
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            clientIdsFieldArray.remove(index);
                            form.unregister(`clientIds.${index}.username`);
                          }}
                          tabIndex={-1}
                        >
                          <Trash />
                        </IconButton>
                      </div>
                    ))}
                  <Button
                    variant="secondary"
                    type="button"
                    size="lg"
                    className="col-span-3 col-start-2"
                    onClick={() => clientIdsFieldArray.append({ username: "" })}
                  >
                    <Plus />
                    <span>Add a client</span>
                  </Button>
                  <FormMessage className="col-span-3 col-start-2" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dateRange"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center space-y-4">
                  <>
                    <FormLabel>Project period</FormLabel>
                    <div className="col-span-2 flex items-center justify-start space-x-6">
                      <FormControl>
                        <DatePicker
                          mode="single"
                          selected={field.value.startDate}
                          value={format(field.value.startDate, "dd MMM yyyy")}
                          onSelect={(e) =>
                            field.onChange({ startDate: e ?? field.value.startDate, endDate: field.value.endDate })
                          }
                        />
                      </FormControl>
                      <span>to</span>
                      <DatePicker
                        mode="single"
                        selected={field.value.endDate}
                        value={format(field.value.endDate, "dd MMM yyyy")}
                        onSelect={(e) =>
                          field.onChange({ startDate: field.value.startDate, endDate: e ?? field.value.endDate })
                        }
                      />
                    </div>
                  </>
                  <FormMessage className="col-span-3 col-start-2" />
                </FormItem>
              )}
            />
            {hasIsRemoteField && (
              <FormField
                control={form.control}
                name="isRemote"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center space-y-4">
                    <>
                      <FormLabel>Session mode</FormLabel>
                      <FormControl>
                        <ToggleGroup
                          type="single"
                          variant="outline"
                          className="col-span-2 grid grid-cols-2"
                          value={field.value}
                          onValueChange={(e) => field.onChange(e === "" ? field.value : e)}
                        >
                          <ToggleGroupItem value="remote" aria-label="Toggle remote session">
                            Remote
                          </ToggleGroupItem>
                          <ToggleGroupItem value="in-person" aria-label="Toggle in-person session">
                            In-Person
                          </ToggleGroupItem>
                        </ToggleGroup>
                      </FormControl>
                    </>
                    <FormMessage className="col-span-3 col-start-2" />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="respondentCount"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center space-y-4">
                  <>
                    <FormLabel>Number of respondents</FormLabel>
                    <FormControl>
                      <Input type="number" inputMode="numeric" {...field} />
                    </FormControl>
                  </>
                  <FormMessage className="col-span-3 col-start-2" />
                </FormItem>
              )}
            />
            {hasBackupRespondentCountField && (
              <FormField
                control={form.control}
                name="backupRespondentCount"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center space-y-4">
                    <>
                      <FormLabel>Number of backup respondents</FormLabel>
                      <FormControl>
                        <Input type="number" inputMode="numeric" {...field} />
                      </FormControl>
                    </>
                    <FormMessage className="col-span-3 col-start-2" />
                  </FormItem>
                )}
              />
            )}
            {hasDeviceTypeField && (
              <FormField
                control={form.control}
                name="deviceType"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center space-y-4">
                    <>
                      <FormLabel>Device type</FormLabel>
                      <FormControl>
                        <ToggleGroup
                          type="multiple"
                          variant="outline"
                          className="col-span-2 grid grid-cols-3"
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <ToggleGroupItem value="mobile" aria-label="Toggle mobile device">
                            Mobile
                          </ToggleGroupItem>
                          <ToggleGroupItem value="tablet" aria-label="Toggle tablet device">
                            Tablet
                          </ToggleGroupItem>
                          <ToggleGroupItem value="desktop" aria-label="Toggle desktop device">
                            Desktop
                          </ToggleGroupItem>
                        </ToggleGroup>
                      </FormControl>
                    </>
                    <FormMessage className="col-span-3 col-start-2" />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="language"
              render={() => (
                <FormItem className="g]] grid grid-cols-4 items-center space-y-4">
                  <FormLabel className="row-span-1">Language used</FormLabel>
                  {languageFieldArray.fields.length > 0 &&
                    languageFieldArray.fields.map((languageField, index) => (
                      <div key={languageField.id} className="col-span-3 col-start-2 flex items-center">
                        <FormField
                          control={form.control}
                          name={`language.${index}.type` as const}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <IconButton
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            languageFieldArray.remove(index);
                            form.unregister(`language.${index}.type`);
                          }}
                          tabIndex={-1}
                        >
                          <Trash />
                        </IconButton>
                      </div>
                    ))}
                  <Button
                    variant="secondary"
                    type="button"
                    size="lg"
                    className="col-span-3 col-start-2"
                    onClick={() => languageFieldArray.append({ type: "" })}
                  >
                    <Plus />
                    <span>Add a language</span>
                  </Button>
                  <FormMessage className="col-span-3 col-start-2" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="interpretedLanguage"
              render={() => (
                <FormItem className="grid grid-cols-4 items-center space-y-4">
                  <FormLabel className="row-span-1">Interpreter's language</FormLabel>
                  {interpretedLanguageFieldArray.fields.length > 0 &&
                    interpretedLanguageFieldArray.fields.map((interpretedLanguageField, index) => (
                      <div key={interpretedLanguageField.id} className="col-span-3 col-start-2 flex items-center">
                        <FormField
                          control={form.control}
                          name={`interpretedLanguage.${index}.type` as const}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <IconButton
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            interpretedLanguageFieldArray.remove(index);
                            form.unregister(`interpretedLanguage.${index}.type`);
                          }}
                          tabIndex={-1}
                        >
                          <Trash />
                        </IconButton>
                      </div>
                    ))}
                  <Button
                    variant="secondary"
                    type="button"
                    size="lg"
                    className="col-span-3 col-start-2"
                    onClick={() => interpretedLanguageFieldArray.append({ type: "" })}
                  >
                    <Plus />
                    <span>Add a language</span>
                  </Button>
                  <FormMessage className="col-span-3 col-start-2" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="incentive"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center space-y-4">
                  <>
                    <FormLabel>Incentive</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type="number" inputMode="numeric" {...field} />
                        <span className="absolute bottom-0 right-4 top-0 m-auto h-fit">credit</span>
                      </div>
                    </FormControl>
                  </>
                  <FormMessage className="col-span-3 col-start-2" />
                </FormItem>
              )}
            />
            {hasObserverModeratorFields && (
              <>
                <FormField
                  control={form.control}
                  name="observerIds"
                  render={() => (
                    <FormItem className="grid grid-cols-4 items-center space-y-4">
                      <FormLabel className="row-span-1">Observers</FormLabel>
                      {observerIdsFieldArray.fields.length > 0 &&
                        observerIdsFieldArray.fields.map((observerIdsField, index) => (
                          <div key={observerIdsField.id} className="col-span-3 col-start-2 flex items-center">
                            <FormField
                              control={form.control}
                              name={`observerIds.${index}.username` as const}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <IconButton
                              type="button"
                              variant="ghost"
                              onClick={() => {
                                observerIdsFieldArray.remove(index);
                                form.unregister(`observerIds.${index}.username`);
                              }}
                              tabIndex={-1}
                            >
                              <Trash />
                            </IconButton>
                          </div>
                        ))}
                      <Button
                        variant="secondary"
                        type="button"
                        size="lg"
                        className="col-span-3 col-start-2"
                        onClick={() => observerIdsFieldArray.append({ username: "" })}
                      >
                        <Plus />
                        <span>Add a observer</span>
                      </Button>
                      <FormMessage className="col-span-3 col-start-2" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="moderatorIds"
                  render={() => (
                    <FormItem className="grid grid-cols-4 items-center space-y-4">
                      <FormLabel className="row-span-1">Moderators</FormLabel>
                      {moderatorIdsFieldArray.fields.length > 0 &&
                        moderatorIdsFieldArray.fields.map((moderatorIdsField, index) => (
                          <div key={moderatorIdsField.id} className="col-span-3 col-start-2 flex items-center">
                            <FormField
                              control={form.control}
                              name={`moderatorIds.${index}.username` as const}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <IconButton
                              type="button"
                              variant="ghost"
                              onClick={() => {
                                moderatorIdsFieldArray.remove(index);
                                form.unregister(`moderatorIds.${index}.username`);
                              }}
                              tabIndex={-1}
                            >
                              <Trash />
                            </IconButton>
                          </div>
                        ))}
                      <Button
                        variant="secondary"
                        type="button"
                        size="lg"
                        className="col-span-3 col-start-2"
                        onClick={() => moderatorIdsFieldArray.append({ username: "" })}
                      >
                        <Plus />
                        <span>Add a moderator</span>
                      </Button>
                      <FormMessage className="col-span-3 col-start-2" />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
          <div className="flex items-center justify-between">
            <Button onClick={() => router.push("/dashboard/project")}>Cancel</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
