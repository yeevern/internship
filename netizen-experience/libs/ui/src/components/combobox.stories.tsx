import { CaretDown, Check } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { cn } from "@netizen/utils-ui";
import { Button } from "./button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

const meta: Meta = {
  title: "Components/Combobox",
  tags: ["autodocs"],
};

export default meta;

// @TODO: change to nanikore-related data
const frameworks = [
  {
    value: "next.js",
    label: "Next.js",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
  },
  {
    value: "remix",
    label: "Remix",
  },
  {
    value: "astro",
    label: "Astro",
  },
];

export const Basic: StoryObj = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState("");
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="secondary"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between px-3 font-normal"
          >
            {value ? frameworks.find((framework) => framework.value === value)?.label : "Select framework..."}
            <CaretDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search framework..." />
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              {frameworks.map((framework) => (
                <CommandItem
                  key={framework.value}
                  value={framework.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    weight="bold"
                    className={cn("mr-2 h-4 w-4 text-primary", value === framework.value ? "opacity-100" : "opacity-0")}
                  />
                  {framework.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    );
  },
};
