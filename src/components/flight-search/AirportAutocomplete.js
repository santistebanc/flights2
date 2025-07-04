"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AirportAutocomplete = AirportAutocomplete;
var React = require("react");
var react_1 = require("convex/react");
var api_1 = require("../../../convex/_generated/api");
var utils_1 = require("@/utils");
var lucide_react_1 = require("lucide-react");
var useAirportHistory_1 = require("@/hooks/useAirportHistory");
var input_1 = require("@/components/ui/input");
function AirportAutocomplete(_a) {
    var value = _a.value, onChange = _a.onChange, onAirportSelect = _a.onAirportSelect, onAirportExists = _a.onAirportExists, _b = _a.placeholder, placeholder = _b === void 0 ? "Search airports..." : _b, label = _a.label, className = _a.className, _c = _a.required, required = _c === void 0 ? false : _c, error = _a.error, _d = _a.disabled, disabled = _d === void 0 ? false : _d, otherAirportValue = _a.otherAirportValue;
    var _e = React.useState(false), open = _e[0], setOpen = _e[1];
    var _f = React.useState(""), searchValue = _f[0], setSearchValue = _f[1];
    var inputRef = React.useRef(null);
    var _g = React.useState(-1), highlightedIndex = _g[0], setHighlightedIndex = _g[1];
    // Airport history hook
    var _h = (0, useAirportHistory_1.useAirportHistory)(), history = _h.history, addToHistory = _h.addToHistory;
    // Fetch airports from Convex
    var airports = (0, react_1.useQuery)(api_1.api.airports.searchAirports, searchValue.length > 0 ? { searchTerm: searchValue, limit: 8 } : "skip");
    // Check if current value is a valid IATA code
    var isValidIataCode = function (code) {
        return /^[A-Z]{3}$/.test(code.toUpperCase());
    };
    // Check if the current value exists as an airport
    var currentAirport = (0, react_1.useQuery)(api_1.api.airports.getAirportByIata, value.length === 3 && isValidIataCode(value)
        ? { iataCode: value.toUpperCase() }
        : "skip");
    // Check if airports are the same (duplicate)
    var isDuplicateAirport = otherAirportValue && value.length > 0 && value === otherAirportValue;
    // Determine if the input is valid
    var isInputValid = value.length === 0 ||
        (isValidIataCode(value) && currentAirport !== null && !isDuplicateAirport);
    // Get combined results (history + search results)
    var getCombinedResults = React.useCallback(function () {
        var results = [];
        // Add history items if search term is empty or matches
        if (searchValue.length === 0) {
            // Show history items when input is empty or focused
            history.forEach(function (historyItem) {
                results.push({
                    _id: "history-".concat(historyItem.iataCode),
                    iataCode: historyItem.iataCode,
                    name: historyItem.name,
                    city: historyItem.city,
                    country: historyItem.country,
                    matchType: "iata",
                    isHistory: true,
                });
            });
        }
        else {
            // Filter history items that match search term
            var matchingHistory = history.filter(function (historyItem) {
                return historyItem.iataCode
                    .toLowerCase()
                    .includes(searchValue.toLowerCase()) ||
                    historyItem.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                    historyItem.city.toLowerCase().includes(searchValue.toLowerCase());
            });
            matchingHistory.forEach(function (historyItem) {
                results.push({
                    _id: "history-".concat(historyItem.iataCode),
                    iataCode: historyItem.iataCode,
                    name: historyItem.name,
                    city: historyItem.city,
                    country: historyItem.country,
                    matchType: "iata",
                    isHistory: true,
                });
            });
        }
        // Add search results (excluding duplicates from history)
        if (airports) {
            airports.forEach(function (airport) {
                var isDuplicate = results.some(function (result) { return result.iataCode === airport.iataCode; });
                if (!isDuplicate) {
                    results.push(airport);
                }
            });
        }
        return results;
    }, [searchValue, history, airports]);
    // Handle airport selection
    var handleAirportSelect = React.useCallback(function (airport) {
        onChange(airport.iataCode);
        onAirportSelect === null || onAirportSelect === void 0 ? void 0 : onAirportSelect(airport);
        setOpen(false);
        // Add to history
        addToHistory({
            iataCode: airport.iataCode,
            name: airport.name,
            city: airport.city,
            country: airport.country,
        });
    }, [onChange, onAirportSelect, addToHistory]);
    // Get display value
    var getDisplayValue = function () {
        if (value.length === 0)
            return "";
        if (currentAirport) {
            return "".concat(currentAirport.iataCode, " - ").concat(currentAirport.name);
        }
        return value;
    };
    // Handle input change
    var handleInputChange = function (e) {
        var newValue = e.target.value.toUpperCase();
        setSearchValue(newValue);
        onChange(newValue);
        setOpen(true);
        setHighlightedIndex(-1);
    };
    // Handle input focus
    var handleInputFocus = function () {
        setOpen(true);
    };
    // Handle input blur
    var handleInputBlur = function (e) {
        // Auto-select top result if available and input is not empty
        if (searchValue.length > 0 &&
            combinedResults.length > 0 &&
            !currentAirport) {
            var topResult = combinedResults[0];
            // Only auto-select if the search value matches the IATA code or name
            if (topResult.iataCode === searchValue ||
                topResult.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                topResult.city.toLowerCase().includes(searchValue.toLowerCase())) {
                handleAirportSelect(topResult);
            }
        }
        // Delay closing to allow click selection
        setTimeout(function () { return setOpen(false); }, 100);
    };
    // Handle keyboard navigation
    var handleInputKeyDown = function (e) {
        var results = getCombinedResults();
        if (!open && ["ArrowDown", "ArrowUp"].includes(e.key)) {
            setOpen(true);
            return;
        }
        if (!results.length)
            return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightedIndex(function (prev) { return (prev < results.length - 1 ? prev + 1 : 0); });
        }
        else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightedIndex(function (prev) { return (prev > 0 ? prev - 1 : results.length - 1); });
        }
        else if (e.key === "Enter" && highlightedIndex >= 0) {
            e.preventDefault();
            handleAirportSelect(results[highlightedIndex]);
        }
        else if (e.key === "Escape") {
            setOpen(false);
        }
    };
    // Keep input value in sync with prop value
    React.useEffect(function () {
        setSearchValue(value);
    }, [value]);
    // Scroll highlighted item into view
    var listRef = React.useRef(null);
    React.useEffect(function () {
        if (open && highlightedIndex >= 0 && listRef.current) {
            var el = listRef.current.children[highlightedIndex];
            if (el)
                el.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
    }, [highlightedIndex, open]);
    // Notify parent component about airport existence
    React.useEffect(function () {
        if (value.length === 3 && isValidIataCode(value)) {
            onAirportExists === null || onAirportExists === void 0 ? void 0 : onAirportExists(currentAirport !== null);
        }
        else if (value.length === 0) {
            onAirportExists === null || onAirportExists === void 0 ? void 0 : onAirportExists(null);
        }
    }, [currentAirport, value, onAirportExists]);
    var combinedResults = getCombinedResults();
    return (<div className={(0, utils_1.cn)("space-y-2", className)}>
      {label && (<label className="text-sm font-medium text-gray-200">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>)}
      <div className="relative">
        <input_1.Input ref={inputRef} type="text" value={searchValue} onChange={handleInputChange} onFocus={handleInputFocus} onBlur={handleInputBlur} onKeyDown={handleInputKeyDown} placeholder={placeholder} className={(0, utils_1.cn)("h-9", (error || (!isInputValid && value.length > 0)) &&
            "border-red-400 focus:border-red-400", disabled && "opacity-50 cursor-not-allowed")} disabled={disabled} autoComplete="off" spellCheck={false}/>
        {open && (<div ref={listRef} className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
            {combinedResults.length > 0 ? (combinedResults.map(function (airport, idx) { return (<div key={airport._id} className={(0, utils_1.cn)("px-3 py-2 cursor-pointer hover:bg-gray-700 transition-colors flex flex-col items-start", idx === highlightedIndex && "bg-gray-700", airport.isHistory && "border-l-2 border-l-blue-400")} onMouseDown={function () { return handleAirportSelect(airport); }} onMouseEnter={function () { return setHighlightedIndex(idx); }}>
                  <div className="flex items-center gap-2 w-full">
                    <lucide_react_1.Check className={(0, utils_1.cn)("mr-2 h-4 w-4", value === airport.iataCode ? "opacity-100" : "opacity-0")}/>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{airport.iataCode}</span>
                        {airport.isHistory && (<span className="text-xs text-blue-400 bg-blue-900 px-1 rounded">
                            Recent
                          </span>)}
                      </div>
                      <div className="text-sm text-gray-300">
                        {airport.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {airport.city}
                        {airport.country && ", ".concat(airport.country)}
                      </div>
                    </div>
                  </div>
                </div>); })) : (<div className="px-3 py-2 text-sm text-gray-400">
                No airports found.
              </div>)}
          </div>)}
        {/* Error message */}
        {error && <div className="text-xs text-red-400 mt-1">{error}</div>}
      </div>
    </div>);
}
