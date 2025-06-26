import { internalQuery, query } from "./_generated/server";
import { v } from "convex/values";

export const getAirline = query({
  args: { id: v.id("airlines") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getAirport = query({
  args: { id: v.id("airports") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getFlight = query({
  args: { id: v.id("flights") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getDetailedFlight = query({
  args: { id: v.id("flights") },
  handler: async (ctx, args) => {
    const flight = await ctx.db.get(args.id);
    if (!flight) return null;
    const airline = await ctx.db.get(flight.airline);
    const from = await ctx.db.get(flight.from);
    const to = await ctx.db.get(flight.to);
    if (!airline || !from || !to) return null;
    return { ...flight, airline, from, to };
  },
});

export const getAirlineByUniqueId = internalQuery({
  args: {
    uniqueId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("airlines")
      .withIndex("by_uniqueId", (q) => q.eq("uniqueId", args.uniqueId))
      .unique();
  },
});

export const getAirportByUniqueId = internalQuery({
  args: {
    uniqueId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("airports")
      .withIndex("by_uniqueId", (q) => q.eq("uniqueId", args.uniqueId))
      .unique();
  },
});

export const getFlightByUniqueId = internalQuery({
  args: {
    uniqueId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("flights")
      .withIndex("by_uniqueId", (q) => q.eq("uniqueId", args.uniqueId))
      .unique();
  },
});

export const getDealByUniqueId = internalQuery({
  args: {
    uniqueId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("deals")
      .withIndex("by_uniqueId", (q) => q.eq("uniqueId", args.uniqueId))
      .unique();
  },
});

export const searchAirports = query({
  args: {
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const searchTerm = args.searchTerm.trim();
    if (!searchTerm) return [];

    // IATA code exact match (case-insensitive)
    const iataMatches = await ctx.db
      .query("airports")
      .withIndex("by_uniqueId", (q) => q.eq("uniqueId", searchTerm.toUpperCase()))
      .take(limit);
    if (iataMatches.length >= limit) {
      return iataMatches.map(airport => ({
        id: airport._id,
        name: airport.name,
        iata_code: airport.iata_code,
        municipality: airport.municipality || "",
        iso_country: airport.iso_country,
      }));
    }

    // Full text search on all relevant fields
    const [nameResults, iataResults, municipalityResults, countryResults] = await Promise.all([
      ctx.db.query("airports").withSearchIndex("search_name", (q) => q.search("name", searchTerm)).take(limit),
      ctx.db.query("airports").withSearchIndex("search_iata_code", (q) => q.search("iata_code", searchTerm)).take(limit),
      ctx.db.query("airports").withSearchIndex("search_municipality", (q) => q.search("municipality", searchTerm)).take(limit),
      ctx.db.query("airports").withSearchIndex("search_iso_country", (q) => q.search("iso_country", searchTerm)).take(limit),
    ]);

    // Combine and deduplicate
    const allResults = [
      ...iataMatches,
      ...nameResults,
      ...iataResults,
      ...municipalityResults,
      ...countryResults,
    ];
    const uniqueResults = allResults.filter((airport, index, self) =>
      index === self.findIndex(a => a._id === airport._id)
    );

    return uniqueResults.slice(0, limit).map(airport => ({
      id: airport._id,
      name: airport.name,
      iata_code: airport.iata_code,
      municipality: airport.municipality || "",
      iso_country: airport.iso_country,
    }));
  },
});
