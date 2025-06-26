import { useSearchContext } from "../contexts/SearchContext";
import { Button } from "./ui/button";
import { DateRangePicker } from "./ui/date-range-picker";
import { Autocomplete } from "./ui/autocomplete";
import { useState } from "react";
import { Temporal } from "@js-temporal/polyfill";

export function CompactFilters() {
  const { searchParams, setSearchParams } = useSearchContext();
  // Local state for filters
  const [localFilters, setLocalFilters] = useState({
    ...searchParams,
    from: searchParams.from || "",
    to: searchParams.to || "",
    outboundDate: searchParams.outboundDate || "",
  });

  function toPlainDateString(date: Date | undefined): string {
    if (!date) return "";
    return Temporal.PlainDate.from({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    }).toString();
  }

  function handleDateRangeUpdate(values: { range: { from: Date; to?: Date }; isRoundTrip: boolean }) {
    setLocalFilters(prev => ({
      ...prev,
      outboundDate: toPlainDateString(values.range.from),
      inboundDate: values.isRoundTrip && values.range.to ? toPlainDateString(values.range.to) : "",
      isRoundTrip: values.isRoundTrip,
    }));
  }

  return (
    <div className="px-4 py-3 border-t border-gray-700/50">
      <div className="mx-auto">
        <div className="flex gap-3 items-center">
          <Autocomplete
            value={localFilters.from}
            onChange={(value) => setLocalFilters(prev => ({ ...prev, from: value }))}
            placeholder="From"
            className="flex-1"
          />
          <Autocomplete
            value={localFilters.to}
            onChange={(value) => setLocalFilters(prev => ({ ...prev, to: value }))}
            placeholder="To"
            className="flex-1"
          />
          <DateRangePicker
            onUpdate={handleDateRangeUpdate}
            initialDateFrom={localFilters.outboundDate}
            initialDateTo={localFilters.inboundDate || undefined}
            initialRoundTrip={localFilters.isRoundTrip}
          />
          <Button
            className="bg-yellow-400 text-black hover:bg-yellow-500 flex-shrink-0"
            onClick={() => {
              setSearchParams(localFilters);
              console.log("Searching with params:", localFilters);
            }}
          >
            Search
          </Button>
        </div>
      </div>
    </div>
  );
}
