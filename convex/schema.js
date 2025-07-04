"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var server_1 = require("convex/server");
var values_1 = require("convex/values");
var flights = (0, server_1.defineTable)({
    uniqueId: values_1.v.string(),
    flightNumber: values_1.v.string(),
    departureAirportId: values_1.v.id("airports"), // Reference to airports table
    arrivalAirportId: values_1.v.id("airports"), // Reference to airports table
    departureDateTime: values_1.v.number(), // Unix milliseconds
    arrivalDateTime: values_1.v.number(), // Unix milliseconds
})
    .index("by_uniqueId", ["uniqueId"])
    .index("by_departureAirportId", ["departureAirportId"])
    .index("by_arrivalAirportId", ["arrivalAirportId"])
    .index("by_departureDateTime", ["departureDateTime"])
    .index("by_departureAirportId_and_departureDateTime", [
    "departureAirportId",
    "departureDateTime",
])
    .index("by_arrivalAirportId_and_arrivalDateTime", [
    "arrivalAirportId",
    "arrivalDateTime",
]);
var bundles = (0, server_1.defineTable)({
    uniqueId: values_1.v.string(),
    outboundFlightIds: values_1.v.array(values_1.v.id("flights")),
    inboundFlightIds: values_1.v.array(values_1.v.id("flights")),
}).index("by_uniqueId", ["uniqueId"]);
var bookingOptions = (0, server_1.defineTable)({
    uniqueId: values_1.v.string(),
    targetId: values_1.v.id("bundles"),
    agency: values_1.v.string(),
    price: values_1.v.number(),
    linkToBook: values_1.v.string(), // Updated field name to match PRD
    currency: values_1.v.string(),
    extractedAt: values_1.v.number(),
})
    .index("by_uniqueId", ["uniqueId"])
    .index("by_targetId", ["targetId"])
    .index("by_price", ["price"])
    .index("by_targetId_and_price", ["targetId", "price"])
    .index("by_extractedAt", ["extractedAt"]);
var airports = (0, server_1.defineTable)({
    iataCode: values_1.v.string(),
    icaoCode: values_1.v.optional(values_1.v.string()),
    name: values_1.v.string(),
    city: values_1.v.string(),
    country: values_1.v.optional(values_1.v.string()),
    timezone: values_1.v.optional(values_1.v.string()),
})
    .index("by_iataCode", ["iataCode"])
    .searchIndex("search_iataCode", { searchField: "iataCode" })
    .searchIndex("search_name", { searchField: "name" })
    .searchIndex("search_city", { searchField: "city" })
    .searchIndex("search_country", { searchField: "country" });
var airlines = (0, server_1.defineTable)({
    iataCode: values_1.v.optional(values_1.v.string()),
    icaoCode: values_1.v.optional(values_1.v.string()),
    name: values_1.v.string(),
    country: values_1.v.optional(values_1.v.string()),
    scrapedAt: values_1.v.string(),
})
    .index("by_iataCode", ["iataCode"])
    .index("by_icaoCode", ["icaoCode"]);
var scrapingLogs = (0, server_1.defineTable)({
    source: values_1.v.string(), // e.g., "skyscanner", "kiwi"
    status: values_1.v.union(values_1.v.literal("started"), values_1.v.literal("success"), values_1.v.literal("error"), values_1.v.literal("failed")),
    message: values_1.v.string(), // Description of what happened
    errorDetails: values_1.v.optional(values_1.v.string()), // Error message if status is error/failed
    startTime: values_1.v.number(), // Unix milliseconds
    endTime: values_1.v.optional(values_1.v.number()), // Unix milliseconds
    recordsProcessed: values_1.v.optional(values_1.v.number()), // Number of flights/bundles processed
    searchParams: values_1.v.optional(values_1.v.string()), // JSON string of search parameters
})
    .index("by_source", ["source"])
    .index("by_status", ["status"])
    .index("by_startTime", ["startTime"]);
exports.default = (0, server_1.defineSchema)({
    flights: flights,
    bundles: bundles,
    bookingOptions: bookingOptions,
    airports: airports,
    airlines: airlines,
    scrapingLogs: scrapingLogs,
});
