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

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Validate departure airport
    if (!departureAirport) {
      newErrors.departureAirport = "Departure airport is required";
    } else if (!validateIataCode(departureAirport)) {
      newErrors.departureAirport = "Please enter a valid 3-letter airport code";
    }

    // Validate arrival airport
    if (!arrivalAirport) {
      newErrors.arrivalAirport = "Arrival airport is required";
    } else if (!validateIataCode(arrivalAirport)) {
      newErrors.arrivalAirport = "Please enter a valid 3-letter airport code";
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
    if (!dateRange.from) {
      newErrors.dates = "Departure date is required";
    } else if (isRoundTrip && !dateRange.to) {
      newErrors.dates = "Return date is required for round trips";
    } else if (
      isRoundTrip &&
      dateRange.from &&
      dateRange.to &&
      dateRange.from >= dateRange.to
    ) {
      newErrors.dates = "Return date must be after departure date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

    // Clear date errors when dates are updated
    if (errors.dates) {
      setErrors((prev) => ({ ...prev, dates: undefined }));
    }
  };

  // Clear errors when inputs change
  const handleDepartureAirportChange = (value: string) => {
    setDepartureAirport(value);
    if (errors.departureAirport) {
      setErrors((prev) => ({ ...prev, departureAirport: undefined }));
    }
  };

  const handleArrivalAirportChange = (value: string) => {
    setArrivalAirport(value);
    if (errors.arrivalAirport) {
      setErrors((prev) => ({ ...prev, arrivalAirport: undefined }));
    }
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

      {/* Form Status */}
      {!isFormValid && (
        <div className="text-center text-sm text-gray-400">
          Please fill in all required fields correctly to search for flights
        </div>
      )}
    </form>
  );
}
