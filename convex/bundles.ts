import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Bulk insert bundles with duplicate handling.
 * Maps flight uniqueIds to database IDs and returns mapping of bundle uniqueId to database ID.
 */
export const bulkInsertBundles = internalMutation({
  args: {
    bundles: v.array(
      v.object({
        uniqueId: v.string(),
        outboundFlightUniqueIds: v.array(v.string()),
        inboundFlightUniqueIds: v.array(v.string()),
      })
    ),
    flightUniqueIdToDbId: v.record(v.string(), v.id("flights")), // Mapping from flight uniqueId to DB ID
  },
  returns: v.record(v.string(), v.id("bundles")), // bundle uniqueId -> database ID mapping
  handler: async (ctx, args) => {
    const bundleUniqueIdToDbId: Record<string, any> = {};

    for (const bundle of args.bundles) {
      // Check if bundle already exists by uniqueId
      const existingBundle = await ctx.db
        .query("bundles")
        .withIndex("by_uniqueId", (q) => q.eq("uniqueId", bundle.uniqueId))
        .unique();

      if (existingBundle) {
        // Bundle already exists, use existing ID
        bundleUniqueIdToDbId[bundle.uniqueId] = existingBundle._id;
      } else {
        // Map flight uniqueIds to database IDs
        const outboundFlightIds = bundle.outboundFlightUniqueIds
          .map((uniqueId) => args.flightUniqueIdToDbId[uniqueId])
          .filter(Boolean); // Remove any undefined mappings

        const inboundFlightIds = bundle.inboundFlightUniqueIds
          .map((uniqueId) => args.flightUniqueIdToDbId[uniqueId])
          .filter(Boolean); // Remove any undefined mappings

        // Insert new bundle
        const dbId = await ctx.db.insert("bundles", {
          uniqueId: bundle.uniqueId,
          outboundFlightIds,
          inboundFlightIds,
        });
        bundleUniqueIdToDbId[bundle.uniqueId] = dbId;
      }
    }

    return bundleUniqueIdToDbId;
  },
});

/**
 * Get bundles by unique IDs.
 */
export const getBundlesByUniqueIds = query({
  args: {
    uniqueIds: v.array(v.string()),
  },
  returns: v.array(
    v.object({
      _id: v.id("bundles"),
      _creationTime: v.number(),
      uniqueId: v.string(),
      outboundFlightIds: v.array(v.id("flights")),
      inboundFlightIds: v.array(v.id("flights")),
    })
  ),
  handler: async (ctx, args) => {
    const bundles = [];
    for (const uniqueId of args.uniqueIds) {
      const bundle = await ctx.db
        .query("bundles")
        .withIndex("by_uniqueId", (q) => q.eq("uniqueId", uniqueId))
        .unique();
      if (bundle) {
        bundles.push(bundle);
      }
    }
    return bundles;
  },
});

/**
 * Get bundles with flight details for display.
 */
export const getBundlesWithFlights = query({
  args: {
    bundleIds: v.array(v.id("bundles")),
  },
  returns: v.array(
    v.object({
      _id: v.id("bundles"),
      _creationTime: v.number(),
      uniqueId: v.string(),
      outboundFlights: v.array(
        v.object({
          _id: v.id("flights"),
          flightNumber: v.string(),
          departureAirportId: v.id("airports"),
          arrivalAirportId: v.id("airports"),
          departureDateTime: v.number(),
          arrivalDateTime: v.number(),
        })
      ),
      inboundFlights: v.array(
        v.object({
          _id: v.id("flights"),
          flightNumber: v.string(),
          departureAirportId: v.id("airports"),
          arrivalAirportId: v.id("airports"),
          departureDateTime: v.number(),
          arrivalDateTime: v.number(),
        })
      ),
    })
  ),
  handler: async (ctx, args) => {
    const bundlesWithFlights = [];

    for (const bundleId of args.bundleIds) {
      const bundle = await ctx.db.get(bundleId);
      if (!bundle) continue;

      // Get outbound flights
      const outboundFlights = [];
      for (const flightId of bundle.outboundFlightIds) {
        const flight = await ctx.db.get(flightId);
        if (flight) {
          outboundFlights.push(flight);
        }
      }

      // Get inbound flights
      const inboundFlights = [];
      for (const flightId of bundle.inboundFlightIds) {
        const flight = await ctx.db.get(flightId);
        if (flight) {
          inboundFlights.push(flight);
        }
      }

      bundlesWithFlights.push({
        _id: bundle._id,
        _creationTime: bundle._creationTime,
        uniqueId: bundle.uniqueId,
        outboundFlights,
        inboundFlights,
      });
    }

    return bundlesWithFlights;
  },
});

/**
 * Get all bundle unique IDs for duplicate checking.
 */
export const getAllBundleUniqueIds = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx, args) => {
    const bundles = await ctx.db.query("bundles").collect();
    return bundles.map((bundle) => bundle.uniqueId);
  },
});
