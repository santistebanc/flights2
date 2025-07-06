import { ResultsList } from "../flight-results/ResultsList";
import { ScrapingProgress } from "../progress/ScrapingProgress";
import { ArrowRight } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useMemo } from "react";
import { useSearch } from "@tanstack/react-router";

// Date formatting function to match the date picker
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate();
  const year = date.getFullYear();
  const month = date.toLocaleString("en-us", { month: "short" });
  return `${day} ${month} ${year}`;
};

export function SearchResults() {
  const searchParams = useSearch({ from: "/" });

  // Only query if we have search parameters
  const hasSearchParams = !!(
    searchParams.from ||
    searchParams.to ||
    searchParams.depart
  );

  const bundles = useQuery(
    api.bundles.getBundlesForSearch,
    hasSearchParams
      ? {
          departureIata: searchParams.from || "",
          arrivalIata: searchParams.to || "",
          departureDate: searchParams.depart || "",
          returnDate: searchParams.return,
          isRoundTrip: !!searchParams.return,
        }
      : "skip"
  );

  // Calculate minPrice for each bundle
  const bundlesWithPrices = useMemo(() => {
    if (!bundles) return [];

    return bundles.map((bundle) => ({
      ...bundle,
      minPrice:
        bundle.bookingOptions.length > 0
          ? Math.min(...bundle.bookingOptions.map((option) => option.price))
          : 0,
    }));
  }, [bundles]);

  // Query the most recent scrape session for these search parameters
  const scrapeSession = useQuery(
    api.scrapeSessions.getMostRecentScrapeSession,
    hasSearchParams &&
      searchParams.from &&
      searchParams.to &&
      searchParams.depart
      ? {
          departureAirport: searchParams.from.toUpperCase(),
          arrivalAirport: searchParams.to.toUpperCase(),
          departureDate: searchParams.depart,
          returnDate: searchParams.return,
          isRoundTrip: !!searchParams.return,
        }
      : "skip"
  );

  // If we have URL parameters, show database results
  if (hasSearchParams) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex gap-4 items-center">
          <div className="flex items-center text-muted-foreground">
            {searchParams.from} <ArrowRight className="inline h-4 w-4 mx-1" />{" "}
            {searchParams.to}
          </div>
          <div className="flex items-center text-muted-foreground">
            {searchParams.depart && formatDate(searchParams.depart)}
            {searchParams.return && (
              <>
                <ArrowRight className="inline h-4 w-4 mx-1" />
                {formatDate(searchParams.return)}
              </>
            )}
          </div>
        </div>

        {/* Show scraping progress if we have a session */}
        {scrapeSession && <ScrapingProgress session={scrapeSession} />}

        <ResultsList
          bundles={bundlesWithPrices}
          isLoading={bundles === undefined}
        />
      </div>
    );
  }

  return null;
}
