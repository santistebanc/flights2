import { useSearchContext } from "../contexts/SearchContext";
import { Button } from "./ui/button";
import { DateRangePicker } from "./ui/date-range-picker";
import { Autocomplete } from "./ui/autocomplete";
import { useState } from "react";
import { Temporal } from "@js-temporal/polyfill";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

// // Initialize the ApifyClient with API token
// const client = new ApifyClient({
//   token: process.env.APIFY_TOKEN,
// });

export function CompactFilters() {

  // Remove logging of APIFY_TOKEN, as process.env is not available in the browser
  const { searchParams, setSearchParams } = useSearchContext();

  function getTodayAsString(): string {
    const today = new Date();
    return Temporal.PlainDate.from({
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate(),
    }).toString();
  }

  // Local state for filters
  const [localFilters, setLocalFilters] = useState({
    ...searchParams,
    from: searchParams.from || "",
    to: searchParams.to || "",
    outboundDate: searchParams.outboundDate || getTodayAsString(),
    inboundDate: searchParams.inboundDate || "",
  });

  const runApifyActor = useAction(api.apify.runApifyActor);

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

  // Helper function to get field styling based on whether it's required and filled
  const getFieldClassName = (fieldValue: string, isRequired: boolean = true) => {
    const baseClass = "flex-1";
    if (!isRequired) return baseClass;
    
    const isEmpty = fieldValue.trim() === "";
    const isMissing = isEmpty && !isSearchDisabled; // Only show as missing if search is disabled
    
    return `${baseClass} ${isMissing ? 'border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500' : ''}`;
  };

  function toPlainDateString(date: Date | undefined): string {
    if (!date) return "";
    return Temporal.PlainDate.from({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    }).toString();
  }

  function handleDateRangeUpdate(values: {
    range: { from: Date; to?: Date };
    isRoundTrip: boolean;
  }) {
    setLocalFilters((prev) => ({
      ...prev,
      outboundDate: toPlainDateString(values.range.from),
      inboundDate:
        values.isRoundTrip && values.range.to
          ? toPlainDateString(values.range.to)
          : "",
      isRoundTrip: values.isRoundTrip,
    }));
  }

  return (
    <div className="px-4 py-3 border-t border-gray-700/50">
      <div className="mx-auto">
        <div className="flex gap-3 items-center">
          <div className="flex-1">
            <Autocomplete
              value={localFilters.from}
              onChange={(value) =>
                setLocalFilters((prev) => ({ ...prev, from: value }))
              }
              placeholder="From"
              className={getFieldClassName(localFilters.from)}
            />
          </div>
          <div className="flex-1">
            <Autocomplete
              value={localFilters.to}
              onChange={(value) =>
                setLocalFilters((prev) => ({ ...prev, to: value }))
              }
              placeholder="To"
              className={getFieldClassName(localFilters.to)}
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
              if (isSearchDisabled) return;
              setSearchParams(localFilters);
              console.log("Searching with params:", localFilters);
              try {
                const result = await runApifyActor(localFilters);
                console.log("Apify actor run result:", result);
              } catch (err) {
                console.error("Error running Apify actor:", err);
              }
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
      </div>
    </div>
  );
}
