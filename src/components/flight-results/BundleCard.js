"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BundleCard = void 0;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var utils_1 = require("@/utils");
var BundleCard = function (_a) {
    var _b, _c;
    var bundle = _a.bundle, bookingOptions = _a.bookingOptions, className = _a.className;
    // Calculate the minimum price from all booking options
    var minPrice = Math.min.apply(Math, bookingOptions.map(function (option) { return option.price; }));
    var minPriceOption = bookingOptions.find(function (option) { return option.price === minPrice; });
    // Format flight time
    var formatTime = function (timestamp) {
        return new Date(timestamp).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    };
    // Format flight date
    var formatDate = function (timestamp) {
        return new Date(timestamp).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        });
    };
    // Calculate flight duration
    var calculateDuration = function (departure, arrival) {
        var durationMs = arrival - departure;
        var hours = Math.floor(durationMs / (1000 * 60 * 60));
        var minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        return "".concat(hours, "h ").concat(minutes, "m");
    };
    // Render a single flight
    var renderFlight = function (flight, isReturn) {
        if (isReturn === void 0) { isReturn = false; }
        return (<div key={flight._id} className="flex items-center justify-between py-2">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{flight.flightNumber}</span>
          {isReturn && (<badge_1.Badge variant="outline" className="text-xs">
              Return
            </badge_1.Badge>)}
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
    </div>);
    };
    return (<card_1.Card className={(0, utils_1.cn)("hover:shadow-md transition-shadow", className)}>
      <card_1.CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <card_1.CardTitle className="text-lg">
            {(_b = bundle.outboundFlights[0]) === null || _b === void 0 ? void 0 : _b.departureAirport.iataCode} →{" "}
            {(_c = bundle.outboundFlights[0]) === null || _c === void 0 ? void 0 : _c.arrivalAirport.iataCode}
            {bundle.inboundFlights && bundle.inboundFlights.length > 0 && (<span className="text-muted-foreground"> • Round Trip</span>)}
          </card_1.CardTitle>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {minPriceOption === null || minPriceOption === void 0 ? void 0 : minPriceOption.currency} {minPrice.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              {bookingOptions.length} booking option
              {bookingOptions.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </card_1.CardHeader>

      <card_1.CardContent className="space-y-4">
        {/* Outbound Flights */}
        <div>
          <h4 className="font-medium text-sm mb-2 text-muted-foreground">
            Outbound
          </h4>
          <div className="space-y-1">
            {bundle.outboundFlights.map(function (flight) { return renderFlight(flight); })}
          </div>
        </div>

        {/* Inbound Flights (if round trip) */}
        {bundle.inboundFlights && bundle.inboundFlights.length > 0 && (<div>
            <h4 className="font-medium text-sm mb-2 text-muted-foreground">
              Return
            </h4>
            <div className="space-y-1">
              {bundle.inboundFlights.map(function (flight) {
                return renderFlight(flight, true);
            })}
            </div>
          </div>)}

        {/* Booking Options */}
        <div>
          <h4 className="font-medium text-sm mb-2 text-muted-foreground">
            Booking Options
          </h4>
          <div className="space-y-2">
            {bookingOptions.slice(0, 3).map(function (option) { return (<div key={option._id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                <span className="text-sm font-medium">{option.agency}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">
                    {option.currency} {option.price.toFixed(2)}
                  </span>
                  <button_1.Button size="sm" variant="outline" onClick={function () { return window.open(option.linkToBook, "_blank"); }} className="text-xs">
                    Book
                  </button_1.Button>
                </div>
              </div>); })}
            {bookingOptions.length > 3 && (<div className="text-xs text-muted-foreground text-center py-1">
                +{bookingOptions.length - 3} more options
              </div>)}
          </div>
        </div>
      </card_1.CardContent>

      <card_1.CardFooter className="pt-4">
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-muted-foreground">
            Bundle ID: {bundle.uniqueId.slice(0, 8)}...
          </div>
          <button_1.Button onClick={function () {
            return minPriceOption && window.open(minPriceOption.linkToBook, "_blank");
        }} className="bg-green-600 hover:bg-green-700">
            Book from {minPriceOption === null || minPriceOption === void 0 ? void 0 : minPriceOption.currency} {minPrice.toFixed(2)}
          </button_1.Button>
        </div>
      </card_1.CardFooter>
    </card_1.Card>);
};
exports.BundleCard = BundleCard;
