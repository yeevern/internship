import type { Icon } from "@phosphor-icons/react";
import { Slot } from "@radix-ui/react-slot";
import { VariantProps, cva } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "@netizen/utils-ui";
import { Button, ButtonProps } from "./button";

const emptyStateVariants = cva("flex flex-col justify-center text-center", {
  variants: {
    variant: {
      default: "",
      dashed: "rounded-lg border-2 border-dashed border-border p-8",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const EmptyState = forwardRef<
  HTMLDivElement,
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> &
    VariantProps<typeof emptyStateVariants> & {
      as?: React.ElementType;
    }
>(({ as, className, variant, ...props }, ref) => {
  const Comp = as ?? "div";
  return <Comp ref={ref} className={cn(emptyStateVariants({ variant, className }))} {...props} />;
});
EmptyState.displayName = "EmptyState";

const EmptyStateIcon = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement> & { children: React.ReactElement<Icon> }) => {
  return (
    <div className="flex justify-center [&+[data-empty-state-title]]:mt-2">
      <Slot className={cn("h-16 w-16 text-neutral-300", className)} {...props}>
        {children}
      </Slot>
    </div>
  );
};
EmptyStateIcon.displayName = "EmptyStateIcon";

const EmptyStateTitle = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ children, className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-sm font-semibold [&+[data-empty-state-description]]:mt-1", className)}
      data-empty-state-title
      {...props}
    >
      {children}
    </h3>
  ),
);
EmptyStateTitle.displayName = "EmptyStateTitle";

const EmptyStateDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm", className)} data-empty-state-description {...props} />
  ),
);
EmptyStateDescription.displayName = "EmptyStateDescription";

const EmptyStateButton = forwardRef<HTMLButtonElement, ButtonProps>(({ className, ...props }, ref) => (
  <Button ref={ref} className={cn("mt-8 w-max self-center", className)} data-empty-state-button {...props} />
));
EmptyStateButton.displayName = "EmptyStateButton";

export { EmptyState, EmptyStateIcon, EmptyStateTitle, EmptyStateDescription, EmptyStateButton, emptyStateVariants };
