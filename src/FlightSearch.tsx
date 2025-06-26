import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useSearchContext } from "./contexts/SearchContext";
import { Card, CardContent } from "./components/ui/card";
import { Timeline } from "./components/Timeline";
import { useMemo } from "react";
import { Temporal } from "@js-temporal/polyfill";

export function FlightSearch() {
  const { searchParams } = useSearchContext();

  // Fetch all offers, no filters except limit
  const offers = useQuery(api.offers.getOffers, { limit: 100 });

  const filteredOffers = useMemo(() => {
    if (!offers) return undefined;
    return offers.filter((offer) => {
      const flights = offer.flights;
      if (!flights.length) return false;
      const firstFlight = flights[0];
      const lastFlight = flights[flights.length - 1];
      // Filter by from (required)
      if (firstFlight.from.iata_code !== searchParams.from) return false;
      // Filter by to (required)
      if (lastFlight.to.iata_code !== searchParams.to) return false;
      // Filter by outboundDate (required)
      const depDate = Temporal.PlainDate.from(firstFlight.departure);
      const filterDate = Temporal.PlainDate.from(searchParams.outboundDate);
      if (Temporal.PlainDate.compare(depDate, filterDate) !== 0) return false;
      // Filter by inboundDate (optional)
      if (searchParams.inboundDate && searchParams.inboundDate !== "") {
        const arrDate = Temporal.PlainDate.from(lastFlight.arrival);
        const filterDate = Temporal.PlainDate.from(searchParams.inboundDate);
        if (Temporal.PlainDate.compare(arrDate, filterDate) !== 0) return false;
      }
      return true;
    });
  }, [offers, searchParams]);

  // Show loading state while data is being fetched
  if (filteredOffers === undefined) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">
            Loading offers...
          </h2>
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
          {filteredOffers.length} result
          {filteredOffers.length !== 1 ? "s" : ""} found
        </h2>
      </div>

      {filteredOffers.length === 0 ? (
        <div className="flex-1 flex items-center justify-center w-full h-full">
          <Card className="w-full h-full flex items-center justify-center bg-transparent border-none shadow-none">
            <CardContent className="text-center flex flex-col items-center justify-center w-full h-full p-8">
              <div className="text-gray-400 text-4xl mb-4">✈️</div>
              <h3 className="text-lg font-medium text-white mb-2">
                No results found
              </h3>
              <p className="text-gray-400">
                Try adjusting your search criteria
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex-1">
          <Timeline offers={filteredOffers} />
        </div>
      )}
    </div>
  );
}
