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
exports.getBundlesWithBookingOptions = exports.getAllBookingOptionUniqueIds = exports.getBookingOptionsByBundleIds = exports.getBookingOptionsByBundleId = exports.bulkInsertBookingOptions = void 0;
var server_1 = require("./_generated/server");
var values_1 = require("convex/values");
/**
 * Bulk insert booking options with duplicate handling.
 * Maps bundle uniqueIds to database IDs and replaces existing booking options.
 */
exports.bulkInsertBookingOptions = (0, server_1.internalMutation)({
    args: {
        bookingOptions: values_1.v.array(values_1.v.object({
            uniqueId: values_1.v.string(),
            targetUniqueId: values_1.v.string(), // bundle uniqueId
            agency: values_1.v.string(),
            price: values_1.v.number(),
            linkToBook: values_1.v.string(),
            currency: values_1.v.string(),
            extractedAt: values_1.v.number(),
        })),
        bundleUniqueIdToDbId: values_1.v.record(values_1.v.string(), values_1.v.id("bundles")), // Mapping from bundle uniqueId to DB ID
    },
    returns: values_1.v.object({
        inserted: values_1.v.number(),
        replaced: values_1.v.number(),
    }),
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var inserted, replaced, _loop_1, _i, _a, bookingOption;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    inserted = 0;
                    replaced = 0;
                    _loop_1 = function (bookingOption) {
                        var existingBookingOption, bundleDbId;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0: return [4 /*yield*/, ctx.db
                                        .query("bookingOptions")
                                        .withIndex("by_uniqueId", function (q) {
                                        return q.eq("uniqueId", bookingOption.uniqueId);
                                    })
                                        .unique()];
                                case 1:
                                    existingBookingOption = _c.sent();
                                    bundleDbId = args.bundleUniqueIdToDbId[bookingOption.targetUniqueId];
                                    if (!bundleDbId) {
                                        return [2 /*return*/, "continue"];
                                    }
                                    if (!existingBookingOption) return [3 /*break*/, 3];
                                    // Replace existing booking option
                                    return [4 /*yield*/, ctx.db.patch(existingBookingOption._id, {
                                            targetId: bundleDbId,
                                            agency: bookingOption.agency,
                                            price: bookingOption.price,
                                            linkToBook: bookingOption.linkToBook,
                                            currency: bookingOption.currency,
                                            extractedAt: bookingOption.extractedAt,
                                        })];
                                case 2:
                                    // Replace existing booking option
                                    _c.sent();
                                    replaced++;
                                    return [3 /*break*/, 5];
                                case 3: 
                                // Insert new booking option
                                return [4 /*yield*/, ctx.db.insert("bookingOptions", {
                                        uniqueId: bookingOption.uniqueId,
                                        targetId: bundleDbId,
                                        agency: bookingOption.agency,
                                        price: bookingOption.price,
                                        linkToBook: bookingOption.linkToBook,
                                        currency: bookingOption.currency,
                                        extractedAt: bookingOption.extractedAt,
                                    })];
                                case 4:
                                    // Insert new booking option
                                    _c.sent();
                                    inserted++;
                                    _c.label = 5;
                                case 5: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, _a = args.bookingOptions;
                    _b.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    bookingOption = _a[_i];
                    return [5 /*yield**/, _loop_1(bookingOption)];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, { inserted: inserted, replaced: replaced }];
            }
        });
    }); },
});
/**
 * Get booking options by bundle ID.
 */
exports.getBookingOptionsByBundleId = (0, server_1.query)({
    args: {
        bundleId: values_1.v.id("bundles"),
    },
    returns: values_1.v.array(values_1.v.object({
        _id: values_1.v.id("bookingOptions"),
        _creationTime: values_1.v.number(),
        uniqueId: values_1.v.string(),
        targetId: values_1.v.id("bundles"),
        agency: values_1.v.string(),
        price: values_1.v.number(),
        linkToBook: values_1.v.string(),
        currency: values_1.v.string(),
        extractedAt: values_1.v.number(),
    })),
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ctx.db
                        .query("bookingOptions")
                        .withIndex("by_targetId", function (q) { return q.eq("targetId", args.bundleId); })
                        .order("asc")
                        .collect()];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); },
});
/**
 * Get booking options by bundle IDs.
 */
