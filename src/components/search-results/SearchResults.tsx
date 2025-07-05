import React from "react";
import { ResultsList } from "../flight-results/ResultsList";

interface SearchResultsProps {
  hasSearchParams: boolean;
  isLoading: boolean;
  bundles: any[];
  searchParams: {
    from?: string;
    to?: string;
    depart?: string;
    return?: string;
  };
}

export function SearchResults({
  hasSearchParams,
  isLoading,
  bundles,
  searchParams,
}: SearchResultsProps) {
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

  return null;
}
