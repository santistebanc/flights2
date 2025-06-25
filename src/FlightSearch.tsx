import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useSearchContext } from "./contexts/SearchContext";
import { Card, CardContent } from "./components/ui/card";
import { Timeline } from "./components/Timeline";

export function FlightSearch() {
  const { searchParams } = useSearchContext();

  const offers = useQuery(api.offers.getOffers, { limit: 100 });

  // Show loading state while data is being fetched
  if (offers === undefined) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Loading offers...</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
            <p className="text-gray-400">Fetching flight offers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-white">
          {offers.length} result
          {offers.length !== 1 ? "s" : ""} found
        </h2>
      </div>

      {offers.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="text-center p-8">
              <div className="text-gray-400 text-4xl mb-4">✈️</div>
              <h3 className="text-lg font-medium text-white mb-2">
                No results found
              </h3>
              <p className="text-gray-400">Try adjusting your search criteria</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex-1">
          <Timeline offers={offers} />
        </div>
      )}
    </div>
  );
}
