import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const flights = defineTable({
  uniqueId: v.string(),
  flightNumber: v.string(),
  departureAirportId: v.id("airports"), // Reference to airports table
  arrivalAirportId: v.id("airports"), // Reference to airports table
  departureDateTime: v.number(), // Unix milliseconds
  arrivalDateTime: v.number(), // Unix milliseconds
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

const bundles = defineTable({
  uniqueId: v.string(),
  outboundFlightIds: v.array(v.id("flights")),
  inboundFlightIds: v.array(v.id("flights")),
}).index("by_uniqueId", ["uniqueId"]);

const bookingOptions = defineTable({
  uniqueId: v.string(),
  targetId: v.id("bundles"),
  agency: v.string(),
  price: v.number(),
  linkToBook: v.string(), // Updated field name to match PRD
  currency: v.string(),
  extractedAt: v.number(),
})
  .index("by_uniqueId", ["uniqueId"])
  .index("by_targetId", ["targetId"])
  .index("by_price", ["price"])
  .index("by_targetId_and_price", ["targetId", "price"])
  .index("by_extractedAt", ["extractedAt"]);

const airports = defineTable({
  iataCode: v.string(),
  icaoCode: v.optional(v.string()),
  name: v.string(),
  city: v.string(),
  country: v.optional(v.string()),
  timezone: v.optional(v.string()),
  popularityScore: v.optional(v.number()), // Integer 0-1000 for ranking airports by popularity
})
  .index("by_iataCode", ["iataCode"])
  .index("by_popularityScore", ["popularityScore"]) // Index for popularity-based sorting
  .searchIndex("search_iataCode", { searchField: "iataCode" })
  .searchIndex("search_name", { searchField: "name" })
  .searchIndex("search_city", { searchField: "city" })
  .searchIndex("search_country", { searchField: "country" });

const airlines = defineTable({
  iataCode: v.optional(v.string()),
  icaoCode: v.optional(v.string()),
  name: v.string(),
  country: v.optional(v.string()),
  scrapedAt: v.string(),
})
  .index("by_iataCode", ["iataCode"])
  .index("by_icaoCode", ["icaoCode"]);

const scrapingLogs = defineTable({
  source: v.string(), // e.g., "skyscanner", "kiwi"
  status: v.union(
    v.literal("started"),
    v.literal("success"),
    v.literal("error"),
    v.literal("failed")
  ),
  message: v.string(), // Description of what happened
  errorDetails: v.optional(v.string()), // Error message if status is error/failed
  startTime: v.number(), // Unix milliseconds
  endTime: v.optional(v.number()), // Unix milliseconds
  recordsProcessed: v.optional(v.number()), // Number of flights/bundles processed
  searchParams: v.optional(v.string()), // JSON string of search parameters
})
  .index("by_source", ["source"])
  .index("by_status", ["status"])
  .index("by_startTime", ["startTime"]);

export default defineSchema({
  flights,
  bundles,
  bookingOptions,
  airports,
  airlines,
  scrapingLogs,
});
