import type { Icon, IconProps } from "@phosphor-icons/react";
import { CheckCircle, Info, Warning, WarningDiamond, X } from "@phosphor-icons/react/dist/ssr";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "@netizen/utils-ui";
import { Button, ButtonProps } from "./button";
import { IconButton } from "./icon-button";

const alertVariants = cva(
  "relative flex w-full flex-row items-center justify-between rounded-lg px-14 py-4 [&:has([data-alert-description])]:flex-col [&:has([data-alert-description])]:items-start [&:has([data-alert-description])]:justify-normal",
  {
    variants: {
      variant: {
        info: "bg-info-background text-info-foreground [&>button]:ring-offset-info-background",
        success: "bg-success-background text-success-foreground [&>button]:ring-offset-success-background",
        warning: "bg-warning-background text-warning-foreground [&>button]:ring-offset-warning-background",
        danger: "bg-danger-background text-danger-foreground [&>button]:ring-offset-danger-background",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  },
);

function PresetIcon({ variant, ...props }: IconProps & VariantProps<typeof alertVariants>) {
  if (variant === "success") return <CheckCircle {...props} />;
  else if (variant === "warning") return <WarningDiamond {...props} />;
  else if (variant === "danger") return <Warning {...props} />;
  return <Info {...props} />;
}

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  icon?: Icon;
  onDismiss?: React.MouseEventHandler<HTMLButtonElement>;
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ children, className, icon: CustomIcon, onDismiss, variant = "info", ...props }, ref) => {
    const AlertIcon = CustomIcon ? CustomIcon : PresetIcon;
    return (
      <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
        <AlertIcon variant={variant} size={24} className="absolute left-4 top-4" />
        {children}
        <IconButton variant="ghost" className="absolute right-2 top-2" onClick={onDismiss}>
          <X size={24} />
        </IconButton>
      </div>
    );
  },
);
Alert.displayName = "Alert";

const AlertTitle = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ children, className, ...props }, ref) => (
    <h5 ref={ref} className={cn("font-bold [&+[data-alert-description]]:mt-2", className)} data-alert-title {...props}>
      {children}
    </h5>
  ),
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("[&+[data-alert-action]]:mt-4", className)} data-alert-description {...props} />
  ),
);
AlertDescription.displayName = "AlertDescription";

const AlertAction = forwardRef<HTMLButtonElement, ButtonProps>(({ className, ...props }, ref) => (
  <Button
    ref={ref}
    variant="ghost"
    className={cn("h-auto text-base [&&]:px-0 [&&]:py-0", className)}
    data-alert-action
    {...props}
  />
));
AlertAction.displayName = "AlertAction";

export { Alert, AlertTitle, AlertDescription, AlertAction };
