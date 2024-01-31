"use client";

import { Check, Minus } from "@phosphor-icons/react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as React from "react";
import { cn } from "@netizen/utils-ui";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-6 w-6 shrink-0 rounded-lg border border-input bg-background ring-offset-background hover:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-muted disabled:hover:border-input data-[state=checked]:border-primary data-[state=indeterminate]:border-primary data-[state=checked]:bg-primary data-[state=indeterminate]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:text-primary-foreground data-[state=checked]:hover:outline data-[state=indeterminate]:hover:outline data-[state=checked]:hover:outline-2 data-[state=indeterminate]:hover:outline-2 data-[state=checked]:hover:outline-primary-200 data-[state=indeterminate]:hover:outline-primary-200 disabled:data-[state=checked]:border-input disabled:data-[state=indeterminate]:border-input disabled:data-[state=checked]:bg-muted disabled:data-[state=indeterminate]:bg-muted disabled:data-[state=checked]:text-muted-foreground disabled:data-[state=indeterminate]:text-muted-foreground",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
      {props.checked === "indeterminate" && <Minus size={16} />}
      {props.checked === true && <Check size={16} />}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
