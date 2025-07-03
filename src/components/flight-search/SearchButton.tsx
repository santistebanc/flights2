import React from "react";
import { Button } from "../ui/button";
import { Search, Loader2 } from "lucide-react";
import { cn } from "../../utils";

interface SearchButtonProps {
  /** Whether the search is currently in progress */
  isLoading?: boolean;
  /** Whether the button should be disabled */
  disabled?: boolean;
  /** Custom loading text to display */
  loadingText?: string;
  /** Custom button text when not loading */
  children?: React.ReactNode;
  /** Button type (submit, button, reset) */
  type?: "submit" | "button" | "reset";
  /** Click handler for the button */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Button size variant */
  size?: "sm" | "lg" | "default" | "icon";
  /** Button variant */
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
}

export function SearchButton({
  isLoading = false,
  disabled = false,
  loadingText = "Searching...",
  children = "Search Flights",
  type = "submit",
  onClick,
  className,
  size = "lg",
  variant = "default",
}: SearchButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <Button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      size={size}
      variant={variant}
      className={cn(
        // Base styles
        "flex items-center gap-2 font-semibold transition-all duration-200",
        // Size-specific styles
        size === "lg" && "px-8 py-3 text-lg",
        size === "default" && "px-6 py-2 text-base",
        size === "sm" && "px-4 py-1.5 text-sm",
        // Default variant styles (yellow theme)
        variant === "default" && [
          "bg-yellow-400 text-black",
          "hover:bg-yellow-500",
          "focus:bg-yellow-500",
          "disabled:bg-gray-600 disabled:text-gray-400",
          "focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-800",
        ],
        // Loading state styles
        isLoading && "cursor-not-allowed",
        // Custom className
        className
      )}
      aria-label={isLoading ? loadingText : "Search for flights"}
      aria-busy={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          <span>{loadingText}</span>
        </>
      ) : (
        <>
          <Search className="h-5 w-5" aria-hidden="true" />
          <span>{children}</span>
        </>
      )}
    </Button>
  );
}
