import React, { useState, useEffect } from "react";
import { DateRangePicker } from "../ui/date-range-picker";
import { SearchButton } from "./SearchButton";
import { cn } from "../../utils";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { PlaneTakeoff } from "lucide-react";
import { AirportAutocomplete } from "./AirportAutocomplete";

interface FlightSearchFormProps {
  onSearch: (searchParams: FlightSearchParams) => void;
  isLoading?: boolean;
  className?: string;
}

export interface FlightSearchParams {
  departureAirport: string;
  arrivalAirport: string;
  departureDate: Date;
  returnDate?: Date;
  isRoundTrip: boolean;
}

interface DateRange {
  from: Date;
  to: Date | undefined;
}

export function FlightSearchForm({
  onSearch,
  isLoading = false,
  className,
}: FlightSearchFormProps) {
  // localStorage hook
  const { isLoaded, savePreferences, getFormState } = useLocalStorage();

  // Form state
  const [departureAirport, setDepartureAirport] = useState("");
  const [arrivalAirport, setArrivalAirport] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: undefined,
  });
  const [isRoundTrip, setIsRoundTrip] = useState(false);

  // Validation state
  const [errors, setErrors] = useState<{
    departureAirport?: string;
    arrivalAirport?: string;
    dates?: string;
  }>({});

  // Track if airports exist in database
  const [departureAirportExists, setDepartureAirportExists] = useState<
    boolean | null
  >(null);
  const [arrivalAirportExists, setArrivalAirportExists] = useState<
    boolean | null
  >(null);

  // Load saved preferences when component mounts
  useEffect(() => {
    if (isLoaded) {
      const savedState = getFormState();
      if (savedState) {
        setDepartureAirport(savedState.departureAirport);
        setArrivalAirport(savedState.arrivalAirport);
        setDateRange({
          from: savedState.departureDate,
          to: savedState.returnDate,
        });
        setIsRoundTrip(savedState.isRoundTrip);
      }
    }
  }, [isLoaded, getFormState]);

  // Validation functions
  const validateIataCode = (code: string): boolean => {
    return /^[A-Z]{3}$/.test(code.toUpperCase());
  };

  const validateDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  const validateDateRange = (
    from: Date,
    isRoundTrip: boolean,
    to?: Date
  ): string | undefined => {
    if (!from) {
      return "Departure date is required";
    }

    if (!validateDate(from)) {
      return "Departure date cannot be in the past";
    }

    if (isRoundTrip) {
      if (!to) {
        return "Return date is required for round trips";
      }

      if (!validateDate(to)) {
        return "Return date cannot be in the past";
      }

      if (from >= to) {
        return "Return date must be after departure date";
      }

      // Check if return date is too far in the future (e.g., more than 1 year)
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 1);
      if (to > maxDate) {
        return "Return date cannot be more than 1 year in the future";
      }
    }

    // Check if departure date is too far in the future (e.g., more than 1 year)
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    if (from > maxDate) {
      return "Departure date cannot be more than 1 year in the future";
    }

    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Validate departure airport
    if (!departureAirport.trim()) {
      newErrors.departureAirport = "Departure airport is required";
    } else if (!validateIataCode(departureAirport)) {
      newErrors.departureAirport =
        "Please enter a valid 3-letter airport code (e.g., JFK, LAX)";
    }

    // Validate arrival airport
    if (!arrivalAirport.trim()) {
      newErrors.arrivalAirport = "Arrival airport is required";
    } else if (!validateIataCode(arrivalAirport)) {
      newErrors.arrivalAirport =
        "Please enter a valid 3-letter airport code (e.g., JFK, LAX)";
    }

    // Check for duplicate airports
    if (
      departureAirport &&
      arrivalAirport &&
      departureAirport === arrivalAirport
    ) {
      newErrors.arrivalAirport =
        "Departure and arrival airports must be different";
    }

    // Validate dates
    const dateError = validateDateRange(
      dateRange.from,
      isRoundTrip,
      dateRange.to
    );
    if (dateError) {
      newErrors.dates = dateError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Real-time validation for individual fields
  const validateField = (
    field: "departureAirport" | "arrivalAirport" | "dates"
  ): string | undefined => {
    // If both airports are filled and the same, show duplicate error for both
    if (
      departureAirport.trim() &&
      arrivalAirport.trim() &&
      departureAirport === arrivalAirport
    ) {
      return "Departure and arrival airports must be different";
    }
    switch (field) {
      case "departureAirport":
        if (!departureAirport.trim()) {
          return "Departure airport is required";
        }
        if (!validateIataCode(departureAirport)) {
          return "Please enter a valid 3-letter airport code (e.g., JFK, LAX)";
        }
        if (departureAirportExists === false) {
          return "Airport not found in our database";
        }
        return undefined;

      case "arrivalAirport":
        if (!arrivalAirport.trim()) {
          return "Arrival airport is required";
        }
        if (!validateIataCode(arrivalAirport)) {
          return "Please enter a valid 3-letter airport code (e.g., JFK, LAX)";
        }
        if (arrivalAirportExists === false) {
          return "Airport not found in our database";
        }
        return undefined;

      case "dates":
        return validateDateRange(dateRange.from, isRoundTrip, dateRange.to);

      default:
        return undefined;
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      const searchParams: FlightSearchParams = {
        departureAirport,
        arrivalAirport,
        departureDate: dateRange.from,
        returnDate: isRoundTrip ? dateRange.to : undefined,
        isRoundTrip,
      };

      // Save preferences to localStorage
      savePreferences({
        departureAirport,
        arrivalAirport,
        departureDate: dateRange.from.toISOString(),
        returnDate:
          isRoundTrip && dateRange.to ? dateRange.to.toISOString() : undefined,
        isRoundTrip,
      });

      onSearch(searchParams);
    }
  };

  // Handle date range updates
  const handleDateRangeUpdate = (values: {
    range: DateRange;
    isRoundTrip: boolean;
  }) => {
    setDateRange(values.range);
    setIsRoundTrip(values.isRoundTrip);

    // Real-time validation for dates
    const error = validateDateRange(
      values.range.from,
      values.isRoundTrip,
      values.range.to
    );
    setErrors((prev) => ({ ...prev, dates: error }));
  };

  // Clear errors when inputs change
  const handleDepartureAirportChange = (value: string) => {
    // Convert to uppercase for consistency
    const upperValue = value.toUpperCase();
    setDepartureAirport(upperValue);

    // Reset existence check when value changes
    setDepartureAirportExists(null);

    // Real-time validation
    const error = validateField("departureAirport");
    setErrors((prev) => ({
      ...prev,
      departureAirport: error,
      // Clear arrival airport error if it was due to duplicate airports
      arrivalAirport:
        prev.arrivalAirport ===
        "Departure and arrival airports must be different"
          ? undefined
          : prev.arrivalAirport,
    }));
  };

  const handleArrivalAirportChange = (value: string) => {
    // Convert to uppercase for consistency
    const upperValue = value.toUpperCase();
    setArrivalAirport(upperValue);

    // Reset existence check when value changes
    setArrivalAirportExists(null);

    // Real-time validation
    const error = validateField("arrivalAirport");
    setErrors((prev) => ({
      ...prev,
      arrivalAirport: error,
      // Clear departure airport error if it was due to duplicate airports
      departureAirport:
        prev.departureAirport ===
        "Departure and arrival airports must be different"
          ? undefined
          : prev.departureAirport,
    }));
  };

  // Handle airport existence updates
  const handleDepartureAirportExists = (exists: boolean | null) => {
    setDepartureAirportExists(exists);
    // Re-validate if we now know the airport doesn't exist
    if (exists === false && departureAirport) {
      const error = validateField("departureAirport");
      setErrors((prev) => ({ ...prev, departureAirport: error }));
    }
  };

  const handleArrivalAirportExists = (exists: boolean | null) => {
    setArrivalAirportExists(exists);
    // Re-validate if we now know the airport doesn't exist
    if (exists === false && arrivalAirport) {
      const error = validateField("arrivalAirport");
      setErrors((prev) => ({ ...prev, arrivalAirport: error }));
    }
  };

  // Check if form is valid for enabling search button
  const isFormValid =
    departureAirport &&
    arrivalAirport &&
    validateIataCode(departureAirport) &&
    validateIataCode(arrivalAirport) &&
    departureAirport !== arrivalAirport &&
    dateRange.from &&
    (!isRoundTrip ||
      (isRoundTrip && dateRange.to && dateRange.from < dateRange.to));

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "p-3 bg-gray-800/95 backdrop-blur-sm border-b border-gray-700",
        className
      )}
    >
      <div className="flex flex-col md:flex-row gap-3 items-center max-w-6xl mx-auto">
        {/* FlightFinder Icon */}
        <div className="flex-shrink-0">
          <PlaneTakeoff className="h-8 w-8 text-yellow-400" />
        </div>

        {/* Airport Inputs */}
        <div className="flex gap-3 flex-1">
          <div className="flex-1">
            <AirportAutocomplete
              value={departureAirport}
              onChange={handleDepartureAirportChange}
              placeholder="From"
              required
              otherAirportValue={arrivalAirport}
              className="w-full"
              onAirportExists={handleDepartureAirportExists}
            />
          </div>

          <div className="flex-1">
            <AirportAutocomplete
              value={arrivalAirport}
              onChange={handleArrivalAirportChange}
              placeholder="To"
              required
              otherAirportValue={departureAirport}
              className="w-full"
              onAirportExists={handleArrivalAirportExists}
            />
          </div>
        </div>

        {/* Date Range Picker */}
        <div className="flex-shrink-0">
          <DateRangePicker
            dateFrom={dateRange.from}
            dateTo={dateRange.to}
            isRoundTrip={isRoundTrip}
            onUpdate={handleDateRangeUpdate}
          />
        </div>

        {/* Search Button */}
        <div className="flex-shrink-0">
          <SearchButton
            isLoading={isLoading}
            disabled={!isFormValid}
            loadingText="Searching..."
            size="default"
          >
            Search
          </SearchButton>
        </div>
      </div>

      {/* Form Status and Validation Summary */}
      {!isFormValid && (
        <div className="mt-3 max-w-6xl mx-auto">
          {/* Validation Summary */}
          {(errors.departureAirport ||
            errors.arrivalAirport ||
            errors.dates) && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-md p-2">
              <h4 className="text-sm font-medium text-red-400 mb-1">
                Please fix the following issues:
              </h4>
              <ul className="text-sm text-red-300 space-y-1">
                {errors.departureAirport && (
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">•</span>
                    <span>Departure Airport: {errors.departureAirport}</span>
                  </li>
                )}
                {errors.arrivalAirport && (
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">•</span>
                    <span>Arrival Airport: {errors.arrivalAirport}</span>
                  </li>
                )}
                {errors.dates && (
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">•</span>
                    <span>Travel Dates: {errors.dates}</span>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
