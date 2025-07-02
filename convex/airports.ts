import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Search airports by IATA code, name, or city
 */
export const searchAirports = query({
  args: {
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("airports"),
      _creationTime: v.number(),
      iataCode: v.string(),
      icaoCode: v.optional(v.string()),
      name: v.string(),
      city: v.string(),
      country: v.optional(v.string()),
      timezone: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const searchTerm = args.searchTerm.trim().toLowerCase();

    if (searchTerm.length < 2) {
      return [];
    }

    // Search by IATA code first (exact match)
    const iataResults = await ctx.db
      .query("airports")
      .withSearchIndex("search_iataCode", (q) =>
        q.search("iataCode", searchTerm)
      )
      .take(limit);

    // Search by name
    const nameResults = await ctx.db
      .query("airports")
      .withSearchIndex("search_name", (q) => q.search("name", searchTerm))
      .take(limit);

    // Search by city
    const cityResults = await ctx.db
      .query("airports")
      .withSearchIndex("search_city", (q) => q.search("city", searchTerm))
      .take(limit);

    // Combine and deduplicate results
    const allResults = [...iataResults, ...nameResults, ...cityResults];
    const uniqueResults = allResults.filter(
      (airport, index, self) =>
        index === self.findIndex((a) => a._id === airport._id)
    );

    return uniqueResults.slice(0, limit);
  },
});

/**
 * Get airport by IATA code
 */
export const getAirportByIata = query({
  args: { iataCode: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("airports"),
      _creationTime: v.number(),
      iataCode: v.string(),
      icaoCode: v.optional(v.string()),
      name: v.string(),
      city: v.string(),
      country: v.optional(v.string()),
      timezone: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const airport = await ctx.db
      .query("airports")
      .withIndex("by_iataCode", (q) =>
        q.eq("iataCode", args.iataCode.toUpperCase())
      )
      .unique();

    return airport;
  },
});

/**
 * Get popular airports for quick selection
 */
export const getPopularAirports = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("airports"),
      _creationTime: v.number(),
      iataCode: v.string(),
      icaoCode: v.optional(v.string()),
      name: v.string(),
      city: v.string(),
      country: v.optional(v.string()),
      timezone: v.optional(v.string()),
    })
  ),
  handler: async (ctx) => {
    // Popular airports - you can customize this list
    const popularIataCodes = [
      "JFK",
      "LAX",
      "ORD",
      "DFW",
      "ATL",
      "DEN",
      "SFO",
      "LAS",
      "MCO",
      "CLT",
      "LHR",
      "CDG",
      "FRA",
      "AMS",
      "MAD",
      "BCN",
      "FCO",
      "MUC",
      "ZRH",
      "VIE",
    ];

    const airports = [];
    for (const iataCode of popularIataCodes) {
      const airport = await ctx.db
        .query("airports")
        .withIndex("by_iataCode", (q) => q.eq("iataCode", iataCode))
        .unique();

      if (airport) {
        airports.push(airport);
      }
    }

    return airports;
  },
});
