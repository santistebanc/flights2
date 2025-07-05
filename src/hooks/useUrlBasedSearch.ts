import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useSearch } from "@tanstack/react-router";
import { useMemo } from "react";

export function useUrlBasedSearch() {
  const search = useSearch({ from: "/" });

  // Only query if we have search parameters
  const hasSearchParams = !!(search.from || search.to || search.depart);

  const bundles = useQuery(
    api.bundles.getBundlesForSearch,
    hasSearchParams
      ? {
          departureIata: search.from || "",
          arrivalIata: search.to || "",
          departureDate: search.depart || "",
          returnDate: search.return,
          isRoundTrip: !!search.return,
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

  return {
    bundles: bundlesWithPrices,
    isLoading: hasSearchParams && bundles === undefined,
    hasSearchParams,
    searchParams: search as {
      from?: string;
      to?: string;
      depart?: string;
      return?: string;
      sources?: string;
    },
  };
}
