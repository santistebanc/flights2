import {
  FlightSearchForm,
  FlightSearchParams,
} from "./components/flight-search/FlightSearchForm";
import { SearchContext, ScrapingSource } from "./SearchContext";
import { useLocalStorage } from "./useLocalStorage";
import { useFlightSearch } from "./hooks/useFlightSearch";
import { ResultsList } from "./components/flight-results/ResultsList";

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

  // Flight search hook for managing search lifecycle
  const {
    searchState,
    isSearching,
    progress,
    error,
    results,
    performSearch,
    resetSearch,
    retrySearch,
  } = useFlightSearch();

  // Ensure sources is always an array (fallback for old localStorage data)
  const safeSearchParams = {
    ...searchParams,
    sources: Array.isArray(searchParams.sources)
      ? searchParams.sources
      : defaultSources,
  };

  const handleSearch = async (searchParams: FlightSearchParams) => {
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

    // Trigger actual flight search using the hook
    await performSearch(searchParams);
  };

  // Render content based on search state
  const renderMainContent = () => {
    switch (searchState) {
      case "idle":
        return (
          <div className="mt-8 text-center text-gray-400">
            <p>Enter your search criteria above to find flights</p>
          </div>
        );

      case "loading":
        return (
          <div className="mt-8">
            <div className="text-center text-gray-400 mb-4">
              <p>Searching for flights...</p>
            </div>
            {/* TODO: Add ScrapingProgress component here */}
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300">
                    Kiwi
                  </span>
                  <span className="text-xs text-gray-500">
                    {progress.kiwi.status}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{progress.kiwi.message}</p>
                {progress.kiwi.recordsProcessed !== undefined && (
                  <p className="text-xs text-gray-500 mt-1">
                    {progress.kiwi.recordsProcessed} records processed
                  </p>
                )}
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300">
                    Skyscanner
                  </span>
                  <span className="text-xs text-gray-500">
                    {progress.skyscanner.status}
                  </span>
                </div>
                <p className="text-sm text-gray-400">
                  {progress.skyscanner.message}
                </p>
                {progress.skyscanner.recordsProcessed !== undefined && (
                  <p className="text-xs text-gray-500 mt-1">
                    {progress.skyscanner.recordsProcessed} records processed
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case "success":
        return (
          <div className="mt-8">
            <ResultsList bundles={results || []} isLoading={false} />
          </div>
        );

      case "no-results":
        return (
          <div className="mt-8 text-center">
            <div className="bg-gray-800 rounded-lg p-8">
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                No flights found
              </h3>
              <p className="text-gray-400 mb-4">
                No flights match your search criteria. Try adjusting your dates
                or airports.
              </p>
              <button
                onClick={retrySearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        );

      case "error":
        return (
          <div className="mt-8 text-center">
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-8">
              <h3 className="text-lg font-medium text-red-300 mb-2">
                Search failed
              </h3>
              <p className="text-red-400 mb-4">
                {error?.message ||
                  "An error occurred while searching for flights."}
              </p>
              {error?.details && (
                <p className="text-sm text-red-500 mb-4">{error.details}</p>
              )}
              <div className="space-x-4">
                <button
                  onClick={retrySearch}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Retry Search
                </button>
                <button
                  onClick={resetSearch}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Start Over
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <SearchContext.Provider
      value={{ searchParams: safeSearchParams, setSearchParams }}
    >
      <div className="h-screen flex flex-col bg-gray-900 overflow-hidden">
        {/* Sticky Search Form with Icon */}
        <div className="sticky top-0 z-10 bg-gray-800/95 backdrop-blur-sm border-b border-gray-700 shadow-sm flex-shrink-0">
          <FlightSearchForm onSearch={handleSearch} isLoading={isSearching} />
        </div>

        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-4xl mx-auto">{renderMainContent()}</div>
        </main>
      </div>
    </SearchContext.Provider>
  );
}
