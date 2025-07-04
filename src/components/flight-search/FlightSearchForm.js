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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlightSearchForm = FlightSearchForm;
var react_1 = require("react");
var date_range_picker_1 = require("../ui/date-range-picker");
var SearchButton_1 = require("./SearchButton");
var utils_1 = require("../../utils");
var useLocalStorage_1 = require("../../hooks/useLocalStorage");
var lucide_react_1 = require("lucide-react");
var AirportAutocomplete_1 = require("./AirportAutocomplete");
function FlightSearchForm(_a) {
    var onSearch = _a.onSearch, _b = _a.isLoading, isLoading = _b === void 0 ? false : _b, className = _a.className;
    // localStorage hook
    var _c = (0, useLocalStorage_1.useLocalStorage)(), isLoaded = _c.isLoaded, savePreferences = _c.savePreferences, getFormState = _c.getFormState;
    var _d = (0, react_1.useState)(false), loadedFromLocalStorage = _d[0], setLoadedFromLocalStorage = _d[1];
    // Form state
    var _e = (0, react_1.useState)(""), departureAirport = _e[0], setDepartureAirport = _e[1];
    var _f = (0, react_1.useState)(""), arrivalAirport = _f[0], setArrivalAirport = _f[1];
    var _g = (0, react_1.useState)({
        from: new Date(),
        to: undefined,
    }), dateRange = _g[0], setDateRange = _g[1];
    var _h = (0, react_1.useState)(false), isRoundTrip = _h[0], setIsRoundTrip = _h[1];
    // Validation state
    var _j = (0, react_1.useState)({}), errors = _j[0], setErrors = _j[1];
    // Track if airports exist in database
    var _k = (0, react_1.useState)(null), departureAirportExists = _k[0], setDepartureAirportExists = _k[1];
    var _l = (0, react_1.useState)(null), arrivalAirportExists = _l[0], setArrivalAirportExists = _l[1];
    // Load saved preferences when component mounts
    (0, react_1.useEffect)(function () {
        if (isLoaded && !loadedFromLocalStorage) {
            var savedState = getFormState();
            if (savedState) {
                setDepartureAirport(savedState.departureAirport);
                setArrivalAirport(savedState.arrivalAirport);
                setDateRange({
                    from: savedState.departureDate,
                    to: savedState.returnDate,
                });
                setIsRoundTrip(savedState.isRoundTrip);
                setLoadedFromLocalStorage(true);
            }
        }
    }, [isLoaded, getFormState]);
    // Validation functions
    var validateIataCode = function (code) {
        return /^[A-Z]{3}$/.test(code.toUpperCase());
    };
    var validateDate = function (date) {
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
    };
    var validateDateRange = function (from, isRoundTrip, to) {
        if (!from) {
            return "Departure date is required";
        }
        if (!validateDate(from)) {
            return "Departure date cannot be in the past";
        }
        if (isRoundTrip) {
            if (!to) {
                return "Return date is required for round trips";
            }
            if (!validateDate(to)) {
                return "Return date cannot be in the past";
            }
            if (from >= to) {
                return "Return date must be after departure date";
            }
            // Check if return date is too far in the future (e.g., more than 1 year)
            var maxDate_1 = new Date();
            maxDate_1.setFullYear(maxDate_1.getFullYear() + 1);
            if (to > maxDate_1) {
                return "Return date cannot be more than 1 year in the future";
            }
        }
        // Check if departure date is too far in the future (e.g., more than 1 year)
        var maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() + 1);
        if (from > maxDate) {
            return "Departure date cannot be more than 1 year in the future";
        }
        return undefined;
    };
    var validateForm = function () {
        var newErrors = {};
        // Validate departure airport
        if (!departureAirport.trim()) {
            newErrors.departureAirport = "Departure airport is required";
        }
        else if (!validateIataCode(departureAirport)) {
            newErrors.departureAirport =
                "Please enter a valid 3-letter airport code (e.g., JFK, LAX)";
        }
        // Validate arrival airport
        if (!arrivalAirport.trim()) {
            newErrors.arrivalAirport = "Arrival airport is required";
        }
        else if (!validateIataCode(arrivalAirport)) {
            newErrors.arrivalAirport =
                "Please enter a valid 3-letter airport code (e.g., JFK, LAX)";
        }
        // Check for duplicate airports
        if (departureAirport &&
            arrivalAirport &&
            departureAirport === arrivalAirport) {
            newErrors.arrivalAirport =
                "Departure and arrival airports must be different";
        }
        // Validate dates
        var dateError = validateDateRange(dateRange.from, isRoundTrip, dateRange.to);
        if (dateError) {
            newErrors.dates = dateError;
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    // Real-time validation for individual fields
    var validateField = function (field) {
        // If both airports are filled and the same, show duplicate error for both
        if (departureAirport.trim() &&
            arrivalAirport.trim() &&
            departureAirport === arrivalAirport) {
            return "Departure and arrival airports must be different";
        }
        switch (field) {
            case "departureAirport":
                if (!departureAirport.trim()) {
                    return "Departure airport is required";
                }
                if (!validateIataCode(departureAirport)) {
                    return "Please enter a valid 3-letter airport code (e.g., JFK, LAX)";
                }
                if (departureAirportExists === false) {
                    return "Airport not found in our database";
                }
                return undefined;
            case "arrivalAirport":
                if (!arrivalAirport.trim()) {
                    return "Arrival airport is required";
                }
                if (!validateIataCode(arrivalAirport)) {
                    return "Please enter a valid 3-letter airport code (e.g., JFK, LAX)";
                }
                if (arrivalAirportExists === false) {
                    return "Airport not found in our database";
                }
                return undefined;
            case "dates":
                return validateDateRange(dateRange.from, isRoundTrip, dateRange.to);
            default:
                return undefined;
        }
    };
    // Handle form submission
    var handleSubmit = function (e) {
        e.preventDefault();
        if (validateForm()) {
            var searchParams = {
                departureAirport: departureAirport,
                arrivalAirport: arrivalAirport,
                departureDate: dateRange.from,
                returnDate: isRoundTrip ? dateRange.to : undefined,
                isRoundTrip: isRoundTrip,
            };
            // Save preferences to localStorage
            savePreferences({
                departureAirport: departureAirport,
                arrivalAirport: arrivalAirport,
                departureDate: dateRange.from.toISOString(),
                returnDate: isRoundTrip && dateRange.to ? dateRange.to.toISOString() : undefined,
                isRoundTrip: isRoundTrip,
            });
            onSearch(searchParams);
        }
    };
    // Handle date range updates
    var handleDateRangeUpdate = function (values) {
        setDateRange(values.range);
        setIsRoundTrip(values.isRoundTrip);
        // Real-time validation for dates
        var error = validateDateRange(values.range.from, values.isRoundTrip, values.range.to);
        setErrors(function (prev) { return (__assign(__assign({}, prev), { dates: error })); });
    };
    // Clear errors when inputs change
    var handleDepartureAirportChange = function (value) {
        // Convert to uppercase for consistency
        var upperValue = value.toUpperCase();
        setDepartureAirport(upperValue);
        // Reset existence check when value changes
        setDepartureAirportExists(null);
        // Real-time validation
        var error = validateField("departureAirport");
        setErrors(function (prev) { return (__assign(__assign({}, prev), { departureAirport: error, 
            // Clear arrival airport error if it was due to duplicate airports
            arrivalAirport: prev.arrivalAirport ===
                "Departure and arrival airports must be different"
                ? undefined
                : prev.arrivalAirport })); });
    };
    var handleArrivalAirportChange = function (value) {
        // Convert to uppercase for consistency
        var upperValue = value.toUpperCase();
        setArrivalAirport(upperValue);
        // Reset existence check when value changes
        setArrivalAirportExists(null);
        // Real-time validation
        var error = validateField("arrivalAirport");
        setErrors(function (prev) { return (__assign(__assign({}, prev), { arrivalAirport: error, 
            // Clear departure airport error if it was due to duplicate airports
            departureAirport: prev.departureAirport ===
                "Departure and arrival airports must be different"
                ? undefined
                : prev.departureAirport })); });
    };
    // Handle airport existence updates
    var handleDepartureAirportExists = function (exists) {
        setDepartureAirportExists(exists);
        // Re-validate if we now know the airport doesn't exist
        if (exists === false && departureAirport) {
            var error_1 = validateField("departureAirport");
            setErrors(function (prev) { return (__assign(__assign({}, prev), { departureAirport: error_1 })); });
        }
    };
    var handleArrivalAirportExists = function (exists) {
        setArrivalAirportExists(exists);
        // Re-validate if we now know the airport doesn't exist
        if (exists === false && arrivalAirport) {
            var error_2 = validateField("arrivalAirport");
            setErrors(function (prev) { return (__assign(__assign({}, prev), { arrivalAirport: error_2 })); });
        }
    };
    // Check if form is valid for enabling search button
    var isFormValid = departureAirport &&
        arrivalAirport &&
        validateIataCode(departureAirport) &&
        validateIataCode(arrivalAirport) &&
        departureAirport !== arrivalAirport &&
        dateRange.from &&
        (!isRoundTrip ||
            (isRoundTrip && dateRange.to && dateRange.from < dateRange.to));
    return (<form onSubmit={handleSubmit} className={(0, utils_1.cn)("p-3 bg-gray-800/95 backdrop-blur-sm border-b border-gray-700", className)}>
      <div className="flex flex-col md:flex-row gap-3 items-center max-w-6xl mx-auto">
        {/* FlightFinder Icon */}
        <div className="flex-shrink-0">
          <lucide_react_1.PlaneTakeoff className="h-8 w-8 text-yellow-400"/>
        </div>

        {/* Airport Inputs */}
        <div className="flex gap-3 flex-1">
          <div className="flex-1">
            <AirportAutocomplete_1.AirportAutocomplete value={departureAirport} onChange={handleDepartureAirportChange} placeholder="From" required otherAirportValue={arrivalAirport} className="w-full" onAirportExists={handleDepartureAirportExists}/>
          </div>

          <div className="flex-1">
            <AirportAutocomplete_1.AirportAutocomplete value={arrivalAirport} onChange={handleArrivalAirportChange} placeholder="To" required otherAirportValue={departureAirport} className="w-full" onAirportExists={handleArrivalAirportExists}/>
          </div>
        </div>

        {/* Date Range Picker */}
        <div className="flex-shrink-0">
          <date_range_picker_1.DateRangePicker dateFrom={dateRange.from} dateTo={dateRange.to} isRoundTrip={isRoundTrip} onUpdate={handleDateRangeUpdate}/>
        </div>

        {/* Search Button */}
        <div className="flex-shrink-0">
          <SearchButton_1.SearchButton isLoading={isLoading} disabled={!isFormValid} loadingText="Searching..." size="default">
            Search
          </SearchButton_1.SearchButton>
        </div>
      </div>
    </form>);
}
