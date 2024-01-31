"use client";

import { ArrowDown, ArrowUp, Plus, Trash } from "@phosphor-icons/react/dist/ssr";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Checkbox, FormControl, FormField, FormItem, FormLabel } from "@netizen/ui";
import { Button, IconButton, Input } from "@netizen/ui/server";
import { EditModelFormValues } from "./index";

export function SelectionForm() {
  const form = useFormContext<EditModelFormValues>();
  const { append, fields, remove, swap } = useFieldArray({ name: "selections", control: form.control });

  return (
    <div className="space-y-1">
      <FormLabel>Options</FormLabel>
      <div className="space-y-2">
        {fields.length > 0 &&
          fields.map((selectionField, index, array) => (
            <div key={selectionField.id} className="flex items-center">
              <FormField
                control={form.control}
                name={`selections.${index}.option` as const}
                render={({ field }) => (
                  <FormItem className="mr-2 flex-1">
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <IconButton
                variant="ghost"
                size="sm"
                disabled={index === 0}
                onClick={() => swap(index, index - 1)}
                tabIndex={-1}
              >
                <ArrowUp />
              </IconButton>
              <IconButton
                variant="ghost"
                size="sm"
                disabled={index === array.length - 1}
                onClick={() => swap(index, index + 1)}
                tabIndex={-1}
              >
                <ArrowDown />
              </IconButton>
              <IconButton variant="ghost" size="sm" onClick={() => remove(index)} tabIndex={-1}>
                <Trash />
              </IconButton>
            </div>
          ))}
        <Button
          variant="secondary"
          type="button"
          className="w-[calc(100%_-_104px)] border-dashed text-muted-foreground [&>svg]:h-4 [&>svg]:w-4"
          onClick={() => append({ option: "" })}
        >
          <Plus size={16} />
          <span>Add option</span>
        </Button>
        <FormField
          control={form.control}
          name="allowOthers"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-4 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="leading-none">Allow "Others" option</FormLabel>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

// @TODO: draggable list, sort options button
