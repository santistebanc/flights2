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
  const [loadedFromLocalStorage, setLoadedFromLocalStorage] = useState(false);

  // Form state
  const [departureAirport, setDepartureAirport] = useState("");
  const [arrivalAirport, setArrivalAirport] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: undefined,
  });
  const [isRoundTrip, setIsRoundTrip] = useState(false);

  // Track if airports exist in database
  const [departureAirportExists, setDepartureAirportExists] = useState<
    boolean | null
  >(null);
  const [arrivalAirportExists, setArrivalAirportExists] = useState<
    boolean | null
  >(null);

  // Load saved preferences when component mounts
  useEffect(() => {
    if (isLoaded && !loadedFromLocalStorage) {
      const savedState = getFormState();
      if (savedState) {
        setDepartureAirport(savedState.departureAirport);
        setArrivalAirport(savedState.arrivalAirport);
        setDateRange({
          from: savedState.departureDate,
          to: savedState.returnDate,
        });
        setIsRoundTrip(savedState.isRoundTrip);
        setLoadedFromLocalStorage(true);
      }
    }
  }, [isLoaded, getFormState]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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
  };

  // Handle date range updates
  const handleDateRangeUpdate = (values: {
    range: DateRange;
    isRoundTrip: boolean;
  }) => {
    setDateRange(values.range);
    setIsRoundTrip(values.isRoundTrip);
  };

  // Handle airport input changes
  const handleDepartureAirportChange = (value: string) => {
    // Convert to uppercase for consistency
    const upperValue = value.toUpperCase();
    setDepartureAirport(upperValue);
    // Reset existence check when value changes
    setDepartureAirportExists(null);
  };

  const handleArrivalAirportChange = (value: string) => {
    // Convert to uppercase for consistency
    const upperValue = value.toUpperCase();
    setArrivalAirport(upperValue);
    // Reset existence check when value changes
    setArrivalAirportExists(null);
  };

  // Handle airport existence updates
  const handleDepartureAirportExists = (exists: boolean | null) => {
    setDepartureAirportExists(exists);
  };

  const handleArrivalAirportExists = (exists: boolean | null) => {
    setArrivalAirportExists(exists);
  };

  // Check if form is valid for enabling search button
  const isFormValid =
    departureAirport &&
    arrivalAirport &&
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
    </form>
  );
}
