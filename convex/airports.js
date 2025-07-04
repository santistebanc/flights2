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
exports.getAirportByIata = exports.searchAirports = void 0;
var server_1 = require("./_generated/server");
var values_1 = require("convex/values");
/**
 * Search airports with priority-based matching
 * Priority order: IATA code > Airport name > City name > Country name
 */
exports.searchAirports = (0, server_1.query)({
    args: {
        searchTerm: values_1.v.string(),
        limit: values_1.v.optional(values_1.v.number()),
    },
    returns: values_1.v.array(values_1.v.object({
        _id: values_1.v.id("airports"),
        iataCode: values_1.v.string(),
        name: values_1.v.string(),
        city: values_1.v.string(),
        country: values_1.v.optional(values_1.v.string()),
        matchType: values_1.v.union(values_1.v.literal("iata"), values_1.v.literal("name"), values_1.v.literal("city"), values_1.v.literal("country")),
    })),
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var searchTerm, limit, results, iataMatches, iataStartsWith, _loop_1, _i, iataStartsWith_1, airport, nameMatches, _loop_2, _a, nameMatches_1, airport, cityMatches, _loop_3, _b, cityMatches_1, airport, countryMatches, _loop_4, _c, countryMatches_1, airport;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    searchTerm = args.searchTerm.trim();
                    limit = args.limit || 10;
                    if (searchTerm.length === 0) {
                        return [2 /*return*/, []];
                    }
                    results = [];
                    if (!(searchTerm.length === 3)) return [3 /*break*/, 2];
                    return [4 /*yield*/, ctx.db
                            .query("airports")
                            .withIndex("by_iataCode", function (q) {
                            return q.eq("iataCode", searchTerm.toUpperCase());
                        })
                            .take(limit)];
                case 1:
                    iataMatches = _d.sent();
                    results.push.apply(results, iataMatches.map(function (airport) { return ({
                        _id: airport._id,
                        iataCode: airport.iataCode,
                        name: airport.name,
                        city: airport.city,
                        country: airport.country,
                        matchType: "iata",
                    }); }));
                    _d.label = 2;
                case 2:
                    if (!(results.length < limit)) return [3 /*break*/, 4];
                    return [4 /*yield*/, ctx.db
                            .query("airports")
                            .withSearchIndex("search_iataCode", function (q) {
                            return q.search("iataCode", searchTerm);
                        })
                            .take(limit - results.length)];
                case 3:
                    iataStartsWith = _d.sent();
                    _loop_1 = function (airport) {
                        if (!results.some(function (r) { return r._id === airport._id; })) {
                            results.push({
                                _id: airport._id,
                                iataCode: airport.iataCode,
                                name: airport.name,
                                city: airport.city,
                                country: airport.country,
                                matchType: "iata",
                            });
                        }
                    };
                    for (_i = 0, iataStartsWith_1 = iataStartsWith; _i < iataStartsWith_1.length; _i++) {
                        airport = iataStartsWith_1[_i];
                        _loop_1(airport);
                    }
                    _d.label = 4;
                case 4:
                    if (!(results.length < limit)) return [3 /*break*/, 6];
                    return [4 /*yield*/, ctx.db
                            .query("airports")
                            .withSearchIndex("search_name", function (q) { return q.search("name", searchTerm); })
                            .take(limit - results.length)];
                case 5:
                    nameMatches = _d.sent();
                    _loop_2 = function (airport) {
                        if (!results.some(function (r) { return r._id === airport._id; })) {
                            results.push({
                                _id: airport._id,
                                iataCode: airport.iataCode,
                                name: airport.name,
                                city: airport.city,
                                country: airport.country,
                                matchType: "name",
                            });
                        }
                    };
                    for (_a = 0, nameMatches_1 = nameMatches; _a < nameMatches_1.length; _a++) {
                        airport = nameMatches_1[_a];
                        _loop_2(airport);
                    }
                    _d.label = 6;
                case 6:
                    if (!(results.length < limit)) return [3 /*break*/, 8];
                    return [4 /*yield*/, ctx.db
                            .query("airports")
                            .withSearchIndex("search_city", function (q) { return q.search("city", searchTerm); })
                            .take(limit - results.length)];
                case 7:
                    cityMatches = _d.sent();
                    _loop_3 = function (airport) {
                        if (!results.some(function (r) { return r._id === airport._id; })) {
                            results.push({
                                _id: airport._id,
                                iataCode: airport.iataCode,
                                name: airport.name,
                                city: airport.city,
                                country: airport.country,
                                matchType: "city",
                            });
                        }
                    };
                    for (_b = 0, cityMatches_1 = cityMatches; _b < cityMatches_1.length; _b++) {
                        airport = cityMatches_1[_b];
                        _loop_3(airport);
                    }
                    _d.label = 8;
                case 8:
                    if (!(results.length < limit && searchTerm.length > 2)) return [3 /*break*/, 10];
                    return [4 /*yield*/, ctx.db
                            .query("airports")
                            .withSearchIndex("search_country", function (q) {
                            return q.search("country", searchTerm);
                        })
                            .take(limit - results.length)];
                case 9:
                    countryMatches = _d.sent();
                    _loop_4 = function (airport) {
                        if (!results.some(function (r) { return r._id === airport._id; })) {
                            results.push({
                                _id: airport._id,
                                iataCode: airport.iataCode,
                                name: airport.name,
                                city: airport.city,
                                country: airport.country,
                                matchType: "country",
                            });
                        }
                    };
                    for (_c = 0, countryMatches_1 = countryMatches; _c < countryMatches_1.length; _c++) {
                        airport = countryMatches_1[_c];
                        _loop_4(airport);
                    }
                    _d.label = 10;
                case 10: return [2 /*return*/, results.slice(0, limit)];
            }
        });
    }); },
});
/**
 * Get airport by IATA code
 */
exports.getAirportByIata = (0, server_1.query)({
    args: {
        iataCode: values_1.v.string(),
    },
    returns: values_1.v.union(values_1.v.object({
        _id: values_1.v.id("airports"),
        iataCode: values_1.v.string(),
        name: values_1.v.string(),
        city: values_1.v.string(),
        country: values_1.v.optional(values_1.v.string()),
    }), values_1.v.null()),
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var airport;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ctx.db
                        .query("airports")
                        .withIndex("by_iataCode", function (q) {
                        return q.eq("iataCode", args.iataCode.toUpperCase());
                    })
                        .unique()];
                case 1:
                    airport = _a.sent();
                    if (!airport) {
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, {
                            _id: airport._id,
                            iataCode: airport.iataCode,
                            name: airport.name,
                            city: airport.city,
                            country: airport.country,
                        }];
            }
        });
    }); },
});
