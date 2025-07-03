import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/autocomplete";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/utils";
import { Check, ChevronsUpDown, Plane } from "lucide-react";
import { useAirportHistory } from "@/hooks/useAirportHistory";

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

  const combinedResults = getCombinedResults();

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-gray-200">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between h-9 font-mono text-lg tracking-wider",
              (error || (!isInputValid && value.length > 0)) &&
                "border-red-400 focus:border-red-400",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={disabled}
          >
            {getDisplayValue() || placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder={placeholder}
              value={searchValue}
              onValueChange={setSearchValue}
              className="h-9"
            />
            <CommandList>
              <CommandEmpty>No airports found.</CommandEmpty>
              {combinedResults.length > 0 && (
                <CommandGroup>
                  {combinedResults.map((airport) => (
                    <CommandItem
                      key={airport._id}
                      value={airport.iataCode}
                      onSelect={() => handleAirportSelect(airport)}
                      className="flex flex-col items-start py-3"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === airport.iataCode
                              ? "opacity-100"
                              : "opacity-0"
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
                            <Plane className="h-3 w-3 text-gray-400" />
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
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Error message */}
      {error && <div className="text-xs text-red-400">{error}</div>}
    </div>
  );
}
