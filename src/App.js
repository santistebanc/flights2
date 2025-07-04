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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = App;
var FlightSearchForm_1 = require("./components/flight-search/FlightSearchForm");
var SearchContext_1 = require("./SearchContext");
var useLocalStorage_1 = require("./useLocalStorage");
var useFlightSearch_1 = require("./hooks/useFlightSearch");
var ResultsList_1 = require("./components/flight-results/ResultsList");
var ScrapingProgress_1 = require("./components/progress/ScrapingProgress");
// Default sources configuration
var defaultSources = [
    {
        id: "kiwi",
        enabled: true,
        name: "Kiwi",
    },
    {
        id: "sky",
        enabled: true,
        name: "Sky",
    },
];
function App() {
    var _this = this;
    var _a = (0, useLocalStorage_1.useLocalStorage)("flight-search-filters", {
        from: "BER",
        to: "MAD",
        outboundDate: "2025-07-03",
        inboundDate: "",
        isRoundTrip: false,
        sources: defaultSources,
    }), searchParams = _a[0], setSearchParams = _a[1];
    // Flight search hook for managing search lifecycle
    var _b = (0, useFlightSearch_1.useFlightSearch)(), searchState = _b.searchState, isSearching = _b.isSearching, progress = _b.progress, error = _b.error, results = _b.results, performSearch = _b.performSearch, resetSearch = _b.resetSearch, retrySearch = _b.retrySearch;
    // Ensure sources is always an array (fallback for old localStorage data)
    var safeSearchParams = __assign(__assign({}, searchParams), { sources: Array.isArray(searchParams.sources)
            ? searchParams.sources
            : defaultSources });
    var handleSearch = function (searchParams) { return __awaiter(_this, void 0, void 0, function () {
        var convertedParams;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    convertedParams = {
                        from: searchParams.departureAirport,
                        to: searchParams.arrivalAirport,
                        outboundDate: searchParams.departureDate.toISOString().split("T")[0],
                        inboundDate: searchParams.returnDate
                            ? searchParams.returnDate.toISOString().split("T")[0]
                            : "",
                        isRoundTrip: searchParams.isRoundTrip,
                        sources: safeSearchParams.sources,
                    };
                    setSearchParams(convertedParams);
                    // Trigger actual flight search using the hook
                    return [4 /*yield*/, performSearch(searchParams)];
                case 1:
                    // Trigger actual flight search using the hook
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    // Render content based on search state
    var renderMainContent = function () {
        switch (searchState) {
            case "idle":
                return (<div className="mt-8 text-center text-gray-400">
            <p>Enter your search criteria above to find flights</p>
          </div>);
            case "loading":
                return (<div className="mt-8">
            <ScrapingProgress_1.ScrapingProgress progress={progress}/>
          </div>);
            case "success":
                return (<div className="mt-8">
            <ResultsList_1.ResultsList bundles={results || []} isLoading={false}/>
          </div>);
            case "no-results":
                return (<div className="mt-8 text-center">
            <div className="bg-gray-800 rounded-lg p-8">
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                No flights found
              </h3>
              <p className="text-gray-400 mb-4">
                No flights match your search criteria. Try adjusting your dates
                or airports.
              </p>
              <button onClick={retrySearch} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Try Again
              </button>
            </div>
          </div>);
            case "error":
                return (<div className="mt-8 text-center">
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-8">
              <h3 className="text-lg font-medium text-red-300 mb-2">
                Search failed
              </h3>
              <p className="text-red-400 mb-4">
                {(error === null || error === void 0 ? void 0 : error.message) ||
                        "An error occurred while searching for flights."}
              </p>
              {(error === null || error === void 0 ? void 0 : error.details) && (<p className="text-sm text-red-500 mb-4">{error.details}</p>)}
              <div className="space-x-4">
                <button onClick={retrySearch} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                  Retry Search
                </button>
                <button onClick={resetSearch} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                  Start Over
                </button>
              </div>
            </div>
          </div>);
            default:
                return null;
        }
    };
    return (<SearchContext_1.SearchContext.Provider value={{ searchParams: safeSearchParams, setSearchParams: setSearchParams }}>
      <div className="h-screen flex flex-col bg-gray-900 overflow-hidden">
        {/* Sticky Search Form with Icon */}
        <div className="sticky top-0 z-10 bg-gray-800/95 backdrop-blur-sm border-b border-gray-700 shadow-sm flex-shrink-0">
          <FlightSearchForm_1.FlightSearchForm onSearch={handleSearch} isLoading={isSearching}/>
        </div>

        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-4xl mx-auto">{renderMainContent()}</div>
        </main>
      </div>
    </SearchContext_1.SearchContext.Provider>);
}
