"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultsList = void 0;
var react_1 = require("react");
var BundleCard_1 = require("./BundleCard");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var utils_1 = require("@/utils");
var ResultsList = function (_a) {
    var _b, _c;
    var bundles = _a.bundles, _d = _a.isLoading, isLoading = _d === void 0 ? false : _d, _e = _a.error, error = _e === void 0 ? null : _e, className = _a.className;
    var _f = (0, react_1.useState)("price-asc"), sortBy = _f[0], setSortBy = _f[1];
    var _g = (0, react_1.useState)(10), showCount = _g[0], setShowCount = _g[1];
    // Calculate minimum price for each bundle
    var bundlesWithPrices = (0, react_1.useMemo)(function () {
        return bundles.map(function (bundle) { return (__assign(__assign({}, bundle), { minPrice: Math.min.apply(Math, bundle.bookingOptions.map(function (option) { return option.price; })) })); });
    }, [bundles]);
    // Sort bundles based on selected criteria
    var sortedBundles = (0, react_1.useMemo)(function () {
        var sorted = __spreadArray([], bundlesWithPrices, true);
        switch (sortBy) {
            case "price-asc":
                return sorted.sort(function (a, b) { return a.minPrice - b.minPrice; });
            case "price-desc":
                return sorted.sort(function (a, b) { return b.minPrice - a.minPrice; });
            case "departure-time":
                return sorted.sort(function (a, b) {
                    var _a, _b;
                    var aTime = ((_a = a.outboundFlights[0]) === null || _a === void 0 ? void 0 : _a.departureDateTime) || 0;
                    var bTime = ((_b = b.outboundFlights[0]) === null || _b === void 0 ? void 0 : _b.departureDateTime) || 0;
                    return aTime - bTime;
                });
            case "duration":
                return sorted.sort(function (a, b) {
                    var aDuration = a.outboundFlights.reduce(function (total, flight) {
                        return total + (flight.arrivalDateTime - flight.departureDateTime);
                    }, 0);
                    var bDuration = b.outboundFlights.reduce(function (total, flight) {
                        return total + (flight.arrivalDateTime - flight.departureDateTime);
                    }, 0);
                    return aDuration - bDuration;
                });
            default:
                return sorted;
        }
    }, [bundlesWithPrices, sortBy]);
    // Get currency from first bundle (assuming all bundles use same currency)
    var currency = ((_c = (_b = bundles[0]) === null || _b === void 0 ? void 0 : _b.bookingOptions[0]) === null || _c === void 0 ? void 0 : _c.currency) || "EUR";
    // Loading state
    if (isLoading) {
        return (<div className={(0, utils_1.cn)("space-y-4", className)}>
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Searching for flights...</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-4">
              {__spreadArray([], Array(3), true).map(function (_, i) { return (<div key={i} className="animate-pulse">
                  <div className="h-32 bg-muted rounded-lg"></div>
                </div>); })}
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>);
    }
    // Error state
    if (error) {
        return (<card_1.Card className={(0, utils_1.cn)("border-red-200", className)}>
        <card_1.CardHeader>
          <card_1.CardTitle className="text-red-600">Error Loading Results</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <p className="text-muted-foreground">{error}</p>
          <button_1.Button variant="outline" className="mt-4" onClick={function () { return window.location.reload(); }}>
            Try Again
          </button_1.Button>
        </card_1.CardContent>
      </card_1.Card>);
    }
    // No results state
    if (bundles.length === 0) {
        return (<card_1.Card className={className}>
        <card_1.CardHeader>
          <card_1.CardTitle>No flights found</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <p className="text-muted-foreground">
            No flights match your search criteria. Try adjusting your dates or
            airports.
          </p>
        </card_1.CardContent>
      </card_1.Card>);
    }
    return (<div className={(0, utils_1.cn)("space-y-4", className)}>
      {/* Results Header */}
      <card_1.Card>
        <card_1.CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <card_1.CardTitle className="text-lg">
                {bundles.length} flight bundle{bundles.length !== 1 ? "s" : ""}{" "}
                found
              </card_1.CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Prices from {currency}{" "}
                {Math.min.apply(Math, bundlesWithPrices.map(function (b) { return b.minPrice; })).toFixed(2)}
              </p>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <div className="flex gap-1">
                <button_1.Button size="sm" variant={sortBy === "price-asc" ? "default" : "outline"} onClick={function () { return setSortBy("price-asc"); }} className="text-xs">
                  Price ↑
                </button_1.Button>
                <button_1.Button size="sm" variant={sortBy === "price-desc" ? "default" : "outline"} onClick={function () { return setSortBy("price-desc"); }} className="text-xs">
                  Price ↓
                </button_1.Button>
                <button_1.Button size="sm" variant={sortBy === "departure-time" ? "default" : "outline"} onClick={function () { return setSortBy("departure-time"); }} className="text-xs">
                  Time
                </button_1.Button>
                <button_1.Button size="sm" variant={sortBy === "duration" ? "default" : "outline"} onClick={function () { return setSortBy("duration"); }} className="text-xs">
                  Duration
                </button_1.Button>
              </div>
            </div>
          </div>
        </card_1.CardHeader>
      </card_1.Card>

      {/* Results List */}
      <div className="space-y-4">
        {sortedBundles.slice(0, showCount).map(function (bundle, index) { return (<div key={bundle._id} className="relative">
            {/* Price rank badge for top 3 */}
            {index < 3 && (<badge_1.Badge className={(0, utils_1.cn)("absolute -top-2 -left-2 z-10", index === 0 && "bg-yellow-500 text-gray-900", index === 1 && "bg-gray-400 text-white", index === 2 && "bg-amber-600 text-white")}>
                #{index + 1}
              </badge_1.Badge>)}

            <BundleCard_1.BundleCard bundle={bundle} bookingOptions={bundle.bookingOptions}/>
          </div>); })}
      </div>

      {/* Load More Button */}
      {showCount < sortedBundles.length && (<div className="text-center pt-4">
          <button_1.Button variant="outline" onClick={function () {
                return setShowCount(function (prev) { return Math.min(prev + 10, sortedBundles.length); });
            }}>
            Show {Math.min(10, sortedBundles.length - showCount)} More Results
          </button_1.Button>
        </div>)}

      {/* Results Summary */}
      {sortedBundles.length > 0 && (<card_1.Card className="mt-6">
          <card_1.CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {currency}{" "}
                  {Math.min.apply(Math, bundlesWithPrices.map(function (b) { return b.minPrice; })).toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Lowest Price
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {currency}{" "}
                  {Math.max.apply(Math, bundlesWithPrices.map(function (b) { return b.minPrice; })).toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Highest Price
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {currency}{" "}
                  {(bundlesWithPrices.reduce(function (sum, b) { return sum + b.minPrice; }, 0) /
                bundlesWithPrices.length).toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Average Price
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {bundlesWithPrices.filter(function (b) { return b.inboundFlights && b.inboundFlights.length > 0; }).length}
                </div>
                <div className="text-xs text-muted-foreground">Round Trips</div>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>)}
    </div>);
};
exports.ResultsList = ResultsList;
