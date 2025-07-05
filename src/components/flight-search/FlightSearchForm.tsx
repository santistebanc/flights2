import React, { useState } from "react";
import { DateRangePicker } from "../ui/date-range-picker";
import { SearchButton } from "./SearchButton";
import { cn, toPlainDateString } from "../../utils";
import { PlaneTakeoff } from "lucide-react";
import { AirportAutocomplete } from "./AirportAutocomplete";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useFlightSearch } from "@/hooks/useFlightSearch";

interface FlightSearchFormProps {
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

export function FlightSearchForm({ className }: FlightSearchFormProps) {
  const search = useSearch({ from: "/" });
  const navigate = useNavigate();
  const { performSearch } = useFlightSearch();
  // Form state with URL parameters as default values
  const [departureAirport, setDepartureAirport] = useState(search.from || "");
  const [arrivalAirport, setArrivalAirport] = useState(search.to || "");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: search.depart ? new Date(search.depart) : new Date(),
    to: search.return ? new Date(search.return) : undefined,
  });
  const [isRoundTrip, setIsRoundTrip] = useState(!!search.return);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    performSearch({
      departureAirport: departureAirport,
      arrivalAirport: arrivalAirport,
      departureDate: dateRange.from,
      returnDate: dateRange.to,
      isRoundTrip: isRoundTrip,
    });

    navigate({
      to: "/",
      search: {
        from: departureAirport,
        to: arrivalAirport,
        depart: toPlainDateString(dateRange.from),
        return: isRoundTrip ? toPlainDateString(dateRange.to) : undefined,
      },
    });
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
  };

  const handleArrivalAirportChange = (value: string) => {
    // Convert to uppercase for consistency
    const upperValue = value.toUpperCase();
    setArrivalAirport(upperValue);
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
      className={cn("p-3 bg-gray-800/95 backdrop-blur-sm", className)}
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
              otherAirportValue={arrivalAirport}
              className="w-full"
            />
          </div>

          <div className="flex-1">
            <AirportAutocomplete
              value={arrivalAirport}
              onChange={handleArrivalAirportChange}
              placeholder="To"
              otherAirportValue={departureAirport}
              className="w-full"
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
