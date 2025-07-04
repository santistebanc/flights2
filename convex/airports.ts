import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Search airports with priority-based matching as specified in PRD
 * Priority order:
 * 1. IATA code exact match (highest priority)
 * 2. Recently used airports (from localStorage history, second priority) - handled in frontend
 * 3. Popular airports (based on popularity score, third priority)
 * 4. IATA code search (starts with)
 * 5. Airport name
 * 6. City name
 * 7. Country name (lowest priority)
 */
export const searchAirports = query({
  args: {
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("airports"),
      iataCode: v.string(),
      name: v.string(),
      city: v.string(),
      country: v.optional(v.string()),
      popularityScore: v.optional(v.number()),
      matchType: v.union(
        v.literal("iata"),
        v.literal("name"),
        v.literal("city"),
        v.literal("country")
      ),
    })
  ),
  handler: async (ctx, args) => {
    const searchTerm = args.searchTerm.trim();
    const limit = args.limit || 10;

    if (searchTerm.length === 0) {
      return [];
    }

    const results: Array<{
      _id: any;
      iataCode: string;
      name: string;
      city: string;
      country?: string;
      popularityScore?: number;
      matchType: "iata" | "name" | "city" | "country";
    }> = [];

    // Priority 1: Exact IATA code match (case-insensitive)
    if (searchTerm.length === 3) {
      const iataMatches = await ctx.db
        .query("airports")
        .withIndex("by_iataCode", (q) =>
          q.eq("iataCode", searchTerm.toUpperCase())
        )
        .take(limit);

      results.push(
        ...iataMatches.map((airport) => ({
          _id: airport._id,
          iataCode: airport.iataCode,
          name: airport.name,
          city: airport.city,
          country: airport.country,
          popularityScore: airport.popularityScore,
          matchType: "iata" as const,
        }))
      );
    }

    // Priority 2: Recently used airports - handled in frontend (AirportAutocomplete component)
    // This is implemented in the frontend using localStorage history

    // Priority 3: Popular airports (based on popularity score)
    if (results.length < limit) {
      const popularAirports = await ctx.db
        .query("airports")
        .withIndex(
          "by_popularityScore",
          (q) => q.gte("popularityScore", 700) // Major and large international airports
        )
        .order("desc")
        .take(limit - results.length);

      for (const airport of popularAirports) {
        if (!results.some((r) => r._id === airport._id)) {
          results.push({
            _id: airport._id,
            iataCode: airport.iataCode,
            name: airport.name,
            city: airport.city,
            country: airport.country,
            popularityScore: airport.popularityScore,
            matchType: "iata" as const, // Popular airports are typically found by IATA
          });
        }
      }
    }

    // Priority 4: IATA code starts with search term
    if (results.length < limit) {
      const iataStartsWith = await ctx.db
        .query("airports")
        .withSearchIndex("search_iataCode", (q) =>
          q.search("iataCode", searchTerm)
        )
        .take(limit - results.length);

      for (const airport of iataStartsWith) {
        if (!results.some((r) => r._id === airport._id)) {
          results.push({
            _id: airport._id,
            iataCode: airport.iataCode,
            name: airport.name,
            city: airport.city,
            country: airport.country,
            popularityScore: airport.popularityScore,
            matchType: "iata" as const,
          });
        }
      }
    }

    // Priority 5: Airport name matches
    if (results.length < limit) {
      const nameMatches = await ctx.db
        .query("airports")
        .withSearchIndex("search_name", (q) => q.search("name", searchTerm))
        .take(limit - results.length);

      for (const airport of nameMatches) {
        if (!results.some((r) => r._id === airport._id)) {
          results.push({
            _id: airport._id,
            iataCode: airport.iataCode,
            name: airport.name,
            city: airport.city,
            country: airport.country,
            popularityScore: airport.popularityScore,
            matchType: "name" as const,
          });
        }
      }
    }

    // Priority 6: City name matches
    if (results.length < limit) {
      const cityMatches = await ctx.db
        .query("airports")
        .withSearchIndex("search_city", (q) => q.search("city", searchTerm))
        .take(limit - results.length);

      for (const airport of cityMatches) {
        if (!results.some((r) => r._id === airport._id)) {
          results.push({
            _id: airport._id,
            iataCode: airport.iataCode,
            name: airport.name,
            city: airport.city,
            country: airport.country,
            popularityScore: airport.popularityScore,
            matchType: "city" as const,
          });
        }
      }
    }

    // Priority 7: Country name matches (lowest priority)
    if (results.length < limit && searchTerm.length > 2) {
      const countryMatches = await ctx.db
        .query("airports")
        .withSearchIndex("search_country", (q) =>
          q.search("country", searchTerm)
        )
        .take(limit - results.length);

      for (const airport of countryMatches) {
        if (!results.some((r) => r._id === airport._id)) {
          results.push({
            _id: airport._id,
            iataCode: airport.iataCode,
            name: airport.name,
            city: airport.city,
            country: airport.country,
            popularityScore: airport.popularityScore,
            matchType: "country" as const,
          });
        }
      }
    }

    // Sort results by popularity score within each match type category as specified in PRD
    return results.slice(0, limit).sort((a, b) => {
      // First sort by match type priority
      const typePriority = { iata: 1, name: 2, city: 3, country: 4 };
      const aPriority = typePriority[a.matchType];
      const bPriority = typePriority[b.matchType];

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      // Then sort by popularity score (descending) within each match type
      const aScore = a.popularityScore || 0;
      const bScore = b.popularityScore || 0;
      return bScore - aScore;
    });
  },
});

/**
 * Get airport by IATA code
 */
export const getAirportByIata = query({
  args: {
    iataCode: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("airports"),
      iataCode: v.string(),
      name: v.string(),
      city: v.string(),
      country: v.optional(v.string()),
      popularityScore: v.optional(v.number()),
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

    if (!airport) {
      return null;
    }

    return {
      _id: airport._id,
      iataCode: airport.iataCode,
      name: airport.name,
      city: airport.city,
      country: airport.country,
      popularityScore: airport.popularityScore,
    };
  },
});
