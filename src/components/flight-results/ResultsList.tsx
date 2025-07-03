import React, { useState, useMemo } from "react";
import { BundleCard, FlightInfo, BookingOption } from "./BundleCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils";

export interface BundleWithBookingOptions {
  _id: string;
  uniqueId: string;
  outboundFlights: FlightInfo[];
  inboundFlights?: FlightInfo[];
  bookingOptions: BookingOption[];
  minPrice: number;
}

export interface ResultsListProps {
  bundles: BundleWithBookingOptions[];
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

type SortOption = "price-asc" | "price-desc" | "departure-time" | "duration";

export const ResultsList: React.FC<ResultsListProps> = ({
  bundles,
  isLoading = false,
  error = null,
  className,
}) => {
  const [sortBy, setSortBy] = useState<SortOption>("price-asc");
  const [showCount, setShowCount] = useState(10);

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
      <div className={cn("space-y-4", className)}>
        <Card>
          <CardHeader>
            <CardTitle>Searching for flights...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-32 bg-muted rounded-lg"></div>
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
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                {bundles.length} flight bundle{bundles.length !== 1 ? "s" : ""}{" "}
                found
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Prices from {currency}{" "}
                {Math.min(...bundlesWithPrices.map((b) => b.minPrice)).toFixed(
                  2
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
                  variant={sortBy === "price-desc" ? "default" : "outline"}
                  onClick={() => setSortBy("price-desc")}
                  className="text-xs"
                >
                  Price ↓
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

      {/* Results List */}
      <div className="space-y-4">
        {sortedBundles.slice(0, showCount).map((bundle, index) => (
          <div key={bundle._id} className="relative">
            {/* Price rank badge for top 3 */}
            {index < 3 && (
              <Badge
                className={cn(
                  "absolute -top-2 -left-2 z-10",
                  index === 0 && "bg-yellow-500 text-gray-900",
                  index === 1 && "bg-gray-400 text-white",
                  index === 2 && "bg-amber-600 text-white"
                )}
              >
                #{index + 1}
              </Badge>
            )}

            <BundleCard
              bundle={bundle}
              bookingOptions={bundle.bookingOptions}
            />
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {showCount < sortedBundles.length && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            onClick={() =>
              setShowCount((prev) => Math.min(prev + 10, sortedBundles.length))
            }
          >
            Show {Math.min(10, sortedBundles.length - showCount)} More Results
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
                  {currency}{" "}
                  {Math.min(
                    ...bundlesWithPrices.map((b) => b.minPrice)
                  ).toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Lowest Price
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {currency}{" "}
                  {Math.max(
                    ...bundlesWithPrices.map((b) => b.minPrice)
                  ).toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Highest Price
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {currency}{" "}
                  {(
                    bundlesWithPrices.reduce((sum, b) => sum + b.minPrice, 0) /
                    bundlesWithPrices.length
                  ).toFixed(2)}
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
