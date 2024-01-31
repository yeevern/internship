import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "@netizen/utils-ui";

const chipVariants = cva("inline-flex items-center rounded-full border border-primary px-2 transition-colors", {
  variants: {
    variant: {
      outline: "bg-background text-primary hover:bg-primary-50",
      selected: "border-transparent bg-primary text-primary-foreground",
      disabled: "pointer-events-none select-none border-transparent bg-muted text-muted-foreground focus:outline-0",
    },
    size: {
      sm: "h-6",
      md: "h-8",
    },
  },
  defaultVariants: {
    variant: "outline",
    size: "md",
  },
});

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof chipVariants> {
  selected?: boolean;
  disabled?: boolean;
}

const Chip = forwardRef<HTMLSpanElement, ChipProps>(
  ({ className, disabled, selected, size, variant, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        chipVariants({ variant: disabled ? "disabled" : selected ? "selected" : variant, size }),
        className,
      )}
      {...props}
    />
  ),
);
Chip.displayName = "Chip";

export { Chip, chipVariants };
