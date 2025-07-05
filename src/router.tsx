import {
  createRouter,
  createRoute,
  createRootRoute,
} from "@tanstack/react-router";
import { FlightSearchForm } from "./components/flight-search/FlightSearchForm";
import { SearchResults } from "./components/search-results/SearchResults";

// Search parameters type for URL (only search-related params)
interface SearchParams {
  from?: string;
  to?: string;
  depart?: string;
  return?: string;
}

// Root route component
function RootComponent() {
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Sticky Search Form with Icon */}
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border shadow-sm flex-shrink-0">
        <FlightSearchForm />
      </div>

      <main className="flex-1 overflow-auto p-4">
        <SearchResults />
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
