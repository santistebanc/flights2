import { useSearchContext } from "../SearchContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { DateRangePicker } from "./ui/date-range-picker";
import { useState, useRef, useCallback } from "react";
import { getTodayAsString, toPlainDateString } from "@/utils";

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

  // Check if all required filters are set
  const areRequiredFiltersSet = () => {
    const hasFrom = localFilters.from.trim() !== "";
    const hasTo = localFilters.to.trim() !== "";
    const hasOutboundDate = localFilters.outboundDate.trim() !== "";
    const hasInboundDate = localFilters.isRoundTrip
      ? localFilters.inboundDate.trim() !== ""
      : true; // Inbound date only required for round trips

    return hasFrom && hasTo && hasOutboundDate && hasInboundDate;
  };

  const isSearchDisabled = !areRequiredFiltersSet();

  const handleDateRangeUpdate = useCallback(
    (values: { range: { from: Date; to?: Date }; isRoundTrip: boolean }) => {
      setLocalFilters((prev) => ({
        ...prev,
        outboundDate: toPlainDateString(values.range.from),
        inboundDate:
          values.isRoundTrip && values.range.to
            ? toPlainDateString(values.range.to)
            : "",
        isRoundTrip: values.isRoundTrip,
      }));
    },
    []
  );

  return (
    <div
      className="px-4 py-3 border-t border-gray-700/50"
      style={{ position: "relative" }}
    >
      <div className="mx-auto">
        {/* Top Row: Airport inputs, date picker, search button, settings button */}
        <div className="flex gap-3 items-center mb-3">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="From (e.g., JFK, LAX)"
              value={localFilters.from}
              onChange={(e) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  from: e.target.value.toUpperCase(),
                }))
              }
              className="h-9"
            />
          </div>
          <div className="flex-1">
            <Input
              type="text"
              placeholder="To (e.g., LHR, CDG)"
              value={localFilters.to}
              onChange={(e) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  to: e.target.value.toUpperCase(),
                }))
              }
              className="h-9"
            />
          </div>
          <DateRangePicker
            onUpdate={handleDateRangeUpdate}
            initialDateFrom={localFilters.outboundDate}
            initialDateTo={localFilters.inboundDate || undefined}
            initialRoundTrip={localFilters.isRoundTrip}
          />
          <Button
            className={`flex-shrink-0 ${
              isSearchDisabled
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-yellow-400 text-black hover:bg-yellow-500"
            }`}
            onClick={async () => {
              setSearchParams(localFilters);
              console.log("Searching with params:", localFilters);
            }}
            disabled={isSearchDisabled}
            title={
              isSearchDisabled
                ? "Please fill in all required fields: From, To, and Departure Date" +
                  (localFilters.isRoundTrip ? ", Return Date" : "")
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
        </div>
      </div>
    </div>
  );
}
