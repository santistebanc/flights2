import React, { useState, useMemo } from "react";
import { BookingOption } from "./BookingOptions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ExternalLink, ArrowRight, Clock } from "lucide-react";
import { cn, formatCurrency } from "@/utils";

export interface BundleWithBookingOptions {
  _id: string;
  uniqueId: string;
  outboundFlights: FlightInfo[];
  inboundFlights?: FlightInfo[];
  bookingOptions: BookingOption[];
  minPrice: number;
}

export interface FlightInfo {
  _id: string;
  flightNumber: string;
  departureAirport: {
    _id: string;
    iataCode: string;
    name: string;
    city: string;
  };
  arrivalAirport: {
    _id: string;
    iataCode: string;
    name: string;
    city: string;
  };
  departureDateTime: number;
  arrivalDateTime: number;
}

export interface ResultsListProps {
  bundles: BundleWithBookingOptions[];
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

type SortOption = "price-asc" | "price-desc" | "departure-time" | "duration";

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const BookingOptionsPopup: React.FC<{
  bookingOptions: BookingOption[];
  currency: string;
}> = ({ bookingOptions, currency }) => {
  const sortedOptions = [...bookingOptions].sort((a, b) => a.price - b.price);

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {sortedOptions.map((option, index) => (
        <div
          key={option._id}
          className="flex items-center justify-between p-3 rounded-lg border"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{option.agency}</span>
            </div>
            <div className="text-lg font-bold text-green-600">
              {formatCurrency(option.price, option.currency)}
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => window.open(option.linkToBook, "_blank")}
            className="flex items-center gap-1"
          >
            Book <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  );
};

const FlightRoute: React.FC<{
  outboundFlights: FlightInfo[];
  inboundFlights: FlightInfo[];
}> = ({ outboundFlights, inboundFlights }) => {
  const renderFlightLeg = (flights: FlightInfo[], isInbound = false) => {
    if (flights.length === 0) return null;

    return (
      <div className="flex items-center gap-1 text-sm">
        {flights.map((flight, index) => (
          <React.Fragment key={flight._id}>
            {index === 0 && (
              <div className="flex flex-col items-center">
                <span className="font-medium">
                  {flight.departureAirport.iataCode}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatTime(flight.departureDateTime)}
                </span>
              </div>
            )}
            <ArrowRight className="h-3 w-3 text-muted-foreground mx-1" />
            <div className="flex flex-col items-center">
              <span className="font-medium">
                {flight.arrivalAirport.iataCode}
              </span>
              <span className="text-xs text-muted-foreground">
                {index === flights.length - 1
                  ? formatTime(flight.arrivalDateTime)
                  : ""}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="flex items-center gap-4">
      {renderFlightLeg(outboundFlights)}
      {inboundFlights.length > 0 && (
        <>
          <div className="text-muted-foreground mx-2">•</div>
          {renderFlightLeg(inboundFlights, true)}
        </>
      )}
    </div>
  );
};

export const ResultsList: React.FC<ResultsListProps> = ({
  bundles,
  isLoading = false,
  error = null,
  className,
}) => {
  const [sortBy, setSortBy] = useState<SortOption>("price-asc");
  const [showCount, setShowCount] = useState(20);

  // Calculate minimum price for each bundle
  const bundlesWithPrices = useMemo(() => {
    return bundles.map((bundle) => ({
      ...bundle,
      minPrice: Math.min(
        ...bundle.bookingOptions.map((option) => option.price)
      ),
    }));
  }, [bundles]);

  // Sort bundles based on selected criteria
  const sortedBundles = useMemo(() => {
    const sorted = [...bundlesWithPrices];

    switch (sortBy) {
      case "price-asc":
        return sorted.sort((a, b) => a.minPrice - b.minPrice);
      case "price-desc":
        return sorted.sort((a, b) => b.minPrice - a.minPrice);
      case "departure-time":
        return sorted.sort((a, b) => {
          const aTime = a.outboundFlights[0]?.departureDateTime || 0;
          const bTime = b.outboundFlights[0]?.departureDateTime || 0;
          return aTime - bTime;
        });
      case "duration":
        return sorted.sort((a, b) => {
          const aDuration = a.outboundFlights.reduce((total, flight) => {
            return total + (flight.arrivalDateTime - flight.departureDateTime);
          }, 0);
          const bDuration = b.outboundFlights.reduce((total, flight) => {
            return total + (flight.arrivalDateTime - flight.departureDateTime);
          }, 0);
          return aDuration - bDuration;
        });
      default:
        return sorted;
    }
  }, [bundlesWithPrices, sortBy]);

  // Get currency from first bundle (assuming all bundles use same currency)
  const currency = bundles[0]?.bookingOptions[0]?.currency || "EUR";

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Searching for flights...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-12 bg-muted rounded-lg"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={cn("border-red-200", className)}>
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // No results state
  if (bundles.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>No flights found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No flights match your search criteria. Try adjusting your dates or
            airports.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Results Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                {bundles.length} flight{bundles.length !== 1 ? "s" : ""} found
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Prices from{" "}
                {formatCurrency(
                  Math.min(...bundlesWithPrices.map((b) => b.minPrice)),
                  currency
                )}
              </p>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant={sortBy === "price-asc" ? "default" : "outline"}
                  onClick={() => setSortBy("price-asc")}
                  className="text-xs"
                >
                  Price ↑
                </Button>
                <Button
                  size="sm"
                  variant={sortBy === "departure-time" ? "default" : "outline"}
                  onClick={() => setSortBy("departure-time")}
                  className="text-xs"
                >
                  Time
                </Button>
                <Button
                  size="sm"
                  variant={sortBy === "duration" ? "default" : "outline"}
                  onClick={() => setSortBy("duration")}
                  className="text-xs"
                >
                  Duration
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Compact Results List */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {sortedBundles.slice(0, showCount).map((bundle, index) => (
              <div
                key={bundle._id}
                className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
              >
                {/* Price - Clickable for booking options */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex-shrink-0 p-2 h-auto flex flex-col items-start hover:bg-green-900/20 hover:border-green-700 border border-transparent transition-colors"
                    >
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(bundle.minPrice, currency)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {bundle.bookingOptions.length} option
                        {bundle.bookingOptions.length !== 1 ? "s" : ""}
                      </div>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Booking Options</DialogTitle>
                    </DialogHeader>
                    <BookingOptionsPopup
                      bookingOptions={bundle.bookingOptions}
                      currency={currency}
                    />
                  </DialogContent>
                </Dialog>

                {/* Flight Route */}
                <div className="flex-1 min-w-0">
                  <FlightRoute
                    outboundFlights={bundle.outboundFlights}
                    inboundFlights={bundle.inboundFlights || []}
                  />
                </div>

                {/* Flight Date */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-sm font-medium">
                    {formatDate(bundle.outboundFlights[0]?.departureDateTime)}
                  </div>
                  {bundle.inboundFlights &&
                    bundle.inboundFlights.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Return{" "}
                        {formatDate(
                          bundle.inboundFlights[0]?.departureDateTime
                        )}
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Load More Button */}
      {showCount < sortedBundles.length && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() =>
              setShowCount((prev) => Math.min(prev + 20, sortedBundles.length))
            }
          >
            Show {Math.min(20, sortedBundles.length - showCount)} More Results
          </Button>
        </div>
      )}

      {/* Results Summary */}
      {sortedBundles.length > 0 && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(
                    Math.min(...bundlesWithPrices.map((b) => b.minPrice)),
                    currency
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Lowest Price
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    Math.max(...bundlesWithPrices.map((b) => b.minPrice)),
                    currency
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Highest Price
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    bundlesWithPrices.reduce((sum, b) => sum + b.minPrice, 0) /
                      bundlesWithPrices.length,
                    currency
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Average Price
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {
                    bundlesWithPrices.filter(
                      (b) => b.inboundFlights && b.inboundFlights.length > 0
                    ).length
                  }
                </div>
                <div className="text-xs text-muted-foreground">Round Trips</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
