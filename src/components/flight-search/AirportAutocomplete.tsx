import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { cn } from "@/utils";
import { Check } from "lucide-react";
import { useAirportHistory } from "@/hooks/useAirportHistory";
import { Input } from "@/components/ui/input";

interface Airport {
  _id: string;
  iataCode: string;
  name: string;
  city: string;
  country?: string;
  matchType: "iata" | "name" | "city" | "country";
}

interface AirportAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAirportSelect?: (airport: Airport) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  otherAirportValue?: string; // For checking duplicate airports
}

export function AirportAutocomplete({
  value,
  onChange,
  onAirportSelect,
  placeholder = "Search airports...",
  label,
  className,
  required = false,
  error,
  disabled = false,
  otherAirportValue,
}: AirportAutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [highlightedIndex, setHighlightedIndex] = React.useState<number>(-1);

  // Airport history hook
  const { history, addToHistory } = useAirportHistory();

  // Fetch airports from Convex
  const airports = useQuery(
    api.airports.searchAirports,
    searchValue.length > 0 ? { searchTerm: searchValue, limit: 8 } : "skip"
  );

  // Check if current value is a valid IATA code
  const isValidIataCode = (code: string): boolean => {
    return /^[A-Z]{3}$/.test(code);
  };

  // Check if the current value exists as an airport
  const currentAirport = useQuery(
    api.airports.getAirportByIata,
    value.length === 3 && isValidIataCode(value) ? { iataCode: value } : "skip"
  );

  // Check if airports are the same (duplicate)
  const isDuplicateAirport =
    otherAirportValue && value.length > 0 && value === otherAirportValue;

  // Determine if the input is valid
  const isInputValid =
    value.length === 0 ||
    (isValidIataCode(value) && currentAirport !== null && !isDuplicateAirport);

  // Get combined results (history + search results)
  const getCombinedResults = React.useCallback(() => {
    const results: Array<Airport & { isHistory?: boolean }> = [];

    // Add history items if search term is empty or matches
    if (searchValue.length === 0) {
      // Show history items when input is empty or focused
      history.forEach((historyItem) => {
        results.push({
          _id: `history-${historyItem.iataCode}`,
          iataCode: historyItem.iataCode,
          name: historyItem.name,
          city: historyItem.city,
          country: historyItem.country,
          matchType: "iata" as const,
          isHistory: true,
        });
      });
    } else {
      // Filter history items that match search term
      const matchingHistory = history.filter(
        (historyItem) =>
          historyItem.iataCode
            .toLowerCase()
            .includes(searchValue.toLowerCase()) ||
          historyItem.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          historyItem.city.toLowerCase().includes(searchValue.toLowerCase())
      );

      matchingHistory.forEach((historyItem) => {
        results.push({
          _id: `history-${historyItem.iataCode}`,
          iataCode: historyItem.iataCode,
          name: historyItem.name,
          city: historyItem.city,
          country: historyItem.country,
          matchType: "iata" as const,
          isHistory: true,
        });
      });
    }

    // Add search results (excluding duplicates from history)
    if (airports) {
      airports.forEach((airport) => {
        const isDuplicate = results.some(
          (result) => result.iataCode === airport.iataCode
        );
        if (!isDuplicate) {
          results.push(airport);
        }
      });
    }

    return results;
  }, [searchValue, history, airports]);

  // Handle airport selection
  const handleAirportSelect = React.useCallback(
    (airport: Airport) => {
      onChange(airport.iataCode);
      onAirportSelect?.(airport);
      setOpen(false);

      // Add to history
      addToHistory({
        iataCode: airport.iataCode,
        name: airport.name,
        city: airport.city,
        country: airport.country,
      });
    },
    [onChange, onAirportSelect, addToHistory]
  );

  // Get display value
  const getDisplayValue = () => {
    if (value.length === 0) return "";

    if (currentAirport) {
      return `${currentAirport.iataCode} - ${currentAirport.name}`;
    }

    return value;
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    onChange(e.target.value);
    setOpen(true);
    setHighlightedIndex(-1);
  };

  // Handle input focus
  const handleInputFocus = () => {
    setOpen(true);
  };

  // Handle input blur
  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Delay closing to allow click selection
    setTimeout(() => setOpen(false), 100);
  };

  // Handle keyboard navigation
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const results = getCombinedResults();
    if (!open && ["ArrowDown", "ArrowUp"].includes(e.key)) {
      setOpen(true);
      return;
    }
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      handleAirportSelect(results[highlightedIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  // Keep input value in sync with prop value
  React.useEffect(() => {
    setSearchValue(value);
  }, [value]);

  // Scroll highlighted item into view
  const listRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (open && highlightedIndex >= 0 && listRef.current) {
      const el = listRef.current.children[highlightedIndex] as HTMLElement;
      if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [highlightedIndex, open]);

  const combinedResults = getCombinedResults();

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-gray-200">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={searchValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder}
          className={cn(
            "h-9 font-mono text-lg tracking-wider",
            (error || (!isInputValid && value.length > 0)) &&
              "border-red-400 focus:border-red-400",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          disabled={disabled}
          autoComplete="off"
          spellCheck={false}
        />
        {open && (
          <div
            ref={listRef}
            className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto"
          >
            {combinedResults.length > 0 ? (
              combinedResults.map((airport, idx) => (
                <div
                  key={airport._id}
                  className={cn(
                    "px-3 py-2 cursor-pointer hover:bg-gray-700 transition-colors flex flex-col items-start",
                    idx === highlightedIndex && "bg-gray-700",
                    airport.isHistory && "border-l-2 border-l-blue-400"
                  )}
                  onMouseDown={() => handleAirportSelect(airport)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === airport.iataCode ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-lg">
                          {airport.iataCode}
                        </span>
                        {airport.isHistory && (
                          <span className="text-xs text-blue-400 bg-blue-900 px-1 rounded">
                            Recent
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-300">
                        {airport.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {airport.city}
                        {airport.country && `, ${airport.country}`}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-400">
                No airports found.
              </div>
            )}
          </div>
        )}
        {/* Error message */}
        {error && <div className="text-xs text-red-400 mt-1">{error}</div>}
      </div>
    </div>
  );
}
