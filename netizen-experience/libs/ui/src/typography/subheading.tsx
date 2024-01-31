import { VariantProps, cva } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "@netizen/utils-ui";

const subheadingVariants = cva("scroll-m-20", {
  variants: {
    size: {
      md: "text-lg",
      lg: "text-xl",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface SubheadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof subheadingVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

const Subheading = forwardRef<HTMLHeadingElement, SubheadingProps>(({ as, className, size, ...props }, ref) => {
  const Comp = as ?? "h3";
  return <Comp ref={ref} className={cn(subheadingVariants({ size, className }))} {...props} />;
});
Subheading.displayName = "Subheading";

export { Subheading, subheadingVariants };
