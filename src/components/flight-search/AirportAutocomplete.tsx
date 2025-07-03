import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { cn } from "../../utils";
import { useAirportHistory } from "../../hooks/useAirportHistory";

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
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search term for API calls
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Airport history hook
  const { history, addToHistory } = useAirportHistory();

  // Fetch airports from Convex
  const airports = useQuery(
    api.airports.searchAirports,
    debouncedSearchTerm.length > 0
      ? { searchTerm: debouncedSearchTerm, limit: 8 }
      : "skip"
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

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle airport selection
  const handleAirportSelect = useCallback(
    (airport: Airport) => {
      isUserTyping.current = true;
      onChange(airport.iataCode);
      setSearchTerm(airport.iataCode);
      onAirportSelect?.(airport);
      setIsOpen(false);
      setSelectedIndex(-1);
      inputRef.current?.blur();

      // Add to history
      addToHistory({
        iataCode: airport.iataCode,
        name: airport.name,
        city: airport.city,
        country: airport.country,
      });

      // Reset the flag after a short delay
      setTimeout(() => {
        isUserTyping.current = false;
      }, 100);
    },
    [onChange, onAirportSelect, addToHistory]
  );

  // Get combined results (history + search results)
  const getCombinedResults = useCallback(() => {
    const results: Array<Airport & { isHistory?: boolean }> = [];

    // Add history items if search term is empty or matches
    if (searchTerm.length === 0 || debouncedSearchTerm.length === 0) {
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
            .includes(searchTerm.toLowerCase()) ||
          historyItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          historyItem.city.toLowerCase().includes(searchTerm.toLowerCase())
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
  }, [searchTerm, debouncedSearchTerm, history, airports]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const combinedResults = getCombinedResults();
      if (!combinedResults || combinedResults.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < combinedResults.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : combinedResults.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && combinedResults[selectedIndex]) {
            handleAirportSelect(combinedResults[selectedIndex]);
          }
          break;
        case "Escape":
          setIsOpen(false);
          setSelectedIndex(-1);
          break;
      }
    },
    [selectedIndex, handleAirportSelect, getCombinedResults]
  );

  // Sync searchTerm with value prop (but not during user input)
  const isUserTyping = useRef(false);

  useEffect(() => {
    if (!isUserTyping.current) {
      setSearchTerm(value);
    }
  }, [value]);

  // Handle input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      isUserTyping.current = true;
      setSearchTerm(newValue);
      onChange(newValue);
      // Show dropdown if there's a search term or if there's history to show
      setIsOpen(newValue.length > 0 || history.length > 0);
      setSelectedIndex(-1);

      // Reset the flag after a short delay
      setTimeout(() => {
        isUserTyping.current = false;
      }, 100);
    },
    [onChange, history.length]
  );

  // Handle input focus
  const handleFocus = useCallback(() => {
    // Show dropdown if there's a search term or if there's history to show
    if (searchTerm.length > 0 || history.length > 0) {
      setIsOpen(true);
    }
  }, [searchTerm, history.length]);

  // Handle input blur
  const handleBlur = useCallback(() => {
    // Delay closing to allow for clicks on suggestions
    setTimeout(() => {
      setIsOpen(false);
      setSelectedIndex(-1);
    }, 150);
  }, []);

  // Auto-scroll to selected item
  useEffect(() => {
    if (selectedIndex >= 0 && dropdownRef.current) {
      const selectedElement = dropdownRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [selectedIndex]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get match type color
  const getMatchTypeColor = (matchType: Airport["matchType"]) => {
    switch (matchType) {
      case "iata":
        return "text-green-400";
      case "name":
        return "text-blue-400";
      case "city":
        return "text-yellow-400";
      case "country":
        return "text-gray-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className="text-sm font-medium text-gray-200">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </Label>
      )}
      <div className="relative" ref={containerRef}>
        <Input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
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

        {/* Error message */}
        {error && (
          <div className="absolute -bottom-6 left-0 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Dropdown */}
        {isOpen &&
          (() => {
            const combinedResults = getCombinedResults();
            return combinedResults.length > 0 ? (
              <div
                ref={dropdownRef}
                className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto"
              >
                {combinedResults.map((airport, index) => (
                  <div
                    key={airport._id}
                    className={cn(
                      "px-3 py-2 cursor-pointer hover:bg-gray-700 transition-colors",
                      index === selectedIndex && "bg-gray-700",
                      airport.isHistory && "border-l-2 border-l-blue-400"
                    )}
                    onClick={() => handleAirportSelect(airport)}
                  >
                    <div className="flex items-center justify-between">
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
                ))}
              </div>
            ) : null;
          })()}

        {/* No results */}
        {isOpen &&
          (() => {
            const combinedResults = getCombinedResults();
            return combinedResults.length === 0 &&
              debouncedSearchTerm.length > 0 ? (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-50">
                <div className="px-3 py-2 text-sm text-gray-400">
                  No airports found
                </div>
              </div>
            ) : null;
          })()}
      </div>
    </div>
  );
}
