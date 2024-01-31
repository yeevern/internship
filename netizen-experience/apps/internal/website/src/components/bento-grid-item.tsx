import { cn } from "@netizen/utils-ui";

export interface BentoGridProps {
  className?: string;
  description?: string | React.ReactNode;
  disable?: boolean;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  title?: string | React.ReactNode;
  onClick?: () => void;
}

/**
 * BentoGridItem component represents a grid item.
 * @param {string} className - Class name for configuring the grid item.
 * @param {string} description - Description for the grid item.
 * @param {boolean} disable - Disable the grid item.
 * @param {React.ReactNode} header - Header for the grid item.
 * @param {React.ReactNode} icon - Icon for the grid item.
 * @param {string} title - Title for the grid item.
 * @param {() => void} onClick - Function to be called when the grid item is clicked.
 * @returns {React.ReactNode} - Rendered BentoGridItem component.
 */
const BentoGridItem = ({ className, description, disable, header, icon, onClick, title }: BentoGridProps) => {
  const props = {
    className: cn(
      "group/bento row-span-1 flex flex-col justify-between space-y-4 rounded-xl border bg-white p-4 shadow-input transition duration-200 hover:shadow-xl dark:border-white/[0.2] dark:bg-black dark:shadow-none",
      className,
    ),
  };

  return (
    <div className={props.className} onClick={disable ? undefined : onClick}>
      {header}
      <div className="transition duration-200 group-hover/bento:translate-x-2">
        {icon}
        <div className="mb-2 mt-2 font-sans font-bold text-neutral-600 dark:text-neutral-200">{title}</div>
        <div className="font-sans text-xs font-normal text-neutral-600 dark:text-neutral-300">{description}</div>
      </div>
    </div>
  );
};

export { BentoGridItem };
