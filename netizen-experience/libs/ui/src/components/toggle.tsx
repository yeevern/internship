"use client";

import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "@netizen/utils-ui";

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-muted data-[state=on]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border border-input bg-transparent hover:bg-muted hover:text-muted-foreground",
      },
      size: {
        sm: "h-8 px-3 [&>svg]:h-5 [&>svg]:w-5",
        md: "h-10 px-3 [&>svg]:h-5 [&>svg]:w-5",
        lg: "h-12 px-4 [&>svg]:h-6 [&>svg]:w-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

const Toggle = forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>
>(({ className, size, variant, ...props }, ref) => (
  <TogglePrimitive.Root ref={ref} className={cn(toggleVariants({ variant, size, className }))} {...props} />
));
Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle, toggleVariants };
