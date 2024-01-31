"use client";

import { CaretDown, Check } from "@phosphor-icons/react/dist/ssr";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@netizen/ui";
import { Button } from "@netizen/ui/server";
import { cn } from "@netizen/utils-ui";

interface ProjectFilterDropdownProps<Value extends PropertyKey, Label extends string> {
  name: string;
  labels: Record<Value, Label>;
  resetFilter: [boolean, Dispatch<SetStateAction<boolean>>];
  hasSelectAll?: boolean;
  hasSearch?: boolean;
}

export default function ProjectFilterDropdown<Value extends PropertyKey, Label extends string>({
  hasSearch = false,
  hasSelectAll = false,
  labels,
  name,
  resetFilter: [reset, setReset],
}: ProjectFilterDropdownProps<Value, Label>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filterItems, setFilterItems] = useState<Value[]>(getExistingUrlFilterParams());
  const [open, setOpen] = useState(false);

  function getExistingUrlFilterParams() {
    const filterParamsString = searchParams.get(name.toLowerCase());
    if (filterParamsString === null) return [];
    return filterParamsString.split(",").filter((param) => Object.keys(labels).includes(param)) as Value[];
  }

  const updateUrlFilterParams = (selectedFilterItems: Value[]) => {
    const params = new URLSearchParams(searchParams);
    selectedFilterItems.length === 0
      ? params.delete(name.toLowerCase())
      : params.set(name.toLowerCase(), selectedFilterItems.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleFilterItemChange = (selectedItem: Value, checked: boolean) => {
    const newFilterItems = checked
      ? [...filterItems, selectedItem]
      : filterItems.filter((item) => item !== selectedItem);
    setFilterItems(newFilterItems);
    setOpen(false);
    updateUrlFilterParams(newFilterItems);
  };

  const handleSelectAllFilterItems = (checked: boolean) => {
    const newFilterItems = checked ? ([...Object.keys(labels)] as Value[]) : [];
    setFilterItems(newFilterItems);
    setOpen(false);
    updateUrlFilterParams(newFilterItems);
  };

  useEffect(() => {
    if (reset) {
      setFilterItems([]);
      setOpen(false);
      setReset(false);
    }
  }, [reset, setReset]);

  return hasSearch ? (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="secondary" role="checkbox" aria-expanded={open}>
          <span className="capitalize">
            {name} ({filterItems.length})
          </span>
          <CaretDown />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandEmpty>{`No ${name.toLowerCase()} found.`}</CommandEmpty>
          <CommandGroup>
            {hasSelectAll && (
              <CommandItem
                onSelect={() =>
                  handleSelectAllFilterItems(
                    Object.keys(labels).length !== 0 && filterItems.length < Object.keys(labels).length,
                  )
                }
              >
                <Check
                  size={16}
                  weight="bold"
                  className={cn(
                    "mr-2 h-4 w-4 text-primary",
                    Object.keys(labels).length !== 0 && filterItems.length === Object.keys(labels).length
                      ? "opacity-100"
                      : "opacity-0",
                  )}
                />
                All
              </CommandItem>
            )}
            {Object.keys(labels).map((value) => (
              <CommandItem
                key={value}
                onSelect={() => handleFilterItemChange(value as Value, !filterItems.includes(value as Value))}
              >
                <Check
                  size={16}
                  weight="bold"
                  className={cn(
                    "mr-2 h-4 w-4 text-primary",
                    filterItems.includes(value as Value) ? "opacity-100" : "opacity-0",
                  )}
                />
                {labels[value as Value]}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  ) : (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary">
          <span className="capitalize">
            {name} ({filterItems.length})
          </span>
          <CaretDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {hasSelectAll && (
          <DropdownMenuCheckboxItem
            checked={Object.keys(labels).length !== 0 && filterItems.length === Object.keys(labels).length}
            onCheckedChange={handleSelectAllFilterItems}
          >
            All
          </DropdownMenuCheckboxItem>
        )}
        {Object.keys(labels).map((value) => (
          <DropdownMenuCheckboxItem
            key={value}
            checked={filterItems.includes(value as Value)}
            onCheckedChange={(checked) => handleFilterItemChange(value as Value, checked)}
          >
            {labels[value as Value]}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
