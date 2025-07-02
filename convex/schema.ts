import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const applicationTables = {
  flights: defineTable({
    uniqueId: v.string(),
    flightNumber: v.string(),
    fromId: v.id("airports"),
    toId: v.id("airports"),
    departure: v.number(),
    arrival: v.number(),
  }).index("by_uniqueId", ["uniqueId"]),
  airports: defineTable({
    iataCode: v.string(),
    icaoCode: v.optional(v.string()),
    name: v.string(),
    city: v.string(),
    country: v.optional(v.string()),
    timezone: v.optional(v.string()),
  })
    .index("by_iataCode", ["iataCode"])
    .searchIndex("search_iataCode", { searchField: "iataCode" })
    .searchIndex("search_name", { searchField: "name" })
    .searchIndex("search_city", { searchField: "city" })
    .searchIndex("search_country", { searchField: "country" }),
  airlines: defineTable({
    iataCode: v.optional(v.string()),
    icaoCode: v.optional(v.string()),
    name: v.string(),
    country: v.optional(v.string()),
    scrapedAt: v.string(),
  })
    .index("by_iataCode", ["iataCode"])
    .index("by_icaoCode", ["icaoCode"]),
  bundles: defineTable({
    uniqueId: v.string(),
    outboundFlightIds: v.array(v.id("flights")),
    inboundFlightIds: v.array(v.id("flights")),
  }).index("by_uniqueId", ["uniqueId"]),
  bookingOptions: defineTable({
    uniqueId: v.string(),
    targetId: v.id("bundles"),
    agency: v.string(),
    price: v.number(),
    link: v.string(),
    currency: v.string(),
    extractedAt: v.number(),
  })
    .index("by_uniqueId", ["uniqueId"])
    .index("by_targetId", ["targetId"]),
};

export default defineSchema({
  ...applicationTables,
});
