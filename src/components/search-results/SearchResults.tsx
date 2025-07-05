import { useUrlBasedSearch } from "@/hooks/useUrlBasedSearch";
import { ResultsList } from "../flight-results/ResultsList";
import { ArrowRight } from "lucide-react";

// Date formatting function to match the date picker
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate();
  const year = date.getFullYear();
  const month = date.toLocaleString("en-us", { month: "short" });
  return `${day} ${month} ${year}`;
};

export function SearchResults() {
  // URL-based search hook
  const { bundles, isLoading, hasSearchParams, searchParams } =
    useUrlBasedSearch();

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
        <ResultsList bundles={bundles} isLoading={isLoading} />
      </div>
    );
  }

  return null;
}
