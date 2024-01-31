import { forwardRef } from "react";
import { cn } from "@netizen/utils-ui";

const InlineCode = forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(({ className, ...props }, ref) => (
  <code ref={ref} className={cn("rounded bg-muted px-[0.3rem] py-[0.1rem] font-mono text-sm", className)} {...props} />
));
InlineCode.displayName = "InlineCode";

export { InlineCode };
