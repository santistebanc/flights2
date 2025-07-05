import {
  FlightSearchForm,
  FlightSearchParams,
} from "./components/flight-search/FlightSearchForm";
import { SearchContext, ScrapingSource } from "./SearchContext";
import { useLocalStorage } from "./useLocalStorage";
import { useFlightSearch } from "./hooks/useFlightSearch";
import { ResultsList } from "./components/flight-results/ResultsList";
import { ScrapingProgress } from "./components/progress/ScrapingProgress";

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
      departureAirport: "BER",
      arrivalAirport: "MAD",
      departureDate: "2025-07-03",
      returnDate: "",
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
    // Update search params in context (no conversion needed since formats match)
    setSearchParams({
      departureAirport: searchParams.departureAirport,
      arrivalAirport: searchParams.arrivalAirport,
      departureDate: searchParams.departureDate.toISOString().split("T")[0],
      returnDate: searchParams.returnDate
        ? searchParams.returnDate.toISOString().split("T")[0]
        : "",
      isRoundTrip: searchParams.isRoundTrip,
      sources: safeSearchParams.sources,
    });

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
            <ScrapingProgress progress={progress} />
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
