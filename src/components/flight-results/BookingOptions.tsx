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
    // Use dark theme-friendly badge colors
    if (agencyLower.includes("kiwi") || agencyLower.includes("skyscanner")) {
      return {
        name: agency,
        color: "bg-blue-900 text-blue-200 border-blue-700",
      };
    }
    if (agencyLower.includes("booking") || agencyLower.includes("book")) {
      return {
        name: agency,
        color: "bg-green-900 text-green-200 border-green-700",
      };
    }
    if (agencyLower.includes("expedia") || agencyLower.includes("hotels")) {
      return {
        name: agency,
        color: "bg-purple-900 text-purple-200 border-purple-700",
      };
    }
    if (agencyLower.includes("trip") || agencyLower.includes("travel")) {
      return {
        name: agency,
        color: "bg-orange-900 text-orange-200 border-orange-700",
      };
    }
    // Default
    return { name: agency, color: "bg-muted text-foreground border-border" };
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
    <Card
      className={cn("bg-background border border-muted shadow-sm", className)}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            Booking Options
            <Badge
              variant="outline"
              className="text-xs border-muted text-muted-foreground"
            >
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
                    ? "bg-green-900 border-green-700"
                    : "bg-muted border-muted hover:bg-muted/80"
                )}
              >
                <div className="flex items-center gap-3 flex-1">
                  {/* Agency badge */}
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-medium border",
                      agencyInfo.color
                    )}
                  >
                    {agencyInfo.name}
                  </Badge>
                  {/* Best price indicator */}
                  {isBestPrice && (
                    <Badge
                      variant="default"
                      className="text-xs bg-green-700 text-green-100 border-green-600"
                    >
                      <Star className="w-3 h-3 mr-1" />
                      Best Price
                    </Badge>
                  )}
                  {/* Position indicator for top options */}
                  {index < 3 && (
                    <Badge
                      variant="outline"
                      className="text-xs border-muted text-muted-foreground"
                    >
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
                        isBestPrice ? "text-green-300" : "text-foreground"
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
                      "flex items-center gap-1 border border-green-700",
                      isBestPrice
                        ? "bg-green-700 hover:bg-green-800 text-green-100"
                        : "bg-background hover:bg-muted text-foreground"
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
        <div className="pt-4 border-t border-muted text-xs text-muted-foreground">
          <p>
            Prices are updated in real-time. Click "Book Now" to proceed to the
            booking site.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
