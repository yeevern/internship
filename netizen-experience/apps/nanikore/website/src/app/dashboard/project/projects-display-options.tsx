"use client";

import { Funnel, FunnelSimple, ListBullets, SquaresFour } from "@phosphor-icons/react/dist/ssr";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  ToggleGroup,
  ToggleGroupItem,
} from "@netizen/ui";
import { Button, Input } from "@netizen/ui/server";
import { projectStageLabels, projectTypeLabels } from "@nanikore/libs-project";
import ProjectFilterDropdown from "./project-filter-dropdown";

type SortLabels = "A-Z" | "Z-A" | "Date" | "New updates";
export type SortParams = "name" | "date" | "updates";
export type OrderParams = "asc" | "desc";
export type ViewParams = "list" | "grid";

export default function ProjectsDisplayOptions() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState<string>(searchParams.get("query") ?? "");
  const [showFilters, setShowFilters] = useState(false);
  const [resetFilters, setResetFilters] = useState(false);

  // @TODO: add filter items for company
  const sortLabels: SortLabels[] = ["A-Z", "Z-A", "Date", "New updates"];

  function handleProjectSearch(value: string) {
    setSearchValue(value.trim().length === 0 ? "" : value);
    const params = new URLSearchParams(searchParams);
    value.trim().length === 0 ? params.delete("query") : params.set("query", value.toLowerCase());
    router.replace(`${pathname}?${params.toString()}`);
  }

  function updateUrlSortParams(label: SortLabels) {
    let sortBy: SortParams | "" = "";
    let order: OrderParams | "" = "";
    switch (label) {
      case "A-Z":
        sortBy = "name";
        order = "asc";
        break;
      case "Z-A":
        sortBy = "name";
        order = "desc";
        break;
      case "Date":
        sortBy = "date";
        break;
      case "New updates":
        sortBy = "updates";
        break;
    }
    const params = new URLSearchParams(searchParams);
    params.set("sort", sortBy);
    order === "" ? params.delete("order") : params.set("order", order);
    router.push(`${pathname}?${params.toString()}`);
  }

  function resetAllFilters() {
    setResetFilters(true);
    const params = new URLSearchParams(searchParams);
    ["type", "company", "stage"].forEach((param) => params.delete(param));
    router.push(`${pathname}?${params.toString()}`);
  }

  function changeView(value: ViewParams) {
    const params = new URLSearchParams(searchParams);
    params.set("view", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="my-6 flex flex-col justify-between gap-2">
      <div className="flex items-center justify-between">
        <div className="flex place-content-center place-items-center gap-4">
          <Input
            placeholder="Search projects"
            value={searchValue}
            onChange={(e) => handleProjectSearch(e.target.value)}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary">
                <FunnelSimple />
                <span>Sort</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {sortLabels.map((label) => (
                <DropdownMenuItem key={label} onSelect={() => updateUrlSortParams(label)}>
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant={showFilters ? "primary" : "secondary"} onClick={() => setShowFilters((prev) => !prev)}>
            <Funnel />
            <span>Filter</span>
          </Button>
        </div>
        <ToggleGroup type="single" variant="outline" defaultValue="list" onValueChange={changeView}>
          <ToggleGroupItem value="grid" aria-label="Grid view">
            <SquaresFour />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view">
            <ListBullets />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      {showFilters && (
        <div className="flex items-center justify-start gap-4">
          <ProjectFilterDropdown
            hasSearch={true}
            hasSelectAll={true}
            labels={projectTypeLabels}
            name="Type"
            resetFilter={[resetFilters, setResetFilters]}
          />
          <ProjectFilterDropdown
            hasSearch={true}
            labels={{}}
            name="Company"
            resetFilter={[resetFilters, setResetFilters]}
          />
          <ProjectFilterDropdown
            labels={projectStageLabels}
            name="Stage"
            resetFilter={[resetFilters, setResetFilters]}
          />
          <Button variant="secondary" className="capitalize" onClick={() => resetAllFilters()}>
            Reset
          </Button>
        </div>
      )}
    </div>
  );
}
