import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  flights: defineTable({
    uniqueId: v.string(),
    airline: v.id("airlines"),
    flightNumber: v.string(),
    from: v.id("airports"),
    to: v.id("airports"),
    departure: v.string(),
    arrival: v.string(),
  }).index("by_uniqueId", ["uniqueId"]),
  airports: defineTable({
    uniqueId: v.string(),
    name: v.string(),
    iata_code: v.string(),
    iso_country: v.string(),
    municipality: v.optional(v.string()),
    timezone: v.string(),
  })
    .index("by_uniqueId", ["uniqueId"])
    .searchIndex("search_name", { searchField: "name" })
    .searchIndex("search_iata_code", { searchField: "iata_code" })
    .searchIndex("search_municipality", { searchField: "municipality" })
    .searchIndex("search_iso_country", { searchField: "iso_country" }),
  airlines: defineTable({
    uniqueId: v.string(),
    name: v.string(),
  }).index("by_uniqueId", ["uniqueId"]),
  deals: defineTable({
    uniqueId: v.string(),
    flights: v.array(v.id("flights")),
    price: v.number(),
    dealer: v.string(),
    link: v.string(),
    date: v.string(),
  }).index("by_uniqueId", ["uniqueId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
