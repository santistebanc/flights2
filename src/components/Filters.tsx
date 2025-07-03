import { useSearchContext } from "../SearchContext";
import { Button } from "./ui/button";
import { DateRangePicker } from "./ui/date-range-picker";
import { IataInput } from "./flight-search/IataInput";
import { useState, useCallback } from "react";
import { getTodayAsString, toPlainDateString } from "@/utils";
import { useFlightSearchValidation } from "../hooks/useFlightSearchValidation";

export function Filters() {
  const { searchParams, setSearchParams } = useSearchContext();

  // Local state for filters
  const [localFilters, setLocalFilters] = useState({
    ...searchParams,
    from: searchParams.from || "",
    to: searchParams.to || "",
    outboundDate: searchParams.outboundDate || getTodayAsString(),
    inboundDate: searchParams.inboundDate || "",
  });

  // Use comprehensive validation hook
  const validation = useFlightSearchValidation({
    from: localFilters.from,
    to: localFilters.to,
    outboundDate: localFilters.outboundDate,
    inboundDate: localFilters.inboundDate,
    isRoundTrip: localFilters.isRoundTrip,
  });

  const isSearchDisabled = !validation.isValid;

  const handleDateRangeUpdate = useCallback(
    (values: { range: { from: Date; to?: Date }; isRoundTrip: boolean }) => {
      const updatedFilters = {
        ...localFilters,
        outboundDate: toPlainDateString(values.range.from),
        inboundDate:
          values.isRoundTrip && values.range.to
            ? toPlainDateString(values.range.to)
            : "",
        isRoundTrip: values.isRoundTrip,
      };

      // Update local state
      setLocalFilters(updatedFilters);

      // Immediately save to localStorage
      setSearchParams(updatedFilters);
    },
    [localFilters, setSearchParams]
  );

  return (
    <div
      className="px-4 py-3 border-t border-gray-700/50"
      style={{ position: "relative" }}
    >
      <div className="mx-auto">
        {/* Top Row: Airport inputs, date picker, search button */}
        <div className="flex gap-3 items-center mb-3">
          {/* IataInput components */}
          <div className="flex-1">
            <IataInput
              placeholder="From"
              value={localFilters.from}
              onChange={(value) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  from: value,
                }))
              }
              required
              otherAirportValue={localFilters.to}
              error={validation.errors.from}
            />
          </div>
          <div className="flex-1">
            <IataInput
              placeholder="To"
              value={localFilters.to}
              onChange={(value) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  to: value,
                }))
              }
              required
              otherAirportValue={localFilters.from}
              error={validation.errors.to}
            />
          </div>
          {/* DateRangePicker */}
          <div className="flex-1">
            <DateRangePicker
              dateFrom={localFilters.outboundDate}
              dateTo={localFilters.inboundDate}
              isRoundTrip={localFilters.isRoundTrip}
              onUpdate={handleDateRangeUpdate}
            />
          </div>
          <Button
            className={`flex-shrink-0 ${
              isSearchDisabled
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-yellow-400 text-black hover:bg-yellow-500"
            }`}
            onClick={async () => {
              setSearchParams(localFilters);
            }}
            disabled={isSearchDisabled}
            title={
              isSearchDisabled
                ? Object.values(validation.errors).filter(Boolean).join(", ") ||
                  "Please fill in all required fields"
                : "Search for flights"
            }
          >
            Search
          </Button>
        </div>

        {/* Bottom Row: Results count and progress indicators */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-400">
            {/* Results count will be updated by parent component */}
            Ready to search
          </div>
          {validation.errors.general && (
            <div className="text-sm text-red-400">
              {validation.errors.general}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
