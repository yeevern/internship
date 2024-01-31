import { forwardRef } from "react";
import { cn } from "@netizen/utils-ui";

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(({ as, className, ...props }, ref) => {
  const Comp = as ?? "h2";
  return <Comp ref={ref} className={cn("scroll-m-20 text-2xl", className)} {...props} />;
});
Heading.displayName = "Heading";

export { Heading };
