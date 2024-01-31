"use client";

import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "@netizen/utils-ui";

const switchVariants = cva(
  "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-transparent ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-muted data-[state=checked]:bg-primary data-[state=unchecked]:bg-neutral-100 data-[state=checked]:hover:bg-primary-800 data-[state=unchecked]:hover:bg-neutral-200 data-[state=checked]:disabled:bg-primary-100",
  {
    variants: {
      size: {
        sm: "h-4 w-[30px] border-2",
        md: "h-6 w-10 border-4",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

const thumbVariants = cva(
  "pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=unchecked]:translate-x-0",
  {
    variants: {
      size: {
        sm: "h-3 w-3 data-[state=checked]:translate-x-[14px]",
        md: "h-4 w-4 data-[state=checked]:translate-x-4",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>,
    VariantProps<typeof switchVariants> {}

const Switch = forwardRef<React.ElementRef<typeof SwitchPrimitives.Root>, SwitchProps>(
  ({ className, size, ...props }, ref) => (
    <SwitchPrimitives.Root className={cn(switchVariants({ size, className }))} {...props} ref={ref}>
      <SwitchPrimitives.Thumb className={thumbVariants({ size })} />
    </SwitchPrimitives.Root>
  ),
);
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
