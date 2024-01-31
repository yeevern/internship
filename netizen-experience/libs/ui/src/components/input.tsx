import { forwardRef } from "react";
import { cn } from "@netizen/utils-ui";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-lg border border-input bg-background px-4 text-sm placeholder:text-muted-foreground read-only:cursor-default hover:border-primary focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary-700/20 disabled:cursor-default disabled:border-input disabled:bg-muted disabled:text-muted-foreground disabled:hover:border-input",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
