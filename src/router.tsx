import {
  createRouter,
  createRoute,
  createRootRoute,
} from "@tanstack/react-router";
import {
  FlightSearchForm,
  FlightSearchParams,
} from "./components/flight-search/FlightSearchForm";
import { ResultsList } from "./components/flight-results/ResultsList";
import { ScrapingProgress } from "./components/progress/ScrapingProgress";
import { useFlightSearch } from "./hooks/useFlightSearch";
import { SearchContext, ScrapingSource } from "./SearchContext";
import { ThemeToggle } from "./components/ui/theme-toggle";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useUrlBasedSearch } from "./hooks/useUrlBasedSearch";

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

// Search parameters type for URL
interface SearchParams {
  from?: string;
  to?: string;
  depart?: string;
  return?: string;
  sources?: string;
}

// Root route component
function RootComponent() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/" });

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

  // URL-based search hook
  const { bundles, isLoading, hasSearchParams, searchParams } =
    useUrlBasedSearch();

  const handleSearch = async (searchParams: FlightSearchParams) => {
    // Update URL with search parameters
    const urlParams: SearchParams = {
      from: searchParams.departureAirport,
      to: searchParams.arrivalAirport,
      depart: searchParams.departureDate.toISOString().split("T")[0],
      return: searchParams.returnDate
        ? searchParams.returnDate.toISOString().split("T")[0]
        : undefined,
      sources: defaultSources.map((s) => s.id).join(","),
    };

    // Navigate to same route with parameters
    navigate({
      to: "/",
      search: urlParams,
    });

    // Trigger actual flight search using the hook
    await performSearch(searchParams);
  };

  // Render content based on search state and URL parameters
  const renderMainContent = () => {
    // If we have URL parameters, show database results
    if (hasSearchParams) {
      if (isLoading) {
        return (
          <div className="mt-8 text-center">
            <div className="bg-card border border-border rounded-lg p-8">
              <h3 className="text-lg font-medium text-card-foreground mb-2">
                Loading search results...
              </h3>
              <p className="text-muted-foreground">
                Searching for flights from {searchParams.from} to{" "}
                {searchParams.to} on {searchParams.depart}
                {searchParams.return && ` returning on ${searchParams.return}`}
              </p>
            </div>
          </div>
        );
      }

      if (bundles.length === 0) {
        return (
          <div className="mt-8 text-center">
            <div className="bg-card border border-border rounded-lg p-8">
              <h3 className="text-lg font-medium text-card-foreground mb-2">
                No flights found
              </h3>
              <p className="text-muted-foreground mb-4">
                No flights match your search criteria: {searchParams.from} to{" "}
                {searchParams.to} on {searchParams.depart}
                {searchParams.return && ` returning on ${searchParams.return}`}
              </p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your dates or airports.
              </p>
            </div>
          </div>
        );
      }

      return (
        <div className="mt-8">
          <div className="mb-4 p-4 bg-card border border-border rounded-lg">
            <h2 className="text-lg font-semibold text-card-foreground mb-2">
              Search Results
            </h2>
            <p className="text-muted-foreground">
              Found {bundles.length} flight options from {searchParams.from} to{" "}
              {searchParams.to} on {searchParams.depart}
              {searchParams.return && ` returning on ${searchParams.return}`}
            </p>
          </div>
          <ResultsList bundles={bundles} isLoading={false} />
        </div>
      );
    }

    // If no URL parameters, show search state results
    switch (searchState) {
      case "idle":
        return (
          <div className="mt-8 text-center text-muted-foreground">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Welcome to Flight Search
            </h2>
            <p>Enter your search criteria above to find flights</p>
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
            <div className="bg-card border border-border rounded-lg p-8">
              <h3 className="text-lg font-medium text-card-foreground mb-2">
                No flights found
              </h3>
              <p className="text-muted-foreground mb-4">
                No flights match your search criteria. Try adjusting your dates
                or airports.
              </p>
              <button
                onClick={retrySearch}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        );

      case "error":
        return (
          <div className="mt-8 text-center">
            <div className="bg-destructive/20 border border-destructive rounded-lg p-8">
              <h3 className="text-lg font-medium text-destructive-foreground mb-2">
                Search failed
              </h3>
              <p className="text-destructive-foreground mb-4">
                {error?.message ||
                  "An error occurred while searching for flights."}
              </p>
              {error?.details && (
                <p className="text-sm text-destructive mb-4">{error.details}</p>
              )}
              <div className="space-x-4">
                <button
                  onClick={retrySearch}
                  className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
                >
                  Retry Search
                </button>
                <button
                  onClick={resetSearch}
                  className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors"
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
      value={{
        searchParams: {
          departureAirport: search.from || "BER",
          arrivalAirport: search.to || "MAD",
          departureDate: search.depart || "2025-07-03",
          returnDate: search.return || "",
          isRoundTrip: !!search.return,
          sources: defaultSources,
        },
        setSearchParams: () => {}, // No-op since we're not using localStorage
      }}
    >
      <div className="h-screen flex flex-col bg-background overflow-hidden">
        {/* Sticky Search Form with Icon */}
        <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between px-4 py-2">
            <h1 className="text-xl font-semibold text-foreground">
              Flight Search
            </h1>
            <ThemeToggle />
          </div>
          <FlightSearchForm onSearch={handleSearch} isLoading={isSearching} />

          {/* Progress Indicators - shown only when searching */}
          {isSearching && (
            <div className="w-full px-4 pb-3">
              <ScrapingProgress progress={progress} />
            </div>
          )}
        </div>

        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-4xl mx-auto">{renderMainContent()}</div>
        </main>
      </div>
    </SearchContext.Provider>
  );
}

// Create routes
const rootRoute = createRootRoute({
  component: RootComponent,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => null, // Component is handled in RootComponent
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    from: search.from as string | undefined,
    to: search.to as string | undefined,
    depart: search.depart as string | undefined,
    return: search.return as string | undefined,
    sources: search.sources as string | undefined,
  }),
});

// Create and export router
export const routeTree = rootRoute.addChildren([indexRoute]);

export const router = createRouter({ routeTree });

// Declare router types
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
