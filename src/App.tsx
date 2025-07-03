import {
  FlightSearchForm,
  FlightSearchParams,
} from "./components/flight-search/FlightSearchForm";
import { SearchContext, ScrapingSource } from "./SearchContext";
import { useLocalStorage } from "./useLocalStorage";

// Default sources configuration
const defaultSources: ScrapingSource[] = [
  {
    id: "kiwi",
    enabled: true,
    name: "Kiwi",
  },
  {
    id: "sky",
    enabled: true,
    name: "Sky",
  },
];

export default function App() {
  const [searchParams, setSearchParams] = useLocalStorage(
    "flight-search-filters",
    {
      from: "BER",
      to: "MAD",
      outboundDate: "2025-07-03",
      inboundDate: "",
      isRoundTrip: false,
      sources: defaultSources,
    }
  );

  // Ensure sources is always an array (fallback for old localStorage data)
  const safeSearchParams = {
    ...searchParams,
    sources: Array.isArray(searchParams.sources)
      ? searchParams.sources
      : defaultSources,
  };

  const handleSearch = (searchParams: FlightSearchParams) => {
    // Convert FlightSearchParams to the format expected by SearchContext
    const convertedParams = {
      from: searchParams.departureAirport,
      to: searchParams.arrivalAirport,
      outboundDate: searchParams.departureDate.toISOString().split("T")[0],
      inboundDate: searchParams.returnDate
        ? searchParams.returnDate.toISOString().split("T")[0]
        : "",
      isRoundTrip: searchParams.isRoundTrip,
      sources: safeSearchParams.sources,
    };

    setSearchParams(convertedParams);
    // TODO: Trigger actual flight search here
    console.log("Search triggered with:", searchParams);
  };

  return (
    <SearchContext.Provider
      value={{ searchParams: safeSearchParams, setSearchParams }}
    >
      <div className="h-screen flex flex-col bg-gray-900 overflow-hidden">
        {/* Sticky Search Form with Icon */}
        <div className="sticky top-0 z-10 bg-gray-800/95 backdrop-blur-sm border-b border-gray-700 shadow-sm flex-shrink-0">
          <FlightSearchForm
            onSearch={handleSearch}
            isLoading={false} // TODO: Connect to actual loading state
          />
        </div>

        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-4xl mx-auto">
            {/* TODO: Add flight results display here */}
            <div className="mt-8 text-center text-gray-400">
              <p>Flight results will appear here after search</p>
            </div>
          </div>
        </main>
      </div>
    </SearchContext.Provider>
  );
}
