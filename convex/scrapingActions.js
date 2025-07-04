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
exports.scrapeSkyscanner = exports.scrapeKiwi = void 0;
var server_1 = require("./_generated/server");
var values_1 = require("convex/values");
var kiwi_scraper_1 = require("../lib/scrapers/kiwi-scraper");
var skyscanner_scraper_1 = require("../lib/scrapers/skyscanner-scraper");
var api_1 = require("./_generated/api");
exports.scrapeKiwi = (0, server_1.action)({
    args: {
        departureAirport: values_1.v.string(),
        arrivalAirport: values_1.v.string(),
        departureDate: values_1.v.string(), // ISO string
        returnDate: values_1.v.optional(values_1.v.string()), // ISO string
        isRoundTrip: values_1.v.boolean(),
    },
    returns: values_1.v.object({
        success: values_1.v.boolean(),
        message: values_1.v.string(),
        recordsProcessed: values_1.v.number(),
        scrapedData: values_1.v.any(), // For debugging - will be removed later
    }),
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var params, logId, scraper, result, insertionResult, recordsProcessed, error_1, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    params = {
                        departureAirport: args.departureAirport,
                        arrivalAirport: args.arrivalAirport,
                        departureDate: new Date(args.departureDate),
                        returnDate: args.returnDate ? new Date(args.returnDate) : undefined,
                        isRoundTrip: args.isRoundTrip,
                    };
                    return [4 /*yield*/, ctx.runMutation(api_1.internal["scraping_logs"].logScrapingStart, {
                            source: "kiwi",
                            searchParams: JSON.stringify(params),
                        })];
                case 1:
                    logId = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 6, , 8]);
                    scraper = new kiwi_scraper_1.KiwiScraper();
                    return [4 /*yield*/, scraper.scrape(params)];
                case 3:
                    result = _a.sent();
                    return [4 /*yield*/, ctx.runMutation(api_1.internal.data_processing.processAndInsertScrapedData, {
                            flights: result.flights || [],
                            bundles: result.bundles || [],
                            bookingOptions: result.bookingOptions || [],
                        })];
                case 4:
                    insertionResult = _a.sent();
                    recordsProcessed = insertionResult.flightsInserted +
                        insertionResult.bundlesInserted +
                        insertionResult.bookingOptionsInserted +
                        insertionResult.bookingOptionsReplaced;
                    // Log success
                    return [4 /*yield*/, ctx.runMutation(api_1.internal["scraping_logs"].logScrapingSuccess, {
                            logId: logId,
                            recordsProcessed: recordsProcessed,
                            message: "Successfully scraped and inserted ".concat(recordsProcessed, " records from Kiwi"),
                        })];
                case 5:
                    // Log success
                    _a.sent();
                    return [2 /*return*/, {
                            success: insertionResult.success,
                            message: insertionResult.message,
                            recordsProcessed: recordsProcessed,
                            scrapedData: result, // For debugging
                        }];
                case 6:
                    error_1 = _a.sent();
                    errorMessage = error_1 instanceof Error ? error_1.message : "Unknown error";
                    // Log error
                    return [4 /*yield*/, ctx.runMutation(api_1.internal["scraping_logs"].logScrapingError, {
                            logId: logId,
                            errorMessage: errorMessage,
                            errorDetails: error_1 instanceof Error ? error_1.stack : undefined,
                            phase: "scraping",
                        })];
                case 7:
                    // Log error
                    _a.sent();
                    return [2 /*return*/, {
                            success: false,
                            message: "Failed to scrape Kiwi: ".concat(errorMessage),
                            recordsProcessed: 0,
                            scrapedData: null,
                        }];
                case 8: return [2 /*return*/];
            }
        });
    }); },
});
exports.scrapeSkyscanner = (0, server_1.action)({
    args: {
        departureAirport: values_1.v.string(),
        arrivalAirport: values_1.v.string(),
        departureDate: values_1.v.string(), // ISO string
        returnDate: values_1.v.optional(values_1.v.string()), // ISO string
        isRoundTrip: values_1.v.boolean(),
    },
    returns: values_1.v.object({
        success: values_1.v.boolean(),
        message: values_1.v.string(),
        recordsProcessed: values_1.v.number(),
        scrapedData: values_1.v.any(), // For debugging - will be removed later
    }),
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var params, logId, scraper, result, insertionResult, recordsProcessed, error_2, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    params = {
                        departureAirport: args.departureAirport,
                        arrivalAirport: args.arrivalAirport,
                        departureDate: new Date(args.departureDate),
                        returnDate: args.returnDate ? new Date(args.returnDate) : undefined,
                        isRoundTrip: args.isRoundTrip,
                    };
                    return [4 /*yield*/, ctx.runMutation(api_1.internal["scraping_logs"].logScrapingStart, {
                            source: "skyscanner",
                            searchParams: JSON.stringify(params),
                        })];
                case 1:
                    logId = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 6, , 8]);
                    scraper = new skyscanner_scraper_1.SkyscannerScraper();
                    return [4 /*yield*/, scraper.scrape(params)];
                case 3:
                    result = _a.sent();
                    return [4 /*yield*/, ctx.runMutation(api_1.internal.data_processing.processAndInsertScrapedData, {
                            flights: result.flights || [],
                            bundles: result.bundles || [],
                            bookingOptions: result.bookingOptions || [],
                        })];
                case 4:
                    insertionResult = _a.sent();
                    recordsProcessed = insertionResult.flightsInserted +
                        insertionResult.bundlesInserted +
                        insertionResult.bookingOptionsInserted +
                        insertionResult.bookingOptionsReplaced;
                    // Log success
                    return [4 /*yield*/, ctx.runMutation(api_1.internal["scraping_logs"].logScrapingSuccess, {
                            logId: logId,
                            recordsProcessed: recordsProcessed,
                            message: "Successfully scraped and inserted ".concat(recordsProcessed, " records from Skyscanner"),
                        })];
                case 5:
                    // Log success
                    _a.sent();
                    return [2 /*return*/, {
                            success: insertionResult.success,
                            message: insertionResult.message,
                            recordsProcessed: recordsProcessed,
                            scrapedData: result, // For debugging
                        }];
                case 6:
                    error_2 = _a.sent();
                    errorMessage = error_2 instanceof Error ? error_2.message : "Unknown error";
                    // Log error
                    return [4 /*yield*/, ctx.runMutation(api_1.internal["scraping_logs"].logScrapingError, {
                            logId: logId,
                            errorMessage: errorMessage,
                            errorDetails: error_2 instanceof Error ? error_2.stack : undefined,
                            phase: "scraping",
                        })];
                case 7:
                    // Log error
                    _a.sent();
                    return [2 /*return*/, {
                            success: false,
                            message: "Failed to scrape Skyscanner: ".concat(errorMessage),
                            recordsProcessed: 0,
                            scrapedData: null,
                        }];
                case 8: return [2 /*return*/];
            }
        });
    }); },
});
