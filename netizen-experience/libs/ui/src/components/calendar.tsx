import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { DayPicker } from "react-day-picker";
import { cn } from "@netizen/utils-ui";
import { iconButtonVariants } from "./icon-button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={className}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "font-bold",
        nav: "space-x-1 flex items-center",
        nav_button: cn(iconButtonVariants({ variant: "ghost", size: "sm" })),
        nav_button_previous: "absolute left-0",
        nav_button_next: "absolute right-0",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "w-8 font-normal text-sm",
        row: "flex w-full mt-2",
        cell: "text-center p-0 relative [&:has([aria-selected])]:bg-primary-50 first:[&:has([aria-selected])]:rounded-l-lg last:[&:has([aria-selected])]:rounded-r-lg focus-within:relative focus-within:z-20",
        day: cn(iconButtonVariants({ variant: "ghost", size: "sm" }), "cursor-pointer font-normal hover:bg-primary-50"),
        day_selected: "bg-primary hover:bg-primary-800 active:bg-primary-900 [&]:text-primary-foreground",
        day_today: "[&]:text-primary [&]:font-bold",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50 hover:bg-transparent",
        day_range_middle: "aria-selected:bg-primary-50 aria-selected:text-primary",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => <CaretLeft size={24} />,
        IconRight: () => <CaretRight size={24} />,
      }}
      formatters={{ formatWeekdayName: (date) => ["S", "M", "T", "W", "T", "F", "S"][date.getDay()] }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };

// @TODO: better props with generics based on `mode`
// @TODO: add 4px gap between each cells (currently using 14px font size as workaround to avoid looking to cramped)
// @TODO: add left/right rounded corners to range start/end
