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
exports.useFlightSearch = useFlightSearch;
var react_1 = require("react");
var react_2 = require("convex/react");
var api_1 = require("../../convex/_generated/api");
function useFlightSearch() {
    var _this = this;
    // State management
    var _a = (0, react_1.useState)("idle"), searchState = _a[0], setSearchState = _a[1];
    var _b = (0, react_1.useState)({
        kiwi: { status: "idle", message: "" },
        skyscanner: { status: "idle", message: "" },
    }), progress = _b[0], setProgress = _b[1];
    var _c = (0, react_1.useState)(null), error = _c[0], setError = _c[1];
    var _d = (0, react_1.useState)(null), results = _d[0], setResults = _d[1];
    // Store last search params for retry functionality
    var lastSearchParams = (0, react_1.useRef)(null);
    // Convex actions
    var scrapeKiwi = (0, react_2.useAction)(api_1.api.scrapingActions.scrapeKiwi);
    var scrapeSkyscanner = (0, react_2.useAction)(api_1.api.scrapingActions.scrapeSkyscanner);
    // Validation function
    var validateSearchParams = (0, react_1.useCallback)(function (params) {
        var errors = {};
        // Validate IATA codes
        var isValidIataCode = function (code) {
            return /^[A-Z]{3}$/.test(code.toUpperCase());
        };
        if (!params.departureAirport.trim()) {
            errors.departureAirport = "Departure airport is required";
        }
        else if (!isValidIataCode(params.departureAirport)) {
            errors.departureAirport =
                "Please enter a valid 3-letter airport code (e.g., JFK, LAX)";
        }
        if (!params.arrivalAirport.trim()) {
            errors.arrivalAirport = "Arrival airport is required";
        }
        else if (!isValidIataCode(params.arrivalAirport)) {
            errors.arrivalAirport =
                "Please enter a valid 3-letter airport code (e.g., JFK, LAX)";
        }
        // Check for duplicate airports
        if (params.departureAirport &&
            params.arrivalAirport &&
            params.departureAirport.toUpperCase() ===
                params.arrivalAirport.toUpperCase()) {
            errors.arrivalAirport =
                "Departure and arrival airports must be different";
        }
        // Validate dates
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        if (!params.departureDate) {
            errors.departureDate = "Departure date is required";
        }
        else if (params.departureDate < today) {
            errors.departureDate = "Departure date cannot be in the past";
        }
        if (params.isRoundTrip) {
            if (!params.returnDate) {
                errors.returnDate = "Return date is required for round trips";
            }
            else if (params.returnDate < today) {
                errors.returnDate = "Return date cannot be in the past";
            }
            else if (params.returnDate <= params.departureDate) {
                errors.returnDate = "Return date must be after departure date";
            }
        }
        // Check if dates are too far in the future (more than 1 year)
        var maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() + 1);
        if (params.departureDate > maxDate) {
            errors.departureDate =
                "Departure date cannot be more than 1 year in the future";
        }
        if (params.isRoundTrip &&
            params.returnDate &&
            params.returnDate > maxDate) {
            errors.returnDate =
                "Return date cannot be more than 1 year in the future";
        }
        return {
            isValid: Object.keys(errors).length === 0,
            errors: errors,
        };
    }, []);
    // Reset function
    var resetSearch = (0, react_1.useCallback)(function () {
        setSearchState("idle");
        setProgress({
            kiwi: { status: "idle", message: "" },
            skyscanner: { status: "idle", message: "" },
        });
        setError(null);
        setResults(null);
        lastSearchParams.current = null;
    }, []);
    // Main search function
    var performSearch = (0, react_1.useCallback)(function (params) { return __awaiter(_this, void 0, void 0, function () {
        var validation, kiwiParams, skyscannerParams, _a, kiwiResult, skyscannerResult, newProgress, result, result, kiwiSuccess, skyscannerSuccess, totalRecords, error_1;
        var _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    validation = validateSearchParams(params);
                    if (!validation.isValid) {
                        setError({
                            message: "Invalid search parameters",
                            details: Object.values(validation.errors).join(", "),
                            source: "general",
                        });
                        setSearchState("error");
                        return [2 /*return*/];
                    }
                    // Store params for retry functionality
                    lastSearchParams.current = params;
                    // Reset state and start search
                    setSearchState("loading");
                    setError(null);
                    setResults(null);
                    setProgress({
                        kiwi: { status: "phase1", message: "Starting Kiwi search..." },
                        skyscanner: {
                            status: "phase1",
                            message: "Starting Skyscanner search...",
                        },
                    });
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, 3, , 4]);
                    kiwiParams = {
                        departureAirport: params.departureAirport.toUpperCase(),
                        arrivalAirport: params.arrivalAirport.toUpperCase(),
                        departureDate: params.departureDate.toISOString(),
                        returnDate: (_b = params.returnDate) === null || _b === void 0 ? void 0 : _b.toISOString(),
                        isRoundTrip: params.isRoundTrip,
                    };
                    skyscannerParams = {
                        departureAirport: params.departureAirport.toUpperCase(),
                        arrivalAirport: params.arrivalAirport.toUpperCase(),
                        departureDate: params.departureDate.toISOString(),
                        returnDate: (_c = params.returnDate) === null || _c === void 0 ? void 0 : _c.toISOString(),
                        isRoundTrip: params.isRoundTrip,
                    };
                    return [4 /*yield*/, Promise.allSettled([
                            scrapeKiwi(kiwiParams),
                            scrapeSkyscanner(skyscannerParams),
                        ])];
                case 2:
                    _a = _f.sent(), kiwiResult = _a[0], skyscannerResult = _a[1];
                    newProgress = __assign({}, progress);
                    if (kiwiResult.status === "fulfilled") {
                        result = kiwiResult.value;
                        if (result.success) {
                            newProgress.kiwi = {
                                status: "completed",
                                message: result.message,
                                recordsProcessed: result.recordsProcessed,
                            };
                        }
                        else {
                            newProgress.kiwi = {
                                status: "error",
                                message: result.message,
                            };
                        }
                    }
                    else {
                        newProgress.kiwi = {
                            status: "error",
                            message: ((_d = kiwiResult.reason) === null || _d === void 0 ? void 0 : _d.message) || "Kiwi search failed",
                        };
                    }
                    if (skyscannerResult.status === "fulfilled") {
                        result = skyscannerResult.value;
                        if (result.success) {
                            newProgress.skyscanner = {
                                status: "completed",
                                message: result.message,
                                recordsProcessed: result.recordsProcessed,
                            };
                        }
                        else {
                            newProgress.skyscanner = {
                                status: "error",
                                message: result.message,
                            };
                        }
                    }
                    else {
                        newProgress.skyscanner = {
                            status: "error",
                            message: ((_e = skyscannerResult.reason) === null || _e === void 0 ? void 0 : _e.message) || "Skyscanner search failed",
                        };
                    }
                    setProgress(newProgress);
                    kiwiSuccess = newProgress.kiwi.status === "completed";
                    skyscannerSuccess = newProgress.skyscanner.status === "completed";
                    if (kiwiSuccess || skyscannerSuccess) {
                        totalRecords = (newProgress.kiwi.recordsProcessed || 0) +
                            (newProgress.skyscanner.recordsProcessed || 0);
                        if (totalRecords > 0) {
                            setSearchState("success");
                            // TODO: Replace with actual results from database
                            setResults([]); // Placeholder
                        }
                        else {
                            setSearchState("no-results");
                        }
                    }
                    else {
                        // Both sources failed
                        setSearchState("error");
                        setError({
                            message: "Search failed",
                            details: "Both Kiwi and Skyscanner searches failed. Please try again later.",
                            source: "general",
                        });
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _f.sent();
                    setSearchState("error");
                    setError({
                        message: "Search failed",
                        details: error_1 instanceof Error ? error_1.message : "Unknown error occurred",
                        source: "general",
                    });
                    setProgress({
                        kiwi: { status: "error", message: "Search failed" },
                        skyscanner: { status: "error", message: "Search failed" },
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [validateSearchParams, scrapeKiwi, scrapeSkyscanner, progress]);
    // Retry function
    var retrySearch = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!lastSearchParams.current) return [3 /*break*/, 2];
                    return [4 /*yield*/, performSearch(lastSearchParams.current)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); }, [performSearch]);
    // Computed values
    var isSearching = searchState === "loading";
    return {
        // State
        searchState: searchState,
        isSearching: isSearching,
        progress: progress,
        error: error,
        results: results,
        // Actions
        performSearch: performSearch,
        resetSearch: resetSearch,
        retrySearch: retrySearch,
        // Validation
        validateSearchParams: validateSearchParams,
    };
}
