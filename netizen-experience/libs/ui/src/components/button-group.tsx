"use client";

import type { VariantProps } from "class-variance-authority";
import { createContext, forwardRef, useContext } from "react";
import { cn } from "@netizen/utils-ui";
import { Button, buttonVariants } from "./button";
import { IconButton } from "./icon-button";

const ButtonGroupContext = createContext<VariantProps<typeof buttonVariants>>({
  variant: "secondary",
  size: "md",
});

const ButtonGroup = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof buttonVariants>
>(({ children, className, size, variant = "secondary", ...props }, ref) => (
  <div ref={ref} className={cn("isolate inline-flex -space-x-px rounded-lg shadow-xs", className)} {...props}>
    <ButtonGroupContext.Provider value={{ variant, size }}>{children}</ButtonGroupContext.Provider>
  </div>
));

const ButtonGroupItem = forwardRef<
  React.ElementRef<typeof Button>,
  Omit<React.ComponentPropsWithoutRef<typeof Button>, "size">
>(({ children, className, variant, ...props }, ref) => {
  const context = useContext(ButtonGroupContext);
  return (
    <Button
      ref={ref}
      className={cn("rounded-none shadow-none first:rounded-l-lg last:rounded-r-lg", className)}
      variant={variant ?? context.variant}
      size={context.size}
      {...props}
    >
      {children}
    </Button>
  );
});

const ButtonGroupIconItem = forwardRef<
  React.ElementRef<typeof IconButton>,
  Omit<React.ComponentPropsWithoutRef<typeof IconButton>, "size">
>(({ children, className, variant, ...props }, ref) => {
  const context = useContext(ButtonGroupContext);
  return (
    <IconButton
      ref={ref}
      className={cn("rounded-none shadow-none first:rounded-l-lg last:rounded-r-lg", className)}
      variant={variant ?? context.variant}
      size={context.size}
      {...props}
    >
      {children}
    </IconButton>
  );
});

export { ButtonGroup, ButtonGroupItem, ButtonGroupIconItem };
