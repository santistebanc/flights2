import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

/**
 * Bulk insert bundles with duplicate handling.
 * Maps flight uniqueIds to database IDs and returns mapping of bundle uniqueId to database ID.
 */
export const bulkInsertBundles = internalMutation({
  args: {
    bundles: v.array(
      v.object({
        uniqueId: v.string(),
        searchId: v.string(),
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
          searchId: bundle.searchId,
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
      searchId: v.optional(v.string()),
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
      searchId: v.optional(v.string()),
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
        searchId: bundle.searchId,
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

/**
 * Get bundles for a search (by departure/arrival IATA and dates), including flights and booking options.
 * This function now uses getBundlesBySearchId for efficient searching.
 */
export const getBundlesForSearch = query({
  args: {
    departureIata: v.string(),
    arrivalIata: v.string(),
    departureDate: v.string(), // YYYY-MM-DD
    returnDate: v.optional(v.string()), // YYYY-MM-DD or undefined
    isRoundTrip: v.boolean(),
  },
  returns: v.array(
    v.object({
      _id: v.id("bundles"),
      uniqueId: v.string(),
      searchId: v.optional(v.string()),
      outboundFlights: v.array(
        v.object({
          _id: v.id("flights"),
          flightNumber: v.string(),
          departureAirport: v.object({
            _id: v.id("airports"),
            iataCode: v.string(),
            name: v.string(),
            city: v.string(),
          }),
          arrivalAirport: v.object({
            _id: v.id("airports"),
            iataCode: v.string(),
            name: v.string(),
            city: v.string(),
          }),
          departureDateTime: v.number(),
          arrivalDateTime: v.number(),
        })
      ),
      inboundFlights: v.array(
        v.object({
          _id: v.id("flights"),
          flightNumber: v.string(),
          departureAirport: v.object({
            _id: v.id("airports"),
            iataCode: v.string(),
            name: v.string(),
            city: v.string(),
          }),
          arrivalAirport: v.object({
            _id: v.id("airports"),
            iataCode: v.string(),
            name: v.string(),
            city: v.string(),
          }),
          departureDateTime: v.number(),
          arrivalDateTime: v.number(),
        })
      ),
      bookingOptions: v.array(
        v.object({
          _id: v.id("bookingOptions"),
          agency: v.string(),
          price: v.number(),
          currency: v.string(),
          linkToBook: v.string(),
          extractedAt: v.number(),
        })
      ),
    })
  ),
  handler: async (ctx, args) => {
    // Step 1: Generate searchId from the search parameters
    const departureDateTime = new Date(
      args.departureDate + "T00:00:00Z"
    ).getTime();
    const returnDateTime =
      args.isRoundTrip && args.returnDate
        ? new Date(args.returnDate + "T00:00:00Z").getTime()
        : 0;

    const searchId = `${args.departureIata}_${departureDateTime}_${args.arrivalIata}_${returnDateTime}`;

    // Step 2: Try to find bundles using the searchId first (for new bundles)
    let bundles = await ctx.db
      .query("bundles")
      .withIndex("by_searchId", (q) => q.eq("searchId", searchId))
      .take(500);

    // Step 3: If no bundles found by searchId, fall back to the old logic (for existing bundles without searchId)
    if (bundles.length === 0) {
      // Find airport IDs for the given IATA codes
      const depAirport = await ctx.db
        .query("airports")
        .withIndex("by_iataCode", (q) => q.eq("iataCode", args.departureIata))
        .unique();
      const arrAirport = await ctx.db
        .query("airports")
        .withIndex("by_iataCode", (q) => q.eq("iataCode", args.arrivalIata))
        .unique();
      if (!depAirport || !arrAirport) return [];

      // Helper function to get start/end of day
      const startOfDay = (dateStr: string) =>
        new Date(dateStr + "T00:00:00Z").getTime();
      const endOfDay = (dateStr: string) =>
        new Date(dateStr + "T23:59:59Z").getTime();

      // Get bundles without searchId and filter them
      const allBundles = await ctx.db
        .query("bundles")
        .filter((q) => q.eq(q.field("searchId"), undefined))
        .collect();

      for (const bundle of allBundles) {
        // Only get first and last outbound flights for criteria checking
        const firstOutboundId = bundle.outboundFlightIds[0];
        const lastOutboundId =
          bundle.outboundFlightIds[bundle.outboundFlightIds.length - 1];

        if (!firstOutboundId || !lastOutboundId) continue;

        // Get first outbound flight
        const firstOutboundFlight = await ctx.db.get(firstOutboundId);
        if (!firstOutboundFlight) continue;
        const firstOutboundDep = await ctx.db.get(
          firstOutboundFlight.departureAirportId
        );
        if (!firstOutboundDep) continue;

        // Get last outbound flight
        const lastOutboundFlight = await ctx.db.get(lastOutboundId);
        if (!lastOutboundFlight) continue;
        const lastOutboundArr = await ctx.db.get(
          lastOutboundFlight.arrivalAirportId
        );
        if (!lastOutboundArr) continue;

        // Check outbound criteria
        const outboundMatch =
          firstOutboundDep.iataCode === args.departureIata &&
          firstOutboundFlight.departureDateTime >=
            startOfDay(args.departureDate) &&
          firstOutboundFlight.departureDateTime <=
            endOfDay(args.departureDate) &&
          lastOutboundArr.iataCode === args.arrivalIata;

        // For round trips, check inbound criteria
        let inboundMatch = true;

        if (args.isRoundTrip && args.returnDate) {
          const firstInboundId = bundle.inboundFlightIds[0];
          const lastInboundId =
            bundle.inboundFlightIds[bundle.inboundFlightIds.length - 1];

          if (!firstInboundId || !lastInboundId) {
            inboundMatch = false;
          } else {
            const firstInboundFlight = await ctx.db.get(firstInboundId);
            const firstInboundDep = firstInboundFlight
              ? await ctx.db.get(firstInboundFlight.departureAirportId)
              : null;

            const lastInboundFlight = await ctx.db.get(lastInboundId);
            const lastInboundArr = lastInboundFlight
              ? await ctx.db.get(lastInboundFlight.arrivalAirportId)
              : null;

            inboundMatch =
              !!firstInboundFlight &&
              !!lastInboundFlight &&
              !!firstInboundDep &&
              !!lastInboundArr &&
              firstInboundDep.iataCode === args.arrivalIata &&
              firstInboundFlight.departureDateTime >=
                startOfDay(args.returnDate) &&
              firstInboundFlight.departureDateTime <=
                endOfDay(args.returnDate) &&
              lastInboundArr.iataCode === args.departureIata;
          }
        }

        if (outboundMatch && inboundMatch) {
          bundles.push(bundle);
        }
      }
    }

    // Step 4: Build the response with full flight and booking option details
    const matchingBundles = [];

    for (const bundle of bundles) {
      // Build complete flight objects for the response
      const outboundFlights = [];
      for (const fid of bundle.outboundFlightIds) {
        const f = await ctx.db.get(fid);
        if (!f) continue;
        const dep = await ctx.db.get(f.departureAirportId);
        const arr = await ctx.db.get(f.arrivalAirportId);
        if (!dep || !arr) continue;
        outboundFlights.push({
          _id: f._id,
          flightNumber: f.flightNumber,
          departureAirport: {
            _id: dep._id,
            iataCode: dep.iataCode,
            name: dep.name,
            city: dep.city,
          },
          arrivalAirport: {
            _id: arr._id,
            iataCode: arr.iataCode,
            name: arr.name,
            city: arr.city,
          },
          departureDateTime: f.departureDateTime,
          arrivalDateTime: f.arrivalDateTime,
        });
      }

      const inboundFlights = [];
      for (const fid of bundle.inboundFlightIds) {
        const f = await ctx.db.get(fid);
        if (!f) continue;
        const dep = await ctx.db.get(f.departureAirportId);
        const arr = await ctx.db.get(f.arrivalAirportId);
        if (!dep || !arr) continue;
        inboundFlights.push({
          _id: f._id,
          flightNumber: f.flightNumber,
          departureAirport: {
            _id: dep._id,
            iataCode: dep.iataCode,
            name: dep.name,
            city: dep.city,
          },
          arrivalAirport: {
            _id: arr._id,
            iataCode: arr.iataCode,
            name: arr.name,
            city: arr.city,
          },
          departureDateTime: f.departureDateTime,
          arrivalDateTime: f.arrivalDateTime,
        });
      }

      // Booking options
      const bookingOptions = await ctx.db
        .query("bookingOptions")
        .withIndex("by_targetId", (q) => q.eq("targetId", bundle._id))
        .order("asc")
        .collect();

      matchingBundles.push({
        _id: bundle._id,
        uniqueId: bundle.uniqueId,
        searchId: bundle.searchId,
        outboundFlights,
        inboundFlights,
        bookingOptions: bookingOptions.map((bo) => ({
          _id: bo._id,
          agency: bo.agency,
          price: bo.price,
          currency: bo.currency,
          linkToBook: bo.linkToBook,
          extractedAt: bo.extractedAt,
        })),
      });
    }

    return matchingBundles;
  },
});

/**
 * Get bundles by searchId for efficient search matching.
 */
export const getBundlesBySearchId = query({
  args: {
    searchId: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id("bundles"),
      _creationTime: v.number(),
      uniqueId: v.string(),
      searchId: v.optional(v.string()),
      outboundFlightIds: v.array(v.id("flights")),
      inboundFlightIds: v.array(v.id("flights")),
    })
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bundles")
      .withIndex("by_searchId", (q) => q.eq("searchId", args.searchId))
      .collect();
  },
});

/**
 * Generate searchId from search parameters.
 * This can be used to search for bundles matching specific criteria.
 */
export const generateSearchId = query({
  args: {
    departureIata: v.string(),
    arrivalIata: v.string(),
    departureDate: v.string(), // YYYY-MM-DD
    returnDate: v.optional(v.string()), // YYYY-MM-DD or undefined
    isRoundTrip: v.boolean(),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    // Convert dates to timestamps (start of day in UTC)
    const departureDateTime = new Date(
      args.departureDate + "T00:00:00Z"
    ).getTime();
    const returnDateTime =
      args.isRoundTrip && args.returnDate
        ? new Date(args.returnDate + "T00:00:00Z").getTime()
        : 0;

    return `${args.departureIata}_${departureDateTime}_${args.arrivalIata}_${returnDateTime}`;
  },
});
