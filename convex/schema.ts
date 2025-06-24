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
  })
    .index("by_uniqueId", ["uniqueId"])
    .index("by_from", ["from"])
    .index("by_to", ["to"])
    .index("by_departure", ["departure"])
    .index("by_arrival", ["arrival"]),
  airports: defineTable({
    uniqueId: v.string(),
    iata: v.string(),
    name: v.string(),
    city: v.string(),
    country: v.string(),
    timezone: v.string(),
  })
    .index("by_uniqueId", ["uniqueId"])
    .index("by_iata", ["iata"])
    .index("by_name", ["name"])
    .index("by_city", ["city"])
    .index("by_country", ["country"]),
  airlines: defineTable({
    uniqueId: v.string(),
    name: v.string(),
  })
    .index("by_uniqueId", ["uniqueId"])
    .index("by_name", ["name"]),
  deals: defineTable({
    uniqueId: v.string(),
    flights: v.array(v.id("flights")),
    price: v.number(),
    dealer: v.string(),
    link: v.string(),
    date: v.string(),
  })
    .index("by_uniqueId", ["uniqueId"])
    .index("by_flights", ["flights"])
    .index("by_price", ["price"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
