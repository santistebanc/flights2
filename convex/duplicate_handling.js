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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExistingUniqueIdsByAirports = exports.getExistingUniqueIdsByDateRange = exports.getAllExistingUniqueIds = exports.getExistingBookingOptionUniqueIds = exports.getExistingBundleUniqueIds = exports.getExistingFlightUniqueIds = void 0;
var server_1 = require("./_generated/server");
var values_1 = require("convex/values");
/**
 * Get all existing flight unique IDs for duplicate checking.
 */
exports.getExistingFlightUniqueIds = (0, server_1.query)({
    args: {},
    returns: values_1.v.array(values_1.v.string()),
    handler: function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
        var flights;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ctx.db.query("flights").collect()];
                case 1:
                    flights = _a.sent();
                    return [2 /*return*/, flights.map(function (flight) { return flight.uniqueId; })];
            }
        });
    }); },
});
/**
 * Get all existing bundle unique IDs for duplicate checking.
 */
exports.getExistingBundleUniqueIds = (0, server_1.query)({
    args: {},
    returns: values_1.v.array(values_1.v.string()),
    handler: function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
        var bundles;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ctx.db.query("bundles").collect()];
                case 1:
                    bundles = _a.sent();
                    return [2 /*return*/, bundles.map(function (bundle) { return bundle.uniqueId; })];
            }
        });
    }); },
});
/**
 * Get all existing booking option unique IDs for duplicate checking.
 */
exports.getExistingBookingOptionUniqueIds = (0, server_1.query)({
    args: {},
    returns: values_1.v.array(values_1.v.string()),
    handler: function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
        var bookingOptions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ctx.db.query("bookingOptions").collect()];
                case 1:
                    bookingOptions = _a.sent();
                    return [2 /*return*/, bookingOptions.map(function (booking) { return booking.uniqueId; })];
            }
        });
    }); },
});
/**
 * Get existing unique IDs for all entity types in a single query.
 * This is more efficient than making separate queries.
 */
exports.getAllExistingUniqueIds = (0, server_1.query)({
    args: {},
    returns: values_1.v.object({
        flightIds: values_1.v.array(values_1.v.string()),
        bundleIds: values_1.v.array(values_1.v.string()),
        bookingOptionIds: values_1.v.array(values_1.v.string()),
    }),
    handler: function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, flights, bundles, bookingOptions;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.all([
                        ctx.db.query("flights").collect(),
                        ctx.db.query("bundles").collect(),
                        ctx.db.query("bookingOptions").collect(),
                    ])];
                case 1:
                    _a = _b.sent(), flights = _a[0], bundles = _a[1], bookingOptions = _a[2];
                    return [2 /*return*/, {
                            flightIds: flights.map(function (flight) { return flight.uniqueId; }),
                            bundleIds: bundles.map(function (bundle) { return bundle.uniqueId; }),
                            bookingOptionIds: bookingOptions.map(function (booking) { return booking.uniqueId; }),
                        }];
            }
        });
    }); },
});
/**
 * Get existing unique IDs filtered by date range for more targeted duplicate checking.
 */
exports.getExistingUniqueIdsByDateRange = (0, server_1.query)({
    args: {
        startDate: values_1.v.number(),
        endDate: values_1.v.number(),
    },
    returns: values_1.v.object({
        flightIds: values_1.v.array(values_1.v.string()),
        bundleIds: values_1.v.array(values_1.v.string()),
        bookingOptionIds: values_1.v.array(values_1.v.string()),
    }),
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var flights, flightIds, bundles, relevantBundles, bundleIds, allBookingOptions, bookingOptions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ctx.db
                        .query("flights")
                        .withIndex("by_departureDateTime", function (q) {
                        return q
                            .gte("departureDateTime", args.startDate)
                            .lte("departureDateTime", args.endDate);
                    })
                        .collect()];
                case 1:
                    flights = _a.sent();
                    flightIds = flights.map(function (f) { return f._id; });
                    return [4 /*yield*/, ctx.db.query("bundles").collect()];
                case 2:
                    bundles = _a.sent();
                    relevantBundles = bundles.filter(function (bundle) {
                        return bundle.outboundFlightIds.some(function (id) { return flightIds.includes(id); }) ||
                            bundle.inboundFlightIds.some(function (id) { return flightIds.includes(id); });
                    });
                    bundleIds = relevantBundles.map(function (b) { return b._id; });
                    return [4 /*yield*/, ctx.db.query("bookingOptions").collect()];
                case 3:
                    allBookingOptions = _a.sent();
                    bookingOptions = allBookingOptions.filter(function (booking) {
                        return bundleIds.includes(booking.targetId);
                    });
                    return [2 /*return*/, {
                            flightIds: flights.map(function (flight) { return flight.uniqueId; }),
                            bundleIds: relevantBundles.map(function (bundle) { return bundle.uniqueId; }),
                            bookingOptionIds: bookingOptions.map(function (booking) { return booking.uniqueId; }),
                        }];
            }
        });
    }); },
});
/**
 * Get existing unique IDs filtered by airports for more targeted duplicate checking.
 */
exports.getExistingUniqueIdsByAirports = (0, server_1.query)({
    args: {
        departureAirportId: values_1.v.id("airports"),
        arrivalAirportId: values_1.v.id("airports"),
    },
    returns: values_1.v.object({
        flightIds: values_1.v.array(values_1.v.string()),
        bundleIds: values_1.v.array(values_1.v.string()),
        bookingOptionIds: values_1.v.array(values_1.v.string()),
    }),
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var flights, relevantFlights, flightIds, bundles, relevantBundles, bundleIds, allBookingOptions, bookingOptions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ctx.db
                        .query("flights")
                        .withIndex("by_departureAirportId_and_departureDateTime", function (q) {
                        return q.eq("departureAirportId", args.departureAirportId);
                    })
                        .collect()];
                case 1:
                    flights = _a.sent();
                    relevantFlights = flights.filter(function (flight) { return flight.arrivalAirportId === args.arrivalAirportId; });
                    flightIds = relevantFlights.map(function (f) { return f._id; });
                    return [4 /*yield*/, ctx.db.query("bundles").collect()];
                case 2:
                    bundles = _a.sent();
                    relevantBundles = bundles.filter(function (bundle) {
                        return bundle.outboundFlightIds.some(function (id) { return flightIds.includes(id); }) ||
                            bundle.inboundFlightIds.some(function (id) { return flightIds.includes(id); });
                    });
                    bundleIds = relevantBundles.map(function (b) { return b._id; });
                    return [4 /*yield*/, ctx.db.query("bookingOptions").collect()];
                case 3:
                    allBookingOptions = _a.sent();
                    bookingOptions = allBookingOptions.filter(function (booking) {
                        return bundleIds.includes(booking.targetId);
                    });
                    return [2 /*return*/, {
                            flightIds: relevantFlights.map(function (flight) { return flight.uniqueId; }),
                            bundleIds: relevantBundles.map(function (bundle) { return bundle.uniqueId; }),
                            bookingOptionIds: bookingOptions.map(function (booking) { return booking.uniqueId; }),
                        }];
            }
        });
    }); },
});
