"use strict";
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
exports.getAirportIdMapping = exports.processAndInsertScrapedData = void 0;
var server_1 = require("./_generated/server");
var values_1 = require("convex/values");
var api_1 = require("./_generated/api");
/**
 * Process scraped data and insert into database.
 * This is the main function that orchestrates the database insertion process.
 */
exports.processAndInsertScrapedData = (0, server_1.internalMutation)({
    args: {
        flights: values_1.v.array(values_1.v.object({
            uniqueId: values_1.v.string(),
            flightNumber: values_1.v.string(),
            departureAirportIataCode: values_1.v.string(),
            arrivalAirportIataCode: values_1.v.string(),
            departureDate: values_1.v.string(), // YYYY-MM-DD format
            departureTime: values_1.v.string(), // HH:MM format
            duration: values_1.v.number(), // duration in minutes
        })),
        bundles: values_1.v.array(values_1.v.object({
            uniqueId: values_1.v.string(),
            outboundFlightUniqueIds: values_1.v.array(values_1.v.string()),
            inboundFlightUniqueIds: values_1.v.array(values_1.v.string()),
        })),
        bookingOptions: values_1.v.array(values_1.v.object({
            uniqueId: values_1.v.string(),
            targetUniqueId: values_1.v.string(),
            agency: values_1.v.string(),
            price: values_1.v.number(),
            linkToBook: values_1.v.string(),
            currency: values_1.v.string(),
            extractedAt: values_1.v.number(),
        })),
    },
    returns: values_1.v.object({
        success: values_1.v.boolean(),
        message: values_1.v.string(),
        flightsInserted: values_1.v.number(),
        bundlesInserted: values_1.v.number(),
        bookingOptionsInserted: values_1.v.number(),
        bookingOptionsReplaced: values_1.v.number(),
    }),
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var airportIdMapping_1, flightsForDb, flightUniqueIdToDbId, bundleUniqueIdToDbId, bookingOptionsResult, error_1, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, ctx.runQuery(api_1.internal.data_processing.getAirportIdMapping, {
                            iataCodes: __spreadArray([], new Set(__spreadArray(__spreadArray([], args.flights.map(function (f) { return f.departureAirportIataCode; }), true), args.flights.map(function (f) { return f.arrivalAirportIataCode; }), true)), true),
                        })];
                case 1:
                    airportIdMapping_1 = _a.sent();
                    return [4 /*yield*/, Promise.all(args.flights
                            .filter(function (flight) {
                            return airportIdMapping_1[flight.departureAirportIataCode] &&
                                airportIdMapping_1[flight.arrivalAirportIataCode];
                        })
                            .map(function (flight) { return __awaiter(void 0, void 0, void 0, function () {
                            var departureAirport, timezoneOffset, timezoneMatch, departureDateTimeStr, departureDateTime, arrivalDateTime;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, ctx.db.get(airportIdMapping_1[flight.departureAirportIataCode])];
                                    case 1:
                                        departureAirport = _a.sent();
                                        timezoneOffset = 0;
                                        if (departureAirport === null || departureAirport === void 0 ? void 0 : departureAirport.timezone) {
                                            timezoneMatch = departureAirport.timezone.match(/UTC([+-]\d+)/);
                                            if (timezoneMatch) {
                                                timezoneOffset = parseInt(timezoneMatch[1]) * 60; // Convert hours to minutes
                                            }
                                        }
                                        departureDateTimeStr = "".concat(flight.departureDate, "T").concat(flight.departureTime, ":00");
                                        departureDateTime = new Date(departureDateTimeStr).getTime() -
                                            timezoneOffset * 60 * 1000;
                                        arrivalDateTime = departureDateTime + flight.duration * 60 * 1000;
                                        return [2 /*return*/, {
                                                uniqueId: flight.uniqueId,
                                                flightNumber: flight.flightNumber,
                                                departureAirportId: airportIdMapping_1[flight.departureAirportIataCode],
                                                arrivalAirportId: airportIdMapping_1[flight.arrivalAirportIataCode],
                                                departureDateTime: departureDateTime,
                                                arrivalDateTime: arrivalDateTime,
                                            }];
                                }
                            });
                        }); }))];
                case 2:
                    flightsForDb = _a.sent();
                    return [4 /*yield*/, ctx.runMutation(api_1.internal.flights.bulkInsertFlights, { flights: flightsForDb })];
                case 3:
                    flightUniqueIdToDbId = _a.sent();
                    return [4 /*yield*/, ctx.runMutation(api_1.internal.bundles.bulkInsertBundles, {
                            bundles: args.bundles,
                            flightUniqueIdToDbId: flightUniqueIdToDbId,
                        })];
                case 4:
                    bundleUniqueIdToDbId = _a.sent();
                    return [4 /*yield*/, ctx.runMutation(api_1.internal.bookingOptions.bulkInsertBookingOptions, {
                            bookingOptions: args.bookingOptions,
                            bundleUniqueIdToDbId: bundleUniqueIdToDbId,
                        })];
                case 5:
                    bookingOptionsResult = _a.sent();
                    return [2 /*return*/, {
                            success: true,
                            message: "Successfully processed and inserted scraped data",
                            flightsInserted: flightsForDb.length,
                            bundlesInserted: args.bundles.length,
                            bookingOptionsInserted: bookingOptionsResult.inserted,
                            bookingOptionsReplaced: bookingOptionsResult.replaced,
                        }];
                case 6:
                    error_1 = _a.sent();
                    errorMessage = error_1 instanceof Error ? error_1.message : "Unknown error";
                    return [2 /*return*/, {
                            success: false,
                            message: "Failed to process and insert scraped data: ".concat(errorMessage),
                            flightsInserted: 0,
                            bundlesInserted: 0,
                            bookingOptionsInserted: 0,
                            bookingOptionsReplaced: 0,
                        }];
                case 7: return [2 /*return*/];
            }
        });
    }); },
});
/**
 * Get airport ID mapping for IATA codes.
 */
exports.getAirportIdMapping = (0, server_1.internalQuery)({
    args: {
        iataCodes: values_1.v.array(values_1.v.string()),
    },
    returns: values_1.v.record(values_1.v.string(), values_1.v.id("airports")),
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var mapping, _loop_1, _i, _a, iataCode;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    mapping = {};
                    _loop_1 = function (iataCode) {
                        var airport;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0: return [4 /*yield*/, ctx.db
                                        .query("airports")
                                        .withIndex("by_iataCode", function (q) { return q.eq("iataCode", iataCode); })
                                        .unique()];
                                case 1:
                                    airport = _c.sent();
                                    if (airport) {
                                        mapping[iataCode] = airport._id;
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, _a = args.iataCodes;
                    _b.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    iataCode = _a[_i];
                    return [5 /*yield**/, _loop_1(iataCode)];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, mapping];
            }
        });
    }); },
});
