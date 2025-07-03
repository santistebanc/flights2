import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

// Types for the bundle display
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
  departureDateTime: number; // Unix ms
  arrivalDateTime: number; // Unix ms
}

export interface BookingOption {
  _id: string;
  agency: string;
  price: number;
  currency: string;
  linkToBook: string;
}

export interface BundleCardProps {
  bundle: {
    _id: string;
    uniqueId: string;
    outboundFlights: FlightInfo[];
    inboundFlights?: FlightInfo[];
  };
  bookingOptions: BookingOption[];
  className?: string;
}

export const BundleCard: React.FC<BundleCardProps> = ({
  bundle,
  bookingOptions,
  className,
}) => {
  // Calculate the minimum price from all booking options
  const minPrice = Math.min(...bookingOptions.map((option) => option.price));
  const minPriceOption = bookingOptions.find(
    (option) => option.price === minPrice
  );

  // Format flight time
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Format flight date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate flight duration
  const calculateDuration = (departure: number, arrival: number) => {
    const durationMs = arrival - departure;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Render a single flight
  const renderFlight = (flight: FlightInfo, isReturn = false) => (
    <div key={flight._id} className="flex items-center justify-between py-2">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{flight.flightNumber}</span>
          {isReturn && (
            <Badge variant="outline" className="text-xs">
              Return
            </Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {flight.departureAirport.city} ({flight.departureAirport.iataCode}) →{" "}
          {flight.arrivalAirport.city} ({flight.arrivalAirport.iataCode})
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-medium">
          {formatTime(flight.departureDateTime)} -{" "}
          {formatTime(flight.arrivalDateTime)}
        </div>
        <div className="text-xs text-muted-foreground">
          {formatDate(flight.departureDateTime)} •{" "}
          {calculateDuration(flight.departureDateTime, flight.arrivalDateTime)}
        </div>
      </div>
    </div>
  );

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {bundle.outboundFlights[0]?.departureAirport.iataCode} →{" "}
            {bundle.outboundFlights[0]?.arrivalAirport.iataCode}
            {bundle.inboundFlights && bundle.inboundFlights.length > 0 && (
              <span className="text-muted-foreground"> • Round Trip</span>
            )}
          </CardTitle>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {minPriceOption?.currency} {minPrice.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              {bookingOptions.length} booking option
              {bookingOptions.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Outbound Flights */}
        <div>
          <h4 className="font-medium text-sm mb-2 text-muted-foreground">
            Outbound
          </h4>
          <div className="space-y-1">
            {bundle.outboundFlights.map((flight) => renderFlight(flight))}
          </div>
        </div>

        {/* Inbound Flights (if round trip) */}
        {bundle.inboundFlights && bundle.inboundFlights.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2 text-muted-foreground">
              Return
            </h4>
            <div className="space-y-1">
              {bundle.inboundFlights.map((flight) =>
                renderFlight(flight, true)
              )}
            </div>
          </div>
        )}

        {/* Booking Options */}
        <div>
          <h4 className="font-medium text-sm mb-2 text-muted-foreground">
            Booking Options
          </h4>
          <div className="space-y-2">
            {bookingOptions.slice(0, 3).map((option) => (
              <div
                key={option._id}
                className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
              >
                <span className="text-sm font-medium">{option.agency}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">
                    {option.currency} {option.price.toFixed(2)}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(option.linkToBook, "_blank")}
                    className="text-xs"
                  >
                    Book
                  </Button>
                </div>
              </div>
            ))}
            {bookingOptions.length > 3 && (
              <div className="text-xs text-muted-foreground text-center py-1">
                +{bookingOptions.length - 3} more options
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-4">
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-muted-foreground">
            Bundle ID: {bundle.uniqueId.slice(0, 8)}...
          </div>
          <Button
            onClick={() =>
              minPriceOption && window.open(minPriceOption.linkToBook, "_blank")
            }
            className="bg-green-600 hover:bg-green-700"
          >
            Book from {minPriceOption?.currency} {minPrice.toFixed(2)}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
