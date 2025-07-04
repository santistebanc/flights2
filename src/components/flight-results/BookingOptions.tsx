import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, ExternalLink, Star } from "lucide-react";
import { cn } from "@/utils";

export interface BookingOption {
  _id: string;
  agency: string;
  price: number;
  currency: string;
  linkToBook: string;
  extractedAt: number;
}

export interface BookingOptionsProps {
  bookingOptions: BookingOption[];
  className?: string;
  showAll?: boolean;
  maxVisible?: number;
}

export const BookingOptions: React.FC<BookingOptionsProps> = ({
  bookingOptions,
  className,
  showAll = false,
  maxVisible = 5,
}) => {
  const [expanded, setExpanded] = useState(showAll);

  // Sort booking options by price (lowest first)
  const sortedOptions = [...bookingOptions].sort((a, b) => a.price - b.price);

  // Get the options to display
  const visibleOptions = expanded
    ? sortedOptions
    : sortedOptions.slice(0, maxVisible);

  // Calculate price statistics
  const minPrice = Math.min(...bookingOptions.map((option) => option.price));
  const maxPrice = Math.max(...bookingOptions.map((option) => option.price));
  const avgPrice =
    bookingOptions.reduce((sum, option) => sum + option.price, 0) /
    bookingOptions.length;

  // Format price with currency
  const formatPrice = (price: number, currency: string) => {
    return `${currency} ${price.toFixed(2)}`;
  };

  // Format extraction time
  const formatExtractionTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) {
      return "Just now";
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    }
  };

  // Get agency display name and color
  const getAgencyInfo = (agency: string) => {
    const agencyLower = agency.toLowerCase();

    // Common agency mappings
    if (agencyLower.includes("kiwi") || agencyLower.includes("skyscanner")) {
      return { name: agency, color: "bg-blue-100 text-blue-800" };
    }
    if (agencyLower.includes("booking") || agencyLower.includes("book")) {
      return { name: agency, color: "bg-green-100 text-green-800" };
    }
    if (agencyLower.includes("expedia") || agencyLower.includes("hotels")) {
      return { name: agency, color: "bg-purple-100 text-purple-800" };
    }
    if (agencyLower.includes("trip") || agencyLower.includes("travel")) {
      return { name: agency, color: "bg-orange-100 text-orange-800" };
    }

    // Default
    return { name: agency, color: "bg-gray-100 text-gray-800" };
  };

  const handleBookNow = (linkToBook: string, agency: string) => {
    // Open booking link in new tab
    window.open(linkToBook, "_blank", "noopener,noreferrer");

    // Optional: Track booking clicks
    console.log(`Booking clicked for ${agency}: ${linkToBook}`);
  };

  if (bookingOptions.length === 0) {
    return (
      <Card className={cn("border-dashed", className)}>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No booking options available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            Booking Options
            <Badge variant="outline" className="text-xs">
              {bookingOptions.length} available
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              From {formatPrice(minPrice, bookingOptions[0]?.currency || "EUR")}
            </span>
            {bookingOptions.length > 1 && (
              <span>
                Avg{" "}
                {formatPrice(avgPrice, bookingOptions[0]?.currency || "EUR")}
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Price range indicator */}
        {bookingOptions.length > 1 && (
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
            <span>Price range:</span>
            <span>
              {formatPrice(minPrice, bookingOptions[0]?.currency || "EUR")} -{" "}
              {formatPrice(maxPrice, bookingOptions[0]?.currency || "EUR")}
            </span>
          </div>
        )}

        {/* Booking options list */}
        <div className="space-y-2">
          {visibleOptions.map((option, index) => {
            const agencyInfo = getAgencyInfo(option.agency);
            const isBestPrice = option.price === minPrice;

            return (
              <div
                key={option._id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border transition-colors",
                  isBestPrice
                    ? "bg-green-50 border-green-200"
                    : "bg-background border-border hover:bg-muted/50"
                )}
              >
                <div className="flex items-center gap-3 flex-1">
                  {/* Agency badge */}
                  <Badge
                    variant="outline"
                    className={cn("text-xs font-medium", agencyInfo.color)}
                  >
                    {agencyInfo.name}
                  </Badge>

                  {/* Best price indicator */}
                  {isBestPrice && (
                    <Badge variant="default" className="text-xs bg-green-600">
                      <Star className="w-3 h-3 mr-1" />
                      Best Price
                    </Badge>
                  )}

                  {/* Position indicator for top options */}
                  {index < 3 && (
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Price */}
                  <div className="text-right">
                    <div
                      className={cn(
                        "font-bold text-lg",
                        isBestPrice ? "text-green-700" : "text-foreground"
                      )}
                    >
                      {formatPrice(option.price, option.currency)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Updated {formatExtractionTime(option.extractedAt)}
                    </div>
                  </div>

                  {/* Book button */}
                  <Button
                    size="sm"
                    onClick={() =>
                      handleBookNow(option.linkToBook, option.agency)
                    }
                    className={cn(
                      "flex items-center gap-1",
                      isBestPrice ? "bg-green-600 hover:bg-green-700" : ""
                    )}
                  >
                    <ExternalLink className="w-3 h-3" />
                    Book Now
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Show more/less toggle */}
        {bookingOptions.length > maxVisible && (
          <div className="pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="w-full text-muted-foreground hover:text-foreground"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Show {bookingOptions.length - maxVisible} More Options
                </>
              )}
            </Button>
          </div>
        )}

        {/* Additional info */}
        <div className="pt-4 border-t text-xs text-muted-foreground">
          <p>
            Prices are updated in real-time. Click "Book Now" to proceed to the
            booking site.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
