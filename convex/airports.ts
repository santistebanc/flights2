import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Search airports with priority-based matching
 * Priority order: IATA code > Airport name > City name > Country name
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
          matchType: "iata" as const,
        }))
      );
    }

    // Priority 2: IATA code starts with search term
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
            matchType: "iata" as const,
          });
        }
      }
    }

    // Priority 3: Airport name matches
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
            matchType: "name" as const,
          });
        }
      }
    }

    // Priority 4: City name matches
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
            matchType: "city" as const,
          });
        }
      }
    }

    // Priority 5: Country name matches
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
            matchType: "country" as const,
          });
        }
      }
    }

    return results.slice(0, limit);
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
    };
  },
});
