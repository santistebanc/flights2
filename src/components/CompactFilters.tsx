import { useSearchContext } from "../contexts/SearchContext";
import { Button } from "./ui/button";
import { DateRangePicker } from "./ui/date-range-picker";
import { format } from "date-fns";

export function CompactFilters() {
  const { searchParams, setSearchParams } = useSearchContext();

  function handleDateRangeUpdate(values: {
    dateFrom: Date | undefined;
    dateTo: Date | undefined;
    compareFrom: Date | undefined;
    compareTo: Date | undefined;
  }) {
    setSearchParams(prev => ({
      ...prev,
      departureStart: values.dateFrom ? format(values.dateFrom, "yyyy-MM-dd") : "",
      departureEnd: values.dateTo ? format(values.dateTo, "yyyy-MM-dd") : "",
    }));
  }

  return (
    <div className="px-4 py-3 border-t border-gray-700/50">
      <div className="mx-auto">
        <div className="flex gap-3 items-center">
          <input
            type="text"
            placeholder="From"
            className="flex-1 h-9 w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-1 text-sm text-white shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-yellow-400 focus-visible:border-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
            value={searchParams.from}
            onChange={(e) => setSearchParams(prev => ({ ...prev, from: e.target.value }))}
          />
          <input
            type="text"
            placeholder="To"
            className="flex-1 h-9 w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-1 text-sm text-white shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-yellow-400 focus-visible:border-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
            value={searchParams.to}
            onChange={(e) => setSearchParams(prev => ({ ...prev, to: e.target.value }))}
          />
          <DateRangePicker
            onUpdate={(values) => {
              setSearchParams(prev => ({
                ...prev,
                departureStart: values.range.from ? format(values.range.from, "yyyy-MM-dd") : "",
                departureEnd: values.range.to ? format(values.range.to, "yyyy-MM-dd") : "",
              }));
            }}
            initialDateFrom={searchParams.departureStart || undefined}
            initialDateTo={searchParams.departureEnd || undefined}
            showCompare={false}
            align="start"
          />
          <Button
            className="bg-yellow-400 text-black hover:bg-yellow-500 flex-shrink-0"
            onClick={() => {
              console.log("Searching with params:", searchParams);
            }}
          >
            Search
          </Button>
        </div>
      </div>
    </div>
  );
}
