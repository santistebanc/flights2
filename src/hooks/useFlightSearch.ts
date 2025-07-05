import { useState, useCallback, useRef, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { FlightSearchParams } from "../../types/scraper";
import { ConvexClient } from "convex/browser";

export type SearchState =
  | "idle" // No search performed yet
  | "loading" // Search in progress
  | "success" // Search completed with results
  | "error" // Search failed
  | "no-results"; // Search completed with no results

export interface ScrapingProgress {
  kiwi: {
    status: "idle" | "phase1" | "phase2" | "completed" | "error";
    message: string;
    recordsProcessed?: number;
  };
  skyscanner: {
    status: "idle" | "phase1" | "phase2" | "completed" | "error";
    message: string;
    recordsProcessed?: number;
  };
}

export interface SearchError {
  message: string;
  details?: string;
  source?: "kiwi" | "skyscanner" | "general";
}

export interface UseFlightSearchReturn {
  // State
  searchState: SearchState;
  isSearching: boolean;
  progress: ScrapingProgress;
  error: SearchError | null;
  results: any[] | null; // TODO: Replace with proper bundle type

  // Actions
  performSearch: (params: FlightSearchParams) => Promise<void>;
  resetSearch: () => void;
  retrySearch: () => Promise<void>;
}

export function useFlightSearch(): UseFlightSearchReturn {
  // State management
  const [searchState, setSearchState] = useState<SearchState>("idle");
  const [progress, setProgress] = useState<ScrapingProgress>({
    kiwi: { status: "idle", message: "" },
    skyscanner: { status: "idle", message: "" },
  });
  const [error, setError] = useState<SearchError | null>(null);
  const [results, setResults] = useState<any[] | null>(null);

  // Store last search params for retry functionality
  const lastSearchParams = useRef<FlightSearchParams | null>(null);

  // Convex actions
  const scrapeKiwi = useAction(api.scrapingActions.scrapeKiwi);
  const scrapeSkyscanner = useAction(api.scrapingActions.scrapeSkyscanner);

  // Convex client for direct query
  const convex = new ConvexClient(import.meta.env.VITE_CONVEX_URL as string);

  // Reset function
  const resetSearch = useCallback(() => {
    setSearchState("idle");
    setProgress({
      kiwi: { status: "idle", message: "" },
      skyscanner: { status: "idle", message: "" },
    });
    setError(null);
    setResults(null);
    lastSearchParams.current = null;
  }, []);

  // Main search function
  const performSearch = useCallback(
    async (params: FlightSearchParams) => {
      // Store params for retry functionality
      lastSearchParams.current = params;

      // Reset state and start search
      setSearchState("loading");
      setError(null);
      setResults(null);
      setProgress({
        kiwi: { status: "phase1", message: "Starting Kiwi search..." },
        skyscanner: {
          status: "phase1",
          message: "Starting Skyscanner search...",
        },
      });

      try {
        // Prepare parameters for Convex actions
        const kiwiParams = {
          departureAirport: params.departureAirport.toUpperCase(),
          arrivalAirport: params.arrivalAirport.toUpperCase(),
          departureDate: params.departureDate.toISOString(),
          returnDate: params.returnDate?.toISOString(),
          isRoundTrip: params.isRoundTrip,
        };

        const skyscannerParams = {
          departureAirport: params.departureAirport.toUpperCase(),
          arrivalAirport: params.arrivalAirport.toUpperCase(),
          departureDate: params.departureDate.toISOString(),
          returnDate: params.returnDate?.toISOString(),
          isRoundTrip: params.isRoundTrip,
        };

        // Start both scraping operations in parallel
        const [kiwiResult, skyscannerResult] = await Promise.allSettled([
          scrapeKiwi(kiwiParams),
          scrapeSkyscanner(skyscannerParams),
        ]);

        // Update progress based on results
        const newProgress: ScrapingProgress = { ...progress };

        if (kiwiResult.status === "fulfilled") {
          const result = kiwiResult.value;
          if (result.success) {
            newProgress.kiwi = {
              status: "completed",
              message: result.message,
              recordsProcessed: result.recordsProcessed,
            };
          } else {
            newProgress.kiwi = {
              status: "error",
              message: result.message,
            };
          }
        } else {
          newProgress.kiwi = {
            status: "error",
            message: kiwiResult.reason?.message || "Kiwi search failed",
          };
        }

        if (skyscannerResult.status === "fulfilled") {
          const result = skyscannerResult.value;
          if (result.success) {
            newProgress.skyscanner = {
              status: "completed",
              message: result.message,
              recordsProcessed: result.recordsProcessed,
            };
          } else {
            newProgress.skyscanner = {
              status: "error",
              message: result.message,
            };
          }
        } else {
          newProgress.skyscanner = {
            status: "error",
            message:
              skyscannerResult.reason?.message || "Skyscanner search failed",
          };
        }

        setProgress(newProgress);

        // Determine overall search state
        const kiwiSuccess = newProgress.kiwi.status === "completed";
        const skyscannerSuccess = newProgress.skyscanner.status === "completed";

        if (kiwiSuccess || skyscannerSuccess) {
          // At least one source succeeded
          // Fetch and display results from the database
          const results = await convex.query(api.bundles.getBundlesForSearch, {
            departureIata: params.departureAirport.toUpperCase(),
            arrivalIata: params.arrivalAirport.toUpperCase(),
            outboundDate: params.departureDate.toISOString().split("T")[0],
            inboundDate: params.returnDate
              ? params.returnDate.toISOString().split("T")[0]
              : undefined,
            isRoundTrip: params.isRoundTrip,
          });

          console.log("Search results from database:", results);
          console.log("Number of bundles found:", results.length);

          // Debug booking options
          results.forEach((bundle, index) => {
            console.log(`Bundle ${index + 1}:`, {
              bundleId: bundle._id,
              uniqueId: bundle.uniqueId,
              outboundFlights: bundle.outboundFlights.length,
              inboundFlights: bundle.inboundFlights?.length || 0,
              bookingOptions: bundle.bookingOptions.length,
              bookingOptionPrices: bundle.bookingOptions.map((bo) => ({
                agency: bo.agency,
                price: bo.price,
                currency: bo.currency,
              })),
            });
          });

          if (results && results.length > 0) {
            setResults(results);
            setSearchState("success");
          } else {
            setSearchState("no-results");
            setResults([]);
          }
        } else {
          // Both sources failed
          setSearchState("error");
          setError({
            message: "Search failed",
            details:
              "Both Kiwi and Skyscanner searches failed. Please try again later.",
            source: "general",
          });
        }
      } catch (error) {
        setSearchState("error");
        setError({
          message: "Search failed",
          details:
            error instanceof Error ? error.message : "Unknown error occurred",
          source: "general",
        });
        setProgress({
          kiwi: { status: "error", message: "Search failed" },
          skyscanner: { status: "error", message: "Search failed" },
        });
      }
    },
    [scrapeKiwi, scrapeSkyscanner, progress]
  );

  // Retry function
  const retrySearch = useCallback(async () => {
    if (lastSearchParams.current) {
      await performSearch(lastSearchParams.current);
    }
  }, [performSearch]);

  // Computed values
  const isSearching = searchState === "loading";

  return {
    // State
    searchState,
    isSearching,
    progress,
    error,
    results,

    // Actions
    performSearch,
    resetSearch,
    retrySearch,
  };
}
