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
exports.getAllFlightUniqueIds = exports.getFlightsByDateRangeAndAirports = exports.getFlightsByUniqueIds = exports.bulkInsertFlights = void 0;
var server_1 = require("./_generated/server");
var values_1 = require("convex/values");
/**
 * Bulk insert flights with duplicate handling.
 * Returns mapping of uniqueId to database ID for use in bundle creation.
 */
exports.bulkInsertFlights = (0, server_1.internalMutation)({
    args: {
        flights: values_1.v.array(values_1.v.object({
            uniqueId: values_1.v.string(),
            flightNumber: values_1.v.string(),
            departureAirportId: values_1.v.id("airports"),
            arrivalAirportId: values_1.v.id("airports"),
            departureDateTime: values_1.v.number(),
            arrivalDateTime: values_1.v.number(),
        })),
    },
    returns: values_1.v.record(values_1.v.string(), values_1.v.id("flights")), // uniqueId -> database ID mapping
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var uniqueIdToDbId, _loop_1, _i, _a, flight;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    uniqueIdToDbId = {};
                    _loop_1 = function (flight) {
                        var existingFlight, dbId;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0: return [4 /*yield*/, ctx.db
                                        .query("flights")
                                        .withIndex("by_uniqueId", function (q) { return q.eq("uniqueId", flight.uniqueId); })
                                        .unique()];
                                case 1:
                                    existingFlight = _c.sent();
                                    if (!existingFlight) return [3 /*break*/, 2];
                                    // Flight already exists, use existing ID
                                    uniqueIdToDbId[flight.uniqueId] = existingFlight._id;
                                    return [3 /*break*/, 4];
                                case 2: return [4 /*yield*/, ctx.db.insert("flights", {
                                        uniqueId: flight.uniqueId,
                                        flightNumber: flight.flightNumber,
                                        departureAirportId: flight.departureAirportId,
                                        arrivalAirportId: flight.arrivalAirportId,
                                        departureDateTime: flight.departureDateTime,
                                        arrivalDateTime: flight.arrivalDateTime,
                                    })];
                                case 3:
                                    dbId = _c.sent();
                                    uniqueIdToDbId[flight.uniqueId] = dbId;
                                    _c.label = 4;
                                case 4: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, _a = args.flights;
                    _b.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    flight = _a[_i];
                    return [5 /*yield**/, _loop_1(flight)];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, uniqueIdToDbId];
            }
        });
    }); },
});
/**
 * Get flights by unique IDs.
 */
exports.getFlightsByUniqueIds = (0, server_1.query)({
    args: {
        uniqueIds: values_1.v.array(values_1.v.string()),
    },
    returns: values_1.v.array(values_1.v.object({
        _id: values_1.v.id("flights"),
        _creationTime: values_1.v.number(),
        uniqueId: values_1.v.string(),
        flightNumber: values_1.v.string(),
        departureAirportId: values_1.v.id("airports"),
        arrivalAirportId: values_1.v.id("airports"),
        departureDateTime: values_1.v.number(),
        arrivalDateTime: values_1.v.number(),
    })),
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var flights, _loop_2, _i, _a, uniqueId;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    flights = [];
                    _loop_2 = function (uniqueId) {
                        var flight;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0: return [4 /*yield*/, ctx.db
                                        .query("flights")
                                        .withIndex("by_uniqueId", function (q) { return q.eq("uniqueId", uniqueId); })
                                        .unique()];
                                case 1:
                                    flight = _c.sent();
                                    if (flight) {
                                        flights.push(flight);
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, _a = args.uniqueIds;
                    _b.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    uniqueId = _a[_i];
                    return [5 /*yield**/, _loop_2(uniqueId)];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, flights];
            }
        });
    }); },
});
/**
 * Get flights by date range and airports.
 */
exports.getFlightsByDateRangeAndAirports = (0, server_1.query)({
    args: {
        departureAirportId: values_1.v.id("airports"),
        arrivalAirportId: values_1.v.id("airports"),
        startDate: values_1.v.number(),
        endDate: values_1.v.number(),
    },
    returns: values_1.v.array(values_1.v.object({
        _id: values_1.v.id("flights"),
        _creationTime: values_1.v.number(),
        uniqueId: values_1.v.string(),
        flightNumber: values_1.v.string(),
        departureAirportId: values_1.v.id("airports"),
        arrivalAirportId: values_1.v.id("airports"),
        departureDateTime: values_1.v.number(),
        arrivalDateTime: values_1.v.number(),
    })),
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ctx.db
                        .query("flights")
                        .withIndex("by_departureAirportId_and_departureDateTime", function (q) {
                        return q
                            .eq("departureAirportId", args.departureAirportId)
                            .gte("departureDateTime", args.startDate)
                            .lte("departureDateTime", args.endDate);
                    })
                        .filter(function (q) { return q.eq(q.field("arrivalAirportId"), args.arrivalAirportId); })
                        .collect()];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); },
});
/**
 * Get all flight unique IDs for duplicate checking.
 */
exports.getAllFlightUniqueIds = (0, server_1.query)({
    args: {},
    returns: values_1.v.array(values_1.v.string()),
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
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
