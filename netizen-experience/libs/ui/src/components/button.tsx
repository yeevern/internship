import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "@netizen/utils-ui";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-bold leading-none ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:bg-muted disabled:text-foreground disabled:opacity-50 disabled:outline disabled:outline-1 disabled:-outline-offset-1 disabled:outline-border",
  {
    variants: {
      variant: {
        primary:
          "bg-primary-600 text-primary-foreground hover:bg-primary-700 hover:ring-4 hover:ring-primary-700/20 active:bg-primary-800 active:ring-4 active:ring-primary-800/40 active:ring-offset-0",
        secondary:
          "border border-input bg-secondary text-secondary-foreground shadow-xs hover:bg-neutral-100 active:bg-neutral-200 disabled:border-border disabled:outline-0",
        danger:
          "bg-danger text-primary-foreground hover:bg-danger-600 hover:ring-4 hover:ring-danger-600/20 active:bg-danger-700 active:ring-4 active:ring-danger-700/20 active:ring-offset-0",
        ghost: "text-[inherit] disabled:border-0 disabled:bg-transparent disabled:outline-transparent",
      },
      size: {
        sm: "h-8 px-3 py-2 [&:has(svg)]:space-x-1 [&>svg]:h-4 [&>svg]:w-4",
        md: "h-10 px-4 py-2 [&:has(svg)]:space-x-2 [&>svg]:h-4 [&>svg]:w-4",
        lg: "h-12 px-4 py-2 [&:has(svg)]:space-x-2 [&>svg]:h-5 [&>svg]:w-5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, className, size, type = "button", variant, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} type={type} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
