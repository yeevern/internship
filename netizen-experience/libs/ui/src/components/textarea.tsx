import { forwardRef } from "react";
import { cn } from "@netizen/utils-ui";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border border-input bg-background px-4 py-3 text-sm [scroll-padding-block:8px] placeholder:text-muted-foreground hover:border-primary focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary-700/20 disabled:cursor-default disabled:border-input disabled:bg-muted disabled:hover:border-input",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
