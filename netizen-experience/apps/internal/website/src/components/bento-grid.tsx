import { cn } from "@netizen/utils-ui";

/**
 * BentoGrid component represents a grid layout.
 * @param {React.ReactNode} children - Children to be rendered inside the grid.
 * @param {string} className - Class name for configuring the grid.
 * @returns {React.ReactNode} - Rendered BentoGrid component.
 */
const BentoGrid = ({ children, className }: { className?: string; children?: React.ReactNode }) => {
  return (
    <div className={cn("max-w-7x1 mx-auto grid grid-cols-1 gap-4 md:auto-rows-[18rem] md:grid-cols-3", className)}>
      {children}
    </div>
  );
};

export { BentoGrid };
