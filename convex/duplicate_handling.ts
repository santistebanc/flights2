import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get all existing flight unique IDs for duplicate checking.
 */
export const getExistingFlightUniqueIds = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const flights = await ctx.db.query("flights").collect();
    return flights.map((flight) => flight.uniqueId);
  },
});

/**
 * Get all existing bundle unique IDs for duplicate checking.
 */
export const getExistingBundleUniqueIds = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const bundles = await ctx.db.query("bundles").collect();
    return bundles.map((bundle) => bundle.uniqueId);
  },
});

/**
 * Get all existing booking option unique IDs for duplicate checking.
 */
export const getExistingBookingOptionUniqueIds = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const bookingOptions = await ctx.db.query("bookingOptions").collect();
    return bookingOptions.map((booking) => booking.uniqueId);
  },
});

/**
 * Get existing unique IDs for all entity types in a single query.
 * This is more efficient than making separate queries.
 */
export const getAllExistingUniqueIds = query({
  args: {},
  returns: v.object({
    flightIds: v.array(v.string()),
    bundleIds: v.array(v.string()),
    bookingOptionIds: v.array(v.string()),
  }),
  handler: async (ctx) => {
    const [flights, bundles, bookingOptions] = await Promise.all([
      ctx.db.query("flights").collect(),
      ctx.db.query("bundles").collect(),
      ctx.db.query("bookingOptions").collect(),
    ]);

    return {
      flightIds: flights.map((flight) => flight.uniqueId),
      bundleIds: bundles.map((bundle) => bundle.uniqueId),
      bookingOptionIds: bookingOptions.map((booking) => booking.uniqueId),
    };
  },
});

/**
 * Get existing unique IDs filtered by date range for more targeted duplicate checking.
 */
export const getExistingUniqueIdsByDateRange = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  returns: v.object({
    flightIds: v.array(v.string()),
    bundleIds: v.array(v.string()),
    bookingOptionIds: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    // Get flights within the date range
    const flights = await ctx.db
      .query("flights")
      .withIndex("by_departureDateTime", (q) =>
        q
          .gte("departureDateTime", args.startDate)
          .lte("departureDateTime", args.endDate)
      )
      .collect();

    // Get bundles that reference these flights
    const flightIds = flights.map((f) => f._id);
    const bundles = await ctx.db.query("bundles").collect();
    const relevantBundles = bundles.filter(
      (bundle) =>
        bundle.outboundFlightIds.some((id) => flightIds.includes(id)) ||
        bundle.inboundFlightIds.some((id) => flightIds.includes(id))
    );

    // Get booking options for these bundles
    const bundleIds = relevantBundles.map((b) => b._id);
    const allBookingOptions = await ctx.db.query("bookingOptions").collect();
    const bookingOptions = allBookingOptions.filter((booking) =>
      bundleIds.includes(booking.targetId)
    );

    return {
      flightIds: flights.map((flight) => flight.uniqueId),
      bundleIds: relevantBundles.map((bundle) => bundle.uniqueId),
      bookingOptionIds: bookingOptions.map((booking) => booking.uniqueId),
    };
  },
});

/**
 * Get existing unique IDs filtered by airports for more targeted duplicate checking.
 */
export const getExistingUniqueIdsByAirports = query({
  args: {
    departureAirportId: v.id("airports"),
    arrivalAirportId: v.id("airports"),
  },
  returns: v.object({
    flightIds: v.array(v.string()),
    bundleIds: v.array(v.string()),
    bookingOptionIds: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    // Get flights between the specified airports
    const flights = await ctx.db
      .query("flights")
      .withIndex("by_departureAirportId_and_departureDateTime", (q) =>
        q.eq("departureAirportId", args.departureAirportId)
      )
      .collect();

    const relevantFlights = flights.filter(
      (flight) => flight.arrivalAirportId === args.arrivalAirportId
    );

    // Get bundles that reference these flights
    const flightIds = relevantFlights.map((f) => f._id);
    const bundles = await ctx.db.query("bundles").collect();
    const relevantBundles = bundles.filter(
      (bundle) =>
        bundle.outboundFlightIds.some((id) => flightIds.includes(id)) ||
        bundle.inboundFlightIds.some((id) => flightIds.includes(id))
    );

    // Get booking options for these bundles
    const bundleIds = relevantBundles.map((b) => b._id);
    const allBookingOptions = await ctx.db.query("bookingOptions").collect();
    const bookingOptions = allBookingOptions.filter((booking) =>
      bundleIds.includes(booking.targetId)
    );

    return {
      flightIds: relevantFlights.map((flight) => flight.uniqueId),
      bundleIds: relevantBundles.map((bundle) => bundle.uniqueId),
      bookingOptionIds: bookingOptions.map((booking) => booking.uniqueId),
    };
  },
});
