import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import {
  ScrapedFlight,
  ScrapedBundle,
  ScrapedBookingOption,
} from "../types/scraper";
import { internal } from "./_generated/api";

/**
 * Process scraped data and insert into database.
 * This is the main function that orchestrates the database insertion process.
 */
export const processAndInsertScrapedData = internalMutation({
  args: {
    flights: v.array(
      v.object({
        uniqueId: v.string(),
        flightNumber: v.string(),
        departureAirportIataCode: v.string(),
        arrivalAirportIataCode: v.string(),
        departureDate: v.string(), // YYYY-MM-DD format
        departureTime: v.string(), // HH:MM format
        duration: v.number(), // duration in minutes
      })
    ),
    bundles: v.array(
      v.object({
        uniqueId: v.string(),
        outboundFlightUniqueIds: v.array(v.string()),
        inboundFlightUniqueIds: v.array(v.string()),
      })
    ),
    bookingOptions: v.array(
      v.object({
        uniqueId: v.string(),
        targetUniqueId: v.string(),
        agency: v.string(),
        price: v.number(),
        linkToBook: v.string(),
        currency: v.string(),
        extractedAt: v.number(),
      })
    ),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    flightsInserted: v.number(),
    bundlesInserted: v.number(),
    bookingOptionsInserted: v.number(),
    bookingOptionsReplaced: v.number(),
  }),
  handler: async (ctx, args) => {
    try {
      // Step 1: Look up airport IDs for all flights
      const airportIdMapping = await ctx.runQuery(
        internal.data_processing.getAirportIdMapping,
        {
          iataCodes: [
            ...new Set([
              ...args.flights.map((f) => f.departureAirportIataCode),
              ...args.flights.map((f) => f.arrivalAirportIataCode),
            ]),
          ],
        }
      );

      // Step 2: Convert flights to database format with proper datetime calculation
      const flightsForDb = await Promise.all(
        args.flights
          .filter(
            (flight) =>
              airportIdMapping[flight.departureAirportIataCode] &&
              airportIdMapping[flight.arrivalAirportIataCode]
          )
          .map(async (flight) => {
            // Get departure airport timezone
            const departureAirport = await ctx.db.get(
              airportIdMapping[flight.departureAirportIataCode]
            );
            // Convert timezone string to offset (e.g., "UTC+2" -> 120 minutes)
            let timezoneOffset = 0; // Default to UTC
            if (departureAirport?.timezone) {
              const timezoneMatch =
                departureAirport.timezone.match(/UTC([+-]\d+)/);
              if (timezoneMatch) {
                timezoneOffset = parseInt(timezoneMatch[1]) * 60; // Convert hours to minutes
              }
            }

            // Build departure datetime: combine date, time, and apply timezone offset
            const departureDateTimeStr = `${flight.departureDate}T${flight.departureTime}:00`;
            const departureDateTime =
              new Date(departureDateTimeStr).getTime() -
              timezoneOffset * 60 * 1000;

            // Calculate arrival datetime by adding duration
            const arrivalDateTime =
              departureDateTime + flight.duration * 60 * 1000;

            return {
              uniqueId: flight.uniqueId,
              flightNumber: flight.flightNumber,
              departureAirportId:
                airportIdMapping[flight.departureAirportIataCode],
              arrivalAirportId: airportIdMapping[flight.arrivalAirportIataCode],
              departureDateTime,
              arrivalDateTime,
            };
          })
      );

      // Step 3: Insert flights and get ID mapping
      const flightUniqueIdToDbId = await ctx.runMutation(
        internal.flights.bulkInsertFlights,
        { flights: flightsForDb }
      );

      // Step 4: Insert bundles and get ID mapping
      const bundleUniqueIdToDbId = await ctx.runMutation(
        internal.bundles.bulkInsertBundles,
        {
          bundles: args.bundles,
          flightUniqueIdToDbId: flightUniqueIdToDbId,
        }
      );

      // Step 5: Insert booking options
      const bookingOptionsResult = await ctx.runMutation(
        internal.bookingOptions.bulkInsertBookingOptions,
        {
          bookingOptions: args.bookingOptions,
          bundleUniqueIdToDbId: bundleUniqueIdToDbId,
        }
      );

      return {
        success: true,
        message: `Successfully processed and inserted scraped data`,
        flightsInserted: flightsForDb.length,
        bundlesInserted: args.bundles.length,
        bookingOptionsInserted: bookingOptionsResult.inserted,
        bookingOptionsReplaced: bookingOptionsResult.replaced,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        message: `Failed to process and insert scraped data: ${errorMessage}`,
        flightsInserted: 0,
        bundlesInserted: 0,
        bookingOptionsInserted: 0,
        bookingOptionsReplaced: 0,
      };
    }
  },
});

/**
 * Get airport ID mapping for IATA codes.
 */
export const getAirportIdMapping = internalQuery({
  args: {
    iataCodes: v.array(v.string()),
  },
  returns: v.record(v.string(), v.id("airports")),
  handler: async (ctx, args) => {
    const mapping: Record<string, any> = {};

    for (const iataCode of args.iataCodes) {
      const airport = await ctx.db
        .query("airports")
        .withIndex("by_iataCode", (q) => q.eq("iataCode", iataCode))
        .unique();

      if (airport) {
        mapping[iataCode] = airport._id;
      }
    }

    return mapping;
  },
});
