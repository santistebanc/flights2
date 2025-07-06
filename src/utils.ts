import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toPlainDateString(date: Date | undefined): string {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTodayAsString(): string {
  const today = new Date();
  return toPlainDateString(today);
}

/**
 * Format currency using the native Intl.NumberFormat API
 * @param amount - The amount to format
 * @param currency - The currency code (e.g., 'EUR', 'USD')
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @param options - Additional formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = "EUR",
  locale: string = "en-US",
  options: Intl.NumberFormatOptions = {}
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      ...options,
    }).format(amount);
  } catch (error) {
    // Fallback to simple formatting if Intl.NumberFormat fails
    console.warn("Currency formatting failed, using fallback:", error);
    return `${amount.toFixed(0)}${currency === "EUR" ? "€" : currency}`;
  }
}

/**
 * Normalize text for search by removing accents and converting to lowercase
 * This helps with accent-insensitive search (e.g., "Málaga" matches "malaga")
 */
export function normalizeTextForSearch(text: string): string {
  return text
    .normalize("NFD") // Decompose characters into base + combining characters
    .replace(/[\u0300-\u036f]/g, "") // Remove combining characters (accents)
    .toLowerCase();
}

/**
 * Check if a search term matches text in an accent-insensitive way
 */
export function matchesSearchTerm(text: string, searchTerm: string): boolean {
  return normalizeTextForSearch(text).includes(
    normalizeTextForSearch(searchTerm)
  );
}

// Example usage (for testing purposes - can be removed in production):
// console.log(formatCurrency(806, 'EUR')); // Should output "€806" (en-US locale)
// console.log(formatCurrency(1234, 'EUR', 'de-DE')); // Should output "1.234 €" (German locale)
// console.log(formatCurrency(500, 'USD')); // Should output "$500" (US Dollar)
