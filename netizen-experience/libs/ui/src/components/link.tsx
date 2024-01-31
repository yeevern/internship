import { cva } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "@netizen/utils-ui";

const linkVariants = cva(
  "cursor-pointer rounded-md text-primary underline underline-offset-4 hover:text-primary-800 focus-visible:outline focus-visible:outline-offset-1 focus-visible:outline-ring active:text-primary-900",
);

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  newTab?: boolean;
}

const Link = forwardRef<HTMLAnchorElement, LinkProps>(({ children, className, newTab, ...props }, ref) => {
  return (
    <a
      ref={ref}
      className={cn(linkVariants({ className }))}
      {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...props}
    >
      {children}
    </a>
  );
});
Link.displayName = "Link";

export { Link, linkVariants };
