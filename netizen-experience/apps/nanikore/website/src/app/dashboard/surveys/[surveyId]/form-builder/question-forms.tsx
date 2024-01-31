"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowDown,
  ArrowUp,
  ArrowsDownUp,
  CaretUpDown,
  Check,
  CircleNotch,
  Plus,
  Trash,
} from "@phosphor-icons/react/dist/ssr";
import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useFieldArray, useForm, useFormContext } from "react-hook-form";
import {
  ButtonGroup,
  ButtonGroupItem,
  Checkbox,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  toast,
} from "@netizen/ui";
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Chip,
  EmptyState,
  EmptyStateButton,
  IconButton,
  Input,
} from "@netizen/ui/server";
import { useBoolean } from "@netizen/utils-hooks";
import { cn } from "@netizen/utils-ui";
import { Model, ModelMeta, Question, SurveyForm } from "@nanikore/libs-survey";
import { createQuestionAction, getModelAction, updateQuestionsAction } from "./actions";
import { QuestionFormValues, BulkEditFormValues, questionFormSchema, bulkEditFormSchema } from "./schema";

function ModelCombobox(props: { modelMetas: ModelMeta[] }) {
  const [open, setOpen] = useBoolean();
  const models = useRef(new Map<string, Model>());
  const { control, formState, resetField, setValue } = useFormContext<QuestionFormValues>();

  const handleModelChange = (onChangeCallback: (value: string) => void) => async (id: string) => {
    try {
      onChangeCallback(id);
      setOpen.off();
      const model = models.current.get(id) ?? (await getModelAction(id));
      models.current.set(id, model);
      setValue("modelId", model.modelId);
      setValue("modelType", model.type);
      switch (model.type) {
        case "selection":
          setValue(
            "selectionOptions",
            model.selections.map((option) => ({ value: option, label: "" })),
          );
          setValue("randomizeOptionOrder", formState.defaultValues?.randomizeOptionOrder ?? false);
          resetField("min");
          resetField("max");
          resetField("regex");
          break;
        case "date":
          if (model.min !== undefined) setValue("min", model.min);
          if (model.max !== undefined) setValue("max", model.max);
          resetField("selectionOptions");
          resetField("randomizeOptionOrder");
          break;
        case "number":
          if (model.min !== undefined) setValue("min", model.min);
          if (model.max !== undefined) setValue("max", model.max);
          resetField("selectionOptions");
          resetField("randomizeOptionOrder");
          break;
        case "string":
          if (model.regex !== undefined) setValue("regex", model.regex);
          resetField("selectionOptions");
          resetField("randomizeOptionOrder");
          break;
        default:
          break;
      }
    } catch (e) {
      toast.error("Failed to retrieve model attributes", { description: "Try again later" });
    }
  };

  return (
    <FormField
      control={control}
      name="id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Model ID</FormLabel>
          <FormControl>
            <Popover open={open} onOpenChange={setOpen.set}>
              <PopoverTrigger asChild>
                <Button
                  variant="secondary"
                  role="combobox"
                  aria-expanded={open}
                  className="flex w-full justify-between px-3 font-normal"
                >
                  <span>
                    {field.value ? props.modelMetas.find((meta) => meta.id === field.value)?.name : "Select model..."}
                  </span>
                  <CaretUpDown />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-full">
                <Command>
                  <CommandInput placeholder="Search models..." />
                  <CommandEmpty>No models found.</CommandEmpty>
                  <CommandGroup>
                    {props.modelMetas.map((meta) => (
                      <CommandItem key={meta.id} value={meta.id} onSelect={handleModelChange(field.onChange)}>
                        <Check className={cn("mr-2 h-4 w-4", meta.id === field.value ? "opacity-100" : "opacity-0")} />
                        {meta.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function SelectionOptionFields() {
  const form = useFormContext<QuestionFormValues>();
  const { append, fields, remove, swap } = useFieldArray({
    name: "selectionOptions",
    control: form.control,
  });

  return (
    <div className="space-y-2">
      <FormLabel>Options (Value, Label)</FormLabel>
      {fields.length > 0 &&
        fields.map((optionField, index, array) => (
          <div key={optionField.id} className="relative flex items-center">
            <FormField
              control={form.control}
              name={`selectionOptions.${index}.value`}
              render={({ field }) => (
                <FormItem className="mr-2 flex-1">
                  <FormControl>
                    <Input placeholder="Value" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`selectionOptions.${index}.label`}
              render={({ field }) => (
                <FormItem className="mr-2 flex-1">
                  <FormControl>
                    <Input placeholder="Display text" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <IconButton
              type="button"
              variant="ghost"
              size="sm"
              className="[&>svg]:h-4 [&>svg]:w-4"
              disabled={index === 0}
              onClick={() => swap(index, index - 1)}
              tabIndex={-1}
            >
              <ArrowUp />
            </IconButton>
            <IconButton
              type="button"
              variant="ghost"
              size="sm"
              className="[&>svg]:h-4 [&>svg]:w-4"
              disabled={index === array.length - 1}
              onClick={() => swap(index, index + 1)}
              tabIndex={-1}
            >
              <ArrowDown />
            </IconButton>
            <IconButton
              type="button"
              variant="ghost"
              size="sm"
              className="[&>svg]:h-4 [&>svg]:w-4"
              onClick={() => remove(index)}
              tabIndex={-1}
            >
              <Trash />
            </IconButton>
          </div>
        ))}
      <FormMessage />
      <Button
        variant="secondary"
        type="button"
        className="w-[calc(100%_-_104px)] border-dashed text-muted-foreground [&>svg]:h-4 [&>svg]:w-4"
        onClick={() => append({ value: "", label: "" })}
      >
        Add option
      </Button>
      <FormDescription>The value will be displayed if its respective label is left blank.</FormDescription>
    </div>
  );
}

type QuestionFormProps =
  | {
      mode: "create";
      onAction: (values: QuestionFormValues) => void;
      initialValues?: never;
      modelMetas: ModelMeta[];
    }
  | {
      mode: "update";
      onAction: (values: Partial<QuestionFormValues>) => void;
      initialValues?: Partial<QuestionFormValues>;
      modelMetas: ModelMeta[];
    };

function QuestionForm({ initialValues, mode, modelMetas, onAction }: QuestionFormProps) {
  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      isOptional: false,
      selectionOptions: [],
      randomizeOptionOrder: false,
      ...initialValues,
    },
  });
  const watchModelId = form.watch("id");
  const watchModelType = form.watch("modelType");

  const handleAction = () => {
    form.handleSubmit((values) => {
      if (mode === "update") {
        const { dirtyFields } = form.formState;
        onAction({
          // @TODO: abstract this
          ...(dirtyFields.id ? { id: values.id } : {}),
          ...(dirtyFields.modelId ? { modelId: values.modelId } : {}),
          ...(dirtyFields.modelType ? { modelType: values.modelType } : {}),
          ...(dirtyFields.questionType ? { questionType: values.questionType } : {}),
          ...(dirtyFields.question ? { question: values.question } : {}),
          ...(dirtyFields.helperText ? { helperText: values.helperText } : {}),
          ...(dirtyFields.isOptional ? { isOptional: values.isOptional } : {}),
          ...(dirtyFields.selectionOptions ? { selectionOptions: values.selectionOptions } : {}),
          ...(dirtyFields.randomizeOptionOrder ? { randomizeOptionOrder: values.randomizeOptionOrder } : {}),
          ...(dirtyFields.min !== undefined ? { min: values.min } : {}),
          ...(dirtyFields.max !== undefined ? { max: values.max } : {}),
          ...(dirtyFields.regex ? { regex: values.regex } : {}),
        });
      } else {
        onAction(values);
      }
    })();
  };

  return (
    <Form {...form}>
      <form action={handleAction} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <ModelCombobox modelMetas={modelMetas} />
          <FormField
            control={form.control}
            name="questionType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Question Type</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} disabled={!watchModelId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a question type" />
                    </SelectTrigger>
                    <SelectContent>
                      {watchModelType === "selection" ? (
                        <SelectGroup>
                          <SelectLabel>Selection types</SelectLabel>
                          <SelectItem value="radio">Radio buttons</SelectItem>
                          <SelectItem value="checkbox">Checkboxes</SelectItem>
                        </SelectGroup>
                      ) : watchModelType === "date" ? (
                        <SelectGroup>
                          <SelectLabel>Date types</SelectLabel>
                          <SelectItem value="singleDate">Date - Single</SelectItem>
                          <SelectItem value="multiDate">Date - Multi</SelectItem>
                          <SelectItem value="dateRange">Date - Range</SelectItem>
                        </SelectGroup>
                      ) : watchModelType === "number" ? (
                        <SelectGroup>
                          <SelectLabel>Number types</SelectLabel>
                          <SelectItem value="integer">Integer</SelectItem>
                          <SelectItem value="rating">Rating</SelectItem>
                        </SelectGroup>
                      ) : watchModelType === "string" ? (
                        <SelectGroup>
                          <SelectLabel>String types</SelectLabel>
                          <SelectItem value="shortText">Short text field</SelectItem>
                          <SelectItem value="longText">Long text field</SelectItem>
                        </SelectGroup>
                      ) : null}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="question"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="helperText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Helper text</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {watchModelType === "selection" && <SelectionOptionFields />}
        <div className="space-y-1">
          {watchModelType === "selection" && (
            <FormField
              control={form.control}
              name="randomizeOptionOrder"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-4 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="leading-none">Randomize selection options</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="isOptional"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-4 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="leading-none">Mark as optional</FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit">Add question</Button>
        </div>
      </form>
    </Form>
  );
}

function BulkEditSaveButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending && <CircleNotch className="animate-spin" />}
      <span>{pending ? "Saving changes..." : "Save changes"}</span>
    </Button>
  );
}

interface BulkEditFormProps {
  surveyId: string;
  questions: Question[];
  onSubmitted: () => void;
  onCancel: () => void;
}

function BulkEditForm({ onCancel, onSubmitted, questions, surveyId }: BulkEditFormProps) {
  const form = useForm<BulkEditFormValues>({
    resolver: zodResolver(bulkEditFormSchema),
    defaultValues: {
      questions: questions.map((question) => ({
        questionId: question.id,
        question: question.question,
        questionType: question.type,
      })),
    },
  });
  const { fields, remove, swap } = useFieldArray({ name: "questions", control: form.control });
  const [formState, dispatchAction] = useFormState(updateQuestionsAction, { success: undefined });

  const handleAction = () => {
    form.handleSubmit((values) => {
      const removedQuestions = questions.reduce<string[]>(
        (acc, question) => (values.questions.find((q) => q.questionId === question.id) ? acc : [...acc, question.id]),
        [],
      );
      const updatedQuestions = values.questions.reduce<{ questionId: string; questionIndex: number }[]>(
        (acc, q, index) => {
          const question = questions.find((question) => question.id === q.questionId);
          if (question && index !== question.questionIndex)
            acc.push({ questionId: q.questionId, questionIndex: index });
          return acc;
        },
        [],
      );
      dispatchAction({ surveyId, questions: updatedQuestions, deleteQuestions: removedQuestions });
    })();
  };

  useEffect(() => {
    if (formState.success !== undefined) {
      if (formState.success) {
        if (formState.data?.failedQuestionIds.length) {
          toast.warning("Some questions could not be updated", {
            description: formState.data.failedQuestionIds.join(", "),
          });
        } else {
          toast.success("Questions updated");
        }
      } else {
        toast.error("Questions could not be updated", { description: formState.error.message });
      }
      onSubmitted();
    }
  }, [formState, onSubmitted]);

  return (
    <Form {...form}>
      <form action={handleAction} className="divide-y">
        {fields.map((question, index, array) => (
          <div key={question.id} className="flex items-center justify-between py-3 font-medium">
            <p className="flex items-baseline space-x-4">
              <span className="group-hover:underline">
                {index + 1}) {question.question}
              </span>
              <Chip size="sm">{question.questionType}</Chip>
            </p>
            <div>
              <IconButton
                type="button"
                variant="ghost"
                size="sm"
                className="[&>svg]:h-4 [&>svg]:w-4"
                disabled={index === 0}
                onClick={() => swap(index, index - 1)}
                tabIndex={-1}
              >
                <ArrowUp />
              </IconButton>
              <IconButton
                type="button"
                variant="ghost"
                size="sm"
                className="[&>svg]:h-4 [&>svg]:w-4"
                disabled={index === array.length - 1}
                onClick={() => swap(index, index + 1)}
                tabIndex={-1}
              >
                <ArrowDown />
              </IconButton>
              <IconButton
                type="button"
                variant="ghost"
                size="sm"
                className="text-danger-foreground [&>svg]:h-4 [&>svg]:w-4"
                onClick={() => remove(index)}
                tabIndex={-1}
              >
                <Trash />
              </IconButton>
            </div>
          </div>
        ))}
        <div className="flex justify-end space-x-2 pt-6">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <BulkEditSaveButton />
        </div>
      </form>
    </Form>
  );
}

interface QuestionSheetTriggerProps {
  surveyId: string;
  branchId: string;
  questionIndex: number;
  modelMetas: ModelMeta[];
  children?: React.ReactNode;
}

function QuestionSheetTrigger({ branchId, children, modelMetas, questionIndex, surveyId }: QuestionSheetTriggerProps) {
  const [open, setOpen] = useBoolean();
  const [formState, dispatchAction] = useFormState(createQuestionAction, { success: undefined });

  useEffect(() => {
    if (formState.success !== undefined) {
      if (formState.success) {
        toast.success("Question added");
      } else {
        toast.error("Question could not be added", { description: formState.error.message });
      }
    }
  }, [formState]);

  return (
    <Sheet open={open} onOpenChange={setOpen.set}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="overflow-y-auto sm:w-2/3 sm:max-w-lg">
        <SheetHeader className="mb-6">
          <SheetTitle>Add question</SheetTitle>
          <SheetDescription>
            Create a question that will be displayed to the participant. You can add a helper text to explain the
            question in more detail.
          </SheetDescription>
        </SheetHeader>
        <QuestionForm
          mode="create"
          onAction={(values) => {
            setOpen.off();
            dispatchAction({
              surveyId,
              branchId,
              questionIndex,
              ...values,
            });
          }}
          modelMetas={modelMetas}
        />
      </SheetContent>
    </Sheet>
  );
}

interface QuestionBuilderProps extends SurveyForm {
  modelMetas: ModelMeta[];
  questionList: React.ReactNode;
}

export function QuestionBuilder({ modelMetas, questionList, surveyId, ...props }: QuestionBuilderProps) {
  const branchId = props.tree.id;
  const questions = props.tree.questions.sort((a, b) => a.questionIndex - b.questionIndex);
  const [showBulkEditor, setShowBulkEditor] = useBoolean();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Questions</CardTitle>
      </CardHeader>
      <CardContent className="">
        {showBulkEditor ? (
          <BulkEditForm
            surveyId={surveyId}
            questions={questions}
            onSubmitted={setShowBulkEditor.off}
            onCancel={setShowBulkEditor.off}
          />
        ) : (
          questionList
        )}
        <EmptyState
          className={cn(
            "min-h-[120px] space-y-2 rounded-lg border border-dashed py-8",
            questions.length > 0 && "hidden",
          )}
        >
          <QuestionSheetTrigger
            surveyId={surveyId}
            branchId={branchId}
            questionIndex={questions.length}
            modelMetas={modelMetas}
          >
            <EmptyStateButton className="mt-0">Add question</EmptyStateButton>
          </QuestionSheetTrigger>
        </EmptyState>
      </CardContent>
      <CardFooter className={cn("flex-row-reverse gap-2", (questions.length === 0 || showBulkEditor) && "hidden")}>
        <ButtonGroup>
          <ButtonGroupItem onClick={setShowBulkEditor.on}>
            <ArrowsDownUp />
            <span>Edit</span>
          </ButtonGroupItem>
          <QuestionSheetTrigger
            surveyId={surveyId}
            branchId={branchId}
            questionIndex={questions.length}
            modelMetas={modelMetas}
          >
            <ButtonGroupItem>
              <Plus />
              <span>Add question</span>
            </ButtonGroupItem>
          </QuestionSheetTrigger>
        </ButtonGroup>
      </CardFooter>
    </Card>
  );
}
