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
exports.getAllBundleUniqueIds = exports.getBundlesWithFlights = exports.getBundlesByUniqueIds = exports.bulkInsertBundles = void 0;
var server_1 = require("./_generated/server");
var values_1 = require("convex/values");
/**
 * Bulk insert bundles with duplicate handling.
 * Maps flight uniqueIds to database IDs and returns mapping of bundle uniqueId to database ID.
 */
exports.bulkInsertBundles = (0, server_1.internalMutation)({
    args: {
        bundles: values_1.v.array(values_1.v.object({
            uniqueId: values_1.v.string(),
            outboundFlightUniqueIds: values_1.v.array(values_1.v.string()),
            inboundFlightUniqueIds: values_1.v.array(values_1.v.string()),
        })),
        flightUniqueIdToDbId: values_1.v.record(values_1.v.string(), values_1.v.id("flights")), // Mapping from flight uniqueId to DB ID
    },
    returns: values_1.v.record(values_1.v.string(), values_1.v.id("bundles")), // bundle uniqueId -> database ID mapping
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var bundleUniqueIdToDbId, _loop_1, _i, _a, bundle;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    bundleUniqueIdToDbId = {};
                    _loop_1 = function (bundle) {
                        var existingBundle, outboundFlightIds, inboundFlightIds, dbId;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0: return [4 /*yield*/, ctx.db
                                        .query("bundles")
                                        .withIndex("by_uniqueId", function (q) { return q.eq("uniqueId", bundle.uniqueId); })
                                        .unique()];
                                case 1:
                                    existingBundle = _c.sent();
                                    if (!existingBundle) return [3 /*break*/, 2];
                                    // Bundle already exists, use existing ID
                                    bundleUniqueIdToDbId[bundle.uniqueId] = existingBundle._id;
                                    return [3 /*break*/, 4];
                                case 2:
                                    outboundFlightIds = bundle.outboundFlightUniqueIds
                                        .map(function (uniqueId) { return args.flightUniqueIdToDbId[uniqueId]; })
                                        .filter(Boolean);
                                    inboundFlightIds = bundle.inboundFlightUniqueIds
                                        .map(function (uniqueId) { return args.flightUniqueIdToDbId[uniqueId]; })
                                        .filter(Boolean);
                                    return [4 /*yield*/, ctx.db.insert("bundles", {
                                            uniqueId: bundle.uniqueId,
                                            outboundFlightIds: outboundFlightIds,
                                            inboundFlightIds: inboundFlightIds,
                                        })];
                                case 3:
                                    dbId = _c.sent();
                                    bundleUniqueIdToDbId[bundle.uniqueId] = dbId;
                                    _c.label = 4;
                                case 4: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, _a = args.bundles;
                    _b.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    bundle = _a[_i];
                    return [5 /*yield**/, _loop_1(bundle)];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, bundleUniqueIdToDbId];
            }
        });
    }); },
});
/**
 * Get bundles by unique IDs.
 */
exports.getBundlesByUniqueIds = (0, server_1.query)({
    args: {
        uniqueIds: values_1.v.array(values_1.v.string()),
    },
    returns: values_1.v.array(values_1.v.object({
        _id: values_1.v.id("bundles"),
        _creationTime: values_1.v.number(),
        uniqueId: values_1.v.string(),
        outboundFlightIds: values_1.v.array(values_1.v.id("flights")),
        inboundFlightIds: values_1.v.array(values_1.v.id("flights")),
    })),
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var bundles, _loop_2, _i, _a, uniqueId;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    bundles = [];
                    _loop_2 = function (uniqueId) {
                        var bundle;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0: return [4 /*yield*/, ctx.db
                                        .query("bundles")
                                        .withIndex("by_uniqueId", function (q) { return q.eq("uniqueId", uniqueId); })
                                        .unique()];
                                case 1:
                                    bundle = _c.sent();
                                    if (bundle) {
                                        bundles.push(bundle);
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
                case 4: return [2 /*return*/, bundles];
            }
        });
    }); },
});
/**
 * Get bundles with flight details for display.
 */
exports.getBundlesWithFlights = (0, server_1.query)({
    args: {
        bundleIds: values_1.v.array(values_1.v.id("bundles")),
    },
    returns: values_1.v.array(values_1.v.object({
        _id: values_1.v.id("bundles"),
        _creationTime: values_1.v.number(),
        uniqueId: values_1.v.string(),
        outboundFlights: values_1.v.array(values_1.v.object({
            _id: values_1.v.id("flights"),
            flightNumber: values_1.v.string(),
            departureAirportId: values_1.v.id("airports"),
            arrivalAirportId: values_1.v.id("airports"),
            departureDateTime: values_1.v.number(),
            arrivalDateTime: values_1.v.number(),
        })),
        inboundFlights: values_1.v.array(values_1.v.object({
            _id: values_1.v.id("flights"),
            flightNumber: values_1.v.string(),
            departureAirportId: values_1.v.id("airports"),
            arrivalAirportId: values_1.v.id("airports"),
            departureDateTime: values_1.v.number(),
            arrivalDateTime: values_1.v.number(),
        })),
    })),
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var bundlesWithFlights, _i, _a, bundleId, bundle, outboundFlights, _b, _c, flightId, flight, inboundFlights, _d, _e, flightId, flight;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    bundlesWithFlights = [];
                    _i = 0, _a = args.bundleIds;
                    _f.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 12];
                    bundleId = _a[_i];
                    return [4 /*yield*/, ctx.db.get(bundleId)];
                case 2:
                    bundle = _f.sent();
                    if (!bundle)
                        return [3 /*break*/, 11];
                    outboundFlights = [];
                    _b = 0, _c = bundle.outboundFlightIds;
                    _f.label = 3;
                case 3:
                    if (!(_b < _c.length)) return [3 /*break*/, 6];
                    flightId = _c[_b];
                    return [4 /*yield*/, ctx.db.get(flightId)];
                case 4:
                    flight = _f.sent();
                    if (flight) {
                        outboundFlights.push(flight);
                    }
                    _f.label = 5;
                case 5:
                    _b++;
                    return [3 /*break*/, 3];
                case 6:
                    inboundFlights = [];
                    _d = 0, _e = bundle.inboundFlightIds;
                    _f.label = 7;
                case 7:
                    if (!(_d < _e.length)) return [3 /*break*/, 10];
                    flightId = _e[_d];
                    return [4 /*yield*/, ctx.db.get(flightId)];
                case 8:
                    flight = _f.sent();
                    if (flight) {
                        inboundFlights.push(flight);
                    }
                    _f.label = 9;
                case 9:
                    _d++;
                    return [3 /*break*/, 7];
                case 10:
                    bundlesWithFlights.push({
                        _id: bundle._id,
                        _creationTime: bundle._creationTime,
                        uniqueId: bundle.uniqueId,
                        outboundFlights: outboundFlights,
                        inboundFlights: inboundFlights,
                    });
                    _f.label = 11;
                case 11:
                    _i++;
                    return [3 /*break*/, 1];
                case 12: return [2 /*return*/, bundlesWithFlights];
            }
        });
    }); },
});
/**
 * Get all bundle unique IDs for duplicate checking.
 */
exports.getAllBundleUniqueIds = (0, server_1.query)({
    args: {},
    returns: values_1.v.array(values_1.v.string()),
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
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
