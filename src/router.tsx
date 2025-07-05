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
import { ThemeToggle } from "./components/ui/theme-toggle";
import { useUrlBasedSearch } from "./hooks/useUrlBasedSearch";
import { useFlightSearch } from "./hooks/useFlightSearch";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SearchResults } from "./components/search-results/SearchResults";

// Default sources configuration
const defaultSources = [
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

// Search parameters type for URL (only search-related params)
interface SearchParams {
  from?: string;
  to?: string;
  depart?: string;
  return?: string;
}

// Preferences interface
interface Preferences {
  sources: typeof defaultSources;
}

// Root route component
function RootComponent() {
  // URL-based search hook
  const { bundles, isLoading, hasSearchParams, searchParams } =
    useUrlBasedSearch();

  // Flight search hook for managing search lifecycle
  const { isSearching, progress } = useFlightSearch();

  // Render content based on search state and URL parameters
  const renderMainContent = () => {
    // If we have URL parameters, show database results
    if (hasSearchParams) {
      return (
        <SearchResults
          hasSearchParams={hasSearchParams}
          isLoading={isLoading}
          bundles={bundles}
          searchParams={searchParams}
        />
      );
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Sticky Search Form with Icon */}
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between px-4 py-2">
          <h1 className="text-xl font-semibold text-foreground">
            Flight Search
          </h1>
          <ThemeToggle />
        </div>
        <FlightSearchForm />

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
