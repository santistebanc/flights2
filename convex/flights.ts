import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { ScrapedFlight } from "../types/scraper";

/**
 * Bulk insert flights with duplicate handling.
 * Returns mapping of uniqueId to database ID for use in bundle creation.
 */
export const bulkInsertFlights = internalMutation({
  args: {
    flights: v.array(
      v.object({
        uniqueId: v.string(),
        flightNumber: v.string(),
        departureAirportId: v.id("airports"),
        arrivalAirportId: v.id("airports"),
        departureDateTime: v.number(),
        arrivalDateTime: v.number(),
      })
    ),
  },
  returns: v.record(v.string(), v.id("flights")), // uniqueId -> database ID mapping
  handler: async (ctx, args) => {
    const uniqueIdToDbId: Record<string, any> = {};

    for (const flight of args.flights) {
      // Check if flight already exists by uniqueId
      const existingFlight = await ctx.db
        .query("flights")
        .withIndex("by_uniqueId", (q) => q.eq("uniqueId", flight.uniqueId))
        .unique();

      if (existingFlight) {
        // Flight already exists, use existing ID
        uniqueIdToDbId[flight.uniqueId] = existingFlight._id;
      } else {
        // Insert new flight
        const dbId = await ctx.db.insert("flights", {
          uniqueId: flight.uniqueId,
          flightNumber: flight.flightNumber,
          departureAirportId: flight.departureAirportId,
          arrivalAirportId: flight.arrivalAirportId,
          departureDateTime: flight.departureDateTime,
          arrivalDateTime: flight.arrivalDateTime,
        });
        uniqueIdToDbId[flight.uniqueId] = dbId;
      }
    }

    return uniqueIdToDbId;
  },
});

/**
 * Get flights by unique IDs.
 */
export const getFlightsByUniqueIds = query({
  args: {
    uniqueIds: v.array(v.string()),
  },
  returns: v.array(
    v.object({
      _id: v.id("flights"),
      _creationTime: v.number(),
      uniqueId: v.string(),
      flightNumber: v.string(),
      departureAirportId: v.id("airports"),
      arrivalAirportId: v.id("airports"),
      departureDateTime: v.number(),
      arrivalDateTime: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const flights = [];
    for (const uniqueId of args.uniqueIds) {
      const flight = await ctx.db
        .query("flights")
        .withIndex("by_uniqueId", (q) => q.eq("uniqueId", uniqueId))
        .unique();
      if (flight) {
        flights.push(flight);
      }
    }
    return flights;
  },
});

/**
 * Get flights by date range and airports.
 */
export const getFlightsByDateRangeAndAirports = query({
  args: {
    departureAirportId: v.id("airports"),
    arrivalAirportId: v.id("airports"),
    startDate: v.number(),
    endDate: v.number(),
  },
  returns: v.array(
    v.object({
      _id: v.id("flights"),
      _creationTime: v.number(),
      uniqueId: v.string(),
      flightNumber: v.string(),
      departureAirportId: v.id("airports"),
      arrivalAirportId: v.id("airports"),
      departureDateTime: v.number(),
      arrivalDateTime: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("flights")
      .withIndex("by_departureAirportId_and_departureDateTime", (q) =>
        q
          .eq("departureAirportId", args.departureAirportId)
          .gte("departureDateTime", args.startDate)
          .lte("departureDateTime", args.endDate)
      )
      .filter((q) => q.eq(q.field("arrivalAirportId"), args.arrivalAirportId))
      .collect();
  },
});

/**
 * Get all flight unique IDs for duplicate checking.
 */
export const getAllFlightUniqueIds = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx, args) => {
    const flights = await ctx.db.query("flights").collect();
    return flights.map((flight) => flight.uniqueId);
  },
});
