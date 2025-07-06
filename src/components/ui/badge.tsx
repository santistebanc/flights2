import * as React from "react";

interface BadgeProps {
  variant?:
    | "default"
    | "outline"
    | "success"
    | "error"
    | "warning"
    | "secondary";
  className?: string;
  children: React.ReactNode;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ variant = "default", className = "", children, ...props }, ref) => {
    const baseClasses =
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";

    const variantClasses = {
      default: "bg-primary text-primary-foreground",
      outline: "border border-border text-muted-foreground",
      success:
        "bg-green-500 text-white border-green-400 dark:bg-green-600 dark:border-green-500",
      error:
        "bg-red-500 text-white border-red-400 dark:bg-red-600 dark:border-red-500",
      warning:
        "bg-yellow-500 text-black border-yellow-400 dark:bg-yellow-600 dark:text-white dark:border-yellow-500",
      secondary: "bg-secondary text-secondary-foreground border-border",
    };

    return (
      <div
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Badge.displayName = "Badge";

export { Badge };
