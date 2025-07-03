import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { IataInput } from "./IataInput";
import { DateRangePicker } from "../ui/date-range-picker";
import { Search, Plane, RotateCcw } from "lucide-react";
import { cn } from "../../utils";
import { useLocalStorage } from "../../hooks/useLocalStorage";

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
  const { isLoaded, savePreferences, clearPreferences, getFormState } =
    useLocalStorage();

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
    return /^[A-Z]{3}$/.test(code);
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
    switch (field) {
      case "departureAirport":
        if (!departureAirport.trim()) {
          return "Departure airport is required";
        }
        if (!validateIataCode(departureAirport)) {
          return "Please enter a valid 3-letter airport code (e.g., JFK, LAX)";
        }
        if (departureAirport === arrivalAirport && arrivalAirport) {
          return "Departure and arrival airports must be different";
        }
        return undefined;

      case "arrivalAirport":
        if (!arrivalAirport.trim()) {
          return "Arrival airport is required";
        }
        if (!validateIataCode(arrivalAirport)) {
          return "Please enter a valid 3-letter airport code (e.g., JFK, LAX)";
        }
        if (departureAirport === arrivalAirport && departureAirport) {
          return "Departure and arrival airports must be different";
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
    setDepartureAirport(value);

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
    setArrivalAirport(value);

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

  // Handle clear preferences
  const handleClearPreferences = () => {
    clearPreferences();
    setDepartureAirport("");
    setArrivalAirport("");
    setDateRange({
      from: new Date(),
      to: undefined,
    });
    setIsRoundTrip(false);
    setErrors({});
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
        "space-y-6 p-6 bg-gray-800 rounded-lg border border-gray-700",
        className
      )}
    >
      <div className="space-y-4">
        {/* Airport Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <IataInput
              value={departureAirport}
              onChange={handleDepartureAirportChange}
              placeholder="From"
              label="Departure Airport"
              required
              error={errors.departureAirport}
              otherAirportValue={arrivalAirport}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <IataInput
              value={arrivalAirport}
              onChange={handleArrivalAirportChange}
              placeholder="To"
              label="Arrival Airport"
              required
              error={errors.arrivalAirport}
              otherAirportValue={departureAirport}
              className="w-full"
            />
          </div>
        </div>

        {/* Date Range Picker */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">
            Travel Dates
          </label>
          <DateRangePicker
            dateFrom={dateRange.from}
            dateTo={dateRange.to}
            isRoundTrip={isRoundTrip}
            onUpdate={handleDateRangeUpdate}
          />
          {errors.dates && (
            <p className="text-sm text-red-400 mt-1">{errors.dates}</p>
          )}
        </div>
      </div>

      {/* Search Button and Clear Preferences */}
      <div className="flex justify-center gap-4">
        <Button
          type="submit"
          disabled={!isFormValid || isLoading}
          className={cn(
            "px-8 py-3 bg-yellow-400 text-black hover:bg-yellow-500 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors",
            "flex items-center gap-2 font-semibold text-lg"
          )}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
              Searching...
            </>
          ) : (
            <>
              <Search className="h-5 w-5" />
              Search Flights
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={handleClearPreferences}
          className="px-4 py-3 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 transition-colors"
          title="Clear saved preferences"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Form Status and Validation Summary */}
      {!isFormValid && (
        <div className="space-y-2">
          <div className="text-center text-sm text-gray-400">
            Please fill in all required fields correctly to search for flights
          </div>

          {/* Validation Summary */}
          {(errors.departureAirport ||
            errors.arrivalAirport ||
            errors.dates) && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-md p-3">
              <h4 className="text-sm font-medium text-red-400 mb-2">
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
