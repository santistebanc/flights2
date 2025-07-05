import React from "react";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "../../utils";

interface SearchButtonProps {
  /** Whether the search is currently in progress */
  isLoading?: boolean;
  /** Whether the button should be disabled */
  disabled?: boolean;
  /** Custom loading text to display */
  loadingText?: string;
  /** Custom button text when not loading */
  children: React.ReactNode;
  /** Button size variant */
  size?: "sm" | "default" | "lg";
  /** Additional CSS classes */
  className?: string;
}

export function SearchButton({
  isLoading = false,
  disabled = false,
  loadingText = "Loading...",
  children,
  size = "default",
  className,
}: SearchButtonProps) {
  return (
    <Button
      type="submit"
      disabled={disabled || isLoading}
      size={size}
      className={cn(isLoading && "cursor-not-allowed", className)}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {isLoading ? loadingText : children}
    </Button>
  );
}
