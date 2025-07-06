import React, { useState, useCallback, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
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
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Store last search params for retry functionality
  const lastSearchParams = useRef<FlightSearchParams | null>(null);

  // Convex mutations and queries
  const startScrape = useMutation(api.scrapeSessions.startScraping);

  // Watch the current session for progress updates
  const sessionData = useQuery(
    api.scrapeSessions.getScrapeSession,
    currentSessionId ? { sessionId: currentSessionId as any } : "skip"
  );

  // Convex client for direct query
  const convex = new ConvexClient(import.meta.env.VITE_CONVEX_URL as string);

  // Update progress when session data changes
  React.useEffect(() => {
    if (sessionData) {
      const newProgress: ScrapingProgress = {
        kiwi: {
          status: sessionData.kiwiStatus,
          message: sessionData.kiwiMessage,
          recordsProcessed: sessionData.kiwiRecordsProcessed,
        },
        skyscanner: {
          status: sessionData.skyscannerStatus,
          message: sessionData.skyscannerMessage,
          recordsProcessed: sessionData.skyscannerRecordsProcessed,
        },
      };

      setProgress(newProgress);

      // Update overall search state based on session status
      if (
        sessionData.status === "completed" ||
        sessionData.status === "partial_success"
      ) {
        // Fetch results
        fetchResults();
      } else if (sessionData.status === "failed") {
        setSearchState("error");
        setError({
          message: "Search failed",
          details:
            "Both Kiwi and Skyscanner searches failed. Please try again later.",
          source: "general",
        });
      }
    }
  }, [sessionData]);

  const fetchResults = async () => {
    if (!lastSearchParams.current) return;

    const params = lastSearchParams.current;
    const results = await convex.query(api.bundles.getBundlesForSearch, {
      departureIata: params.departureAirport.toUpperCase(),
      arrivalIata: params.arrivalAirport.toUpperCase(),
      departureDate: params.departureDate.toISOString().split("T")[0],
      returnDate: params.returnDate
        ? params.returnDate.toISOString().split("T")[0]
        : undefined,
      isRoundTrip: params.isRoundTrip,
    });

    if (results && results.length > 0) {
      setResults(results);
      setSearchState("success");
    } else {
      setSearchState("no-results");
      setResults([]);
    }
  };

  // Reset function
  const resetSearch = useCallback(() => {
    setSearchState("idle");
    setProgress({
      kiwi: { status: "idle", message: "" },
      skyscanner: { status: "idle", message: "" },
    });
    setError(null);
    setResults(null);
    setCurrentSessionId(null);
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
        kiwi: { status: "idle", message: "Starting Kiwi search..." },
        skyscanner: {
          status: "idle",
          message: "Starting Skyscanner search...",
        },
      });

      try {
        // Create a new scrape session
        const sessionId = await startScrape({
          departureAirport: params.departureAirport.toUpperCase(),
          arrivalAirport: params.arrivalAirport.toUpperCase(),
          departureDate: params.departureDate.toISOString(),
          returnDate: params.returnDate?.toISOString(),
          isRoundTrip: params.isRoundTrip,
        });

        // Set the current session ID to start monitoring
        setCurrentSessionId(sessionId);
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
    [startScrape]
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
