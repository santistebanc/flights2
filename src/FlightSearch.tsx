import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useSearchContext } from "./contexts/SearchContext";
import { Card, CardContent } from "./components/ui/card";
import { Timeline } from "./components/Timeline";

export function FlightSearch() {
  const { searchParams } = useSearchContext();

  const offers = useQuery(api.offers.getOffers) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">
          {offers.length} result
          {offers.length !== 1 ? "s" : ""} found
        </h2>
      </div>

      {offers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">✈️</div>
            <h3 className="text-lg font-medium text-white mb-2">
              No results found
            </h3>
            <p className="text-gray-400">Try adjusting your search criteria</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flexspace-y-3 overflow-x-auto">
          <Timeline offers={offers} />
        </div>
      )}
    </div>
  );
}
