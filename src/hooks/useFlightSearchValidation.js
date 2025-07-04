"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFlightSearchValidation = useFlightSearchValidation;
var react_1 = require("react");
var react_2 = require("convex/react");
var api_1 = require("../../convex/_generated/api");
function useFlightSearchValidation(params) {
    var _a = (0, react_1.useState)({
        isValid: false,
        errors: {},
    }), validationState = _a[0], setValidationState = _a[1];
    // Check if IATA codes are valid format
    var isValidIataCode = function (code) {
        return /^[A-Z]{3}$/.test(code);
    };
    // Check if departure airport exists
    var departureAirport = (0, react_2.useQuery)(api_1.api.airports.getAirportByIata, params.from.length === 3 && isValidIataCode(params.from)
        ? { iataCode: params.from }
        : "skip");
    // Check if arrival airport exists
    var arrivalAirport = (0, react_2.useQuery)(api_1.api.airports.getAirportByIata, params.to.length === 3 && isValidIataCode(params.to)
        ? { iataCode: params.to }
        : "skip");
    // Memoize the validation params to prevent unnecessary re-renders
    var memoizedParams = (0, react_1.useMemo)(function () { return ({
        from: params.from,
        to: params.to,
        outboundDate: params.outboundDate,
        inboundDate: params.inboundDate,
        isRoundTrip: params.isRoundTrip,
    }); }, [
        params.from,
        params.to,
        params.outboundDate,
        params.inboundDate,
        params.isRoundTrip,
    ]);
    // Memoize the airport data to prevent unnecessary re-renders
    var departureAirportId = departureAirport === null || departureAirport === void 0 ? void 0 : departureAirport._id;
    var arrivalAirportId = arrivalAirport === null || arrivalAirport === void 0 ? void 0 : arrivalAirport._id;
    // Validate dates
    var validateDates = function () {
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var outboundDate = new Date(params.outboundDate);
        var inboundDate = params.inboundDate
            ? new Date(params.inboundDate)
            : null;
        var errors = {};
        // Check outbound date
        if (outboundDate < today) {
            errors.outboundDate = "Departure date cannot be in the past";
        }
        // Check inbound date for round trips
        if (params.isRoundTrip) {
            if (!params.inboundDate) {
                errors.inboundDate = "Return date is required for round trips";
            }
            else if (inboundDate && inboundDate < outboundDate) {
                errors.inboundDate = "Return date must be after departure date";
            }
        }
        return errors;
    };
    // Main validation effect
    (0, react_1.useEffect)(function () {
        var errors = {};
        // Validate departure airport
        if (params.from.length > 0) {
            if (!isValidIataCode(params.from)) {
                errors.from = "Invalid IATA code format";
            }
            else if (departureAirport === null) {
                errors.from = "Airport not found";
            }
        }
        // Validate arrival airport
        if (params.to.length > 0) {
            if (!isValidIataCode(params.to)) {
                errors.to = "Invalid IATA code format";
            }
            else if (arrivalAirport === null) {
                errors.to = "Airport not found";
            }
        }
        // Check for duplicate airports
        if (params.from && params.to && params.from === params.to) {
            errors.general = "Departure and arrival airports must be different";
        }
        // Validate dates
        var dateErrors = validateDates();
        Object.assign(errors, dateErrors);
        // Check required fields
        if (!params.from) {
            errors.from = "Departure airport is required";
        }
        if (!params.to) {
            errors.to = "Arrival airport is required";
        }
        if (!params.outboundDate) {
            errors.outboundDate = "Departure date is required";
        }
        // Determine overall validity
        var isValid = Object.keys(errors).length === 0;
        setValidationState({ isValid: isValid, errors: errors });
    }, [memoizedParams, departureAirportId, arrivalAirportId]);
    return validationState;
}
