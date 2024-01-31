import { Dog, Funnel, Plus, Question } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIcon,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu";

const meta: Meta<typeof DropdownMenu> = {
  title: "Components/Dropdown Menu 🚧",
  component: DropdownMenu,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DropdownMenu>;

export const Basic: Story = {
  render: (props) => (
    <DropdownMenu {...props}>
      <DropdownMenuTrigger asChild>
        <Button>
          <Plus />
          <span>Create</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[240px]">
        <DropdownMenuLabel>New Project</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <span>Survey</span>
          <DropdownMenuShortcut>⌘1</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <span>Recruitment</span>
          <DropdownMenuShortcut>⌘2</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <span>User Interview</span>
          <DropdownMenuShortcut>⌘3</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <span>Focus Group</span>
          <DropdownMenuShortcut>⌘4</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <span>Moderated Testing</span>
          <DropdownMenuShortcut>⌘5</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <span>Unmoderated Testing</span>
          <DropdownMenuShortcut>⌘6</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const Checkboxes: Story = {
  render: (props) => {
    type Status = "Recruitment" | "Preparation" | "Fieldwork" | "Reporting" | "Completed";
    const statuses: Status[] = ["Recruitment", "Preparation", "Fieldwork", "Reporting", "Completed"];
    const [filters, setFilters] = useState<Status[]>([]);
    const [open, setOpen] = useState(false);
    const handleStatusChange = (status: Status) => (checked: boolean) => {
      if (checked) setFilters((prev) => [...prev, status]);
      else setFilters((prev) => prev.filter((s) => s !== status));
    };
    const handleSelectAll = () => {
      setFilters(statuses);
      setOpen(false);
    };
    const handleClearAll = () => {
      setFilters([]);
      setOpen(false);
    };
    return (
      <DropdownMenu open={open} onOpenChange={setOpen} {...props}>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary">
            <Funnel weight={filters.length ? "duotone" : "regular"} />
            <span>Filter</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-[240px]">
          <DropdownMenuLabel className="flex items-baseline justify-between">
            <span>Stage</span>
            <span className="space-x-2 text-xs text-muted-foreground">
              <span className="cursor-pointer hover:underline" onClick={handleSelectAll}>
                Select all
              </span>
              <span className="cursor-pointer hover:underline" onClick={handleClearAll}>
                Clear
              </span>
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {statuses.map((status) => (
            <DropdownMenuCheckboxItem
              key={status}
              checked={filters.includes(status)}
              onCheckedChange={handleStatusChange(status)}
            >
              {status}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};

export const RadioGroup: Story = {
  render: (props) => {
    const [position, setPosition] = useState("bottom");
    return (
      <DropdownMenu {...props}>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary">Open</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-[240px]">
          <DropdownMenuLabel>Panel Position</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
            <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="right">Right</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};

export const WithSubMenu: Story = {
  render: (props) => (
    <DropdownMenu {...props}>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary">Who's a good boy?</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-[240px]">
        <DropdownMenuItem>
          <DropdownMenuItemIcon>
            <Dog />
          </DropdownMenuItemIcon>
          <span>Dog</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <DropdownMenuItemIcon>
            <Dog />
          </DropdownMenuItemIcon>
          <span>Dog</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <DropdownMenuItemIcon>
            <Dog />
          </DropdownMenuItemIcon>
          <span>Dog</span>
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <DropdownMenuItemIcon>
              <Question />
            </DropdownMenuItemIcon>
            <span>Woof...</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem>
                <DropdownMenuItemIcon>
                  <Dog />
                </DropdownMenuItemIcon>
                <span>Dog</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <DropdownMenuItemIcon>
                  <Dog />
                </DropdownMenuItemIcon>
                <span>Dog</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <DropdownMenuItemIcon>
                  <Dog />
                </DropdownMenuItemIcon>
                <span>Dog</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuItem>
          <DropdownMenuItemIcon>
            <Dog />
          </DropdownMenuItemIcon>
          <span>Dog</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