exports.getBookingOptionsByBundleIds = (0, server_1.query)({
    args: {
        bundleIds: values_1.v.array(values_1.v.id("bundles")),
    },
    returns: values_1.v.array(values_1.v.object({
        _id: values_1.v.id("bookingOptions"),
        _creationTime: values_1.v.number(),
        uniqueId: values_1.v.string(),
        targetId: values_1.v.id("bundles"),
        agency: values_1.v.string(),
        price: values_1.v.number(),
        linkToBook: values_1.v.string(),
        currency: values_1.v.string(),
        extractedAt: values_1.v.number(),
    })),
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var allBookingOptions, _loop_2, _i, _a, bundleId;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    allBookingOptions = [];
                    _loop_2 = function (bundleId) {
                        var bookingOptions;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0: return [4 /*yield*/, ctx.db
                                        .query("bookingOptions")
                                        .withIndex("by_targetId", function (q) { return q.eq("targetId", bundleId); })
                                        .collect()];
                                case 1:
                                    bookingOptions = _c.sent();
                                    allBookingOptions.push.apply(allBookingOptions, bookingOptions);
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, _a = args.bundleIds;
                    _b.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    bundleId = _a[_i];
                    return [5 /*yield**/, _loop_2(bundleId)];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, allBookingOptions];
            }
        });
    }); },
});
/**
 * Get all booking option unique IDs for duplicate checking.
 */
exports.getAllBookingOptionUniqueIds = (0, server_1.query)({
    args: {},
    returns: values_1.v.array(values_1.v.string()),
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
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
 * Get bundles with booking options for display.
 */
exports.getBundlesWithBookingOptions = (0, server_1.query)({
    args: {
        bundleIds: values_1.v.array(values_1.v.id("bundles")),
    },
    returns: values_1.v.array(values_1.v.object({
        _id: values_1.v.id("bundles"),
        _creationTime: values_1.v.number(),
        uniqueId: values_1.v.string(),
        outboundFlightIds: values_1.v.array(values_1.v.id("flights")),
        inboundFlightIds: values_1.v.array(values_1.v.id("flights")),
        bookingOptions: values_1.v.array(values_1.v.object({
            _id: values_1.v.id("bookingOptions"),
            _creationTime: values_1.v.number(),
            uniqueId: values_1.v.string(),
            targetId: values_1.v.id("bundles"),
            agency: values_1.v.string(),
            price: values_1.v.number(),
            linkToBook: values_1.v.string(),
            currency: values_1.v.string(),
            extractedAt: values_1.v.number(),
        })),
    })),
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var bundlesWithBookingOptions, _loop_3, _i, _a, bundleId;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    bundlesWithBookingOptions = [];
                    _loop_3 = function (bundleId) {
                        var bundle, bookingOptions;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0: return [4 /*yield*/, ctx.db.get(bundleId)];
                                case 1:
                                    bundle = _c.sent();
                                    if (!bundle)
                                        return [2 /*return*/, "continue"];
                                    return [4 /*yield*/, ctx.db
                                            .query("bookingOptions")
                                            .withIndex("by_targetId", function (q) { return q.eq("targetId", bundleId); })
                                            .order("asc")
                                            .collect()];
                                case 2:
                                    bookingOptions = _c.sent();
                                    bundlesWithBookingOptions.push({
                                        _id: bundle._id,
                                        _creationTime: bundle._creationTime,
                                        uniqueId: bundle.uniqueId,
                                        outboundFlightIds: bundle.outboundFlightIds,
                                        inboundFlightIds: bundle.inboundFlightIds,
                                        bookingOptions: bookingOptions,
                                    });
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, _a = args.bundleIds;
                    _b.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    bundleId = _a[_i];
                    return [5 /*yield**/, _loop_3(bundleId)];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, bundlesWithBookingOptions];
            }
        });
    }); },
});
