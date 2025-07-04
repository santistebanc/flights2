import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import {
  ScrapedFlight,
  ScrapedBundle,
  ScrapedBookingOption,
  ScrapeResult,
} from "../types/scraper";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";

// Extended flight interface that includes departure date
interface FlightWithDate extends ScrapedFlight {
  departureDate: string; // YYYY-MM-DD format
}

/**
 * Calculate the actual departure date for a flight based on connection duration
 */
export function calculateFlightDepartureDate(
  baseDate: string, // YYYY-MM-DD format
  flightIndex: number,
  flights: ScrapedFlight[]
): string {
  if (flightIndex === 0) {
    // First flight departs on the base date
    return baseDate;
  }

  // Calculate total connection time from previous flights
  let totalConnectionMinutes = 0;
  for (let i = 0; i < flightIndex; i++) {
    const previousFlight = flights[i];
    const connectionDuration =
      previousFlight.connectionDurationFromPreviousFlight || 0;
    totalConnectionMinutes += connectionDuration;
  }

  // Calculate how many days to add
  const daysToAdd = Math.floor(totalConnectionMinutes / (24 * 60));

  if (daysToAdd === 0) {
    // Same day departure
    return baseDate;
  }

  // Add days to the base date
  const baseDateObj = new Date(baseDate);
  baseDateObj.setDate(baseDateObj.getDate() + daysToAdd);

  // Format back to YYYY-MM-DD
  const year = baseDateObj.getFullYear();
  const month = String(baseDateObj.getMonth() + 1).padStart(2, "0");
  const day = String(baseDateObj.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Process scraped data and insert into database.
 * This is the main function that orchestrates the database insertion process.
 */
export const processAndInsertScrapedData = internalMutation({
  args: {
    scrapeResult: v.object({
      bundles: v.array(
        v.object({
          outboundDate: v.string(),
          inboundDate: v.string(),
          outboundFlights: v.array(
            v.object({
              flightNumber: v.string(),
              departureAirportIataCode: v.string(),
              arrivalAirportIataCode: v.string(),
              departureTime: v.string(),
              duration: v.number(),
              connectionDurationFromPreviousFlight: v.optional(v.number()),
            })
          ),
          inboundFlights: v.array(
            v.object({
              flightNumber: v.string(),
              departureAirportIataCode: v.string(),
              arrivalAirportIataCode: v.string(),
              departureTime: v.string(),
              duration: v.number(),
              connectionDurationFromPreviousFlight: v.optional(v.number()),
            })
          ),
          bookingOptions: v.array(
            v.object({
              agency: v.string(),
              price: v.number(),
              linkToBook: v.string(),
              currency: v.string(),
              extractedAt: v.number(),
            })
          ),
        })
      ),
    }),
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
      // Extract all flights from bundles with proper date calculation
      const allFlights: FlightWithDate[] = [];
      const allBookingOptions: ScrapedBookingOption[] = [];

      args.scrapeResult.bundles.forEach((bundle) => {
        // Calculate departure dates for outbound flights
        bundle.outboundFlights.forEach((flight, flightIndex) => {
          const departureDate = calculateFlightDepartureDate(
            bundle.outboundDate,
            flightIndex,
            bundle.outboundFlights
          );

          allFlights.push({
            ...flight,
            departureDate,
          });
        });

        // Calculate departure dates for inbound flights
        bundle.inboundFlights.forEach((flight, flightIndex) => {
          const departureDate = calculateFlightDepartureDate(
            bundle.inboundDate,
            flightIndex,
            bundle.inboundFlights
          );

          allFlights.push({
            ...flight,
            departureDate,
          });
        });

        // Add booking options
        allBookingOptions.push(...bundle.bookingOptions);
      });

      // Step 1: Look up airport IDs for all flights
      const airportIdMapping: Record<
        string,
        Id<"airports">
      > = await ctx.runQuery(internal.data_processing.getAirportIdMapping, {
        iataCodes: [
          ...new Set([
            ...allFlights.map((f) => f.departureAirportIataCode),
            ...allFlights.map((f) => f.arrivalAirportIataCode),
          ]),
        ],
      });

      // Step 2: Convert flights to database format with proper datetime calculation
      const flightsForDb = await Promise.all(
        allFlights
          .filter(
            (flight) =>
              airportIdMapping[flight.departureAirportIataCode] &&
              airportIdMapping[flight.arrivalAirportIataCode]
          )
          .map(async (flight) => {
            // Get departure airport timezone
            const departureAirport: Doc<"airports"> | null = await ctx.db.get(
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
              uniqueId: `flight_${flight.flightNumber}_${flight.departureAirportIataCode}_${flight.arrivalAirportIataCode}`,
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
      const flightUniqueIdToDbId: Record<
        string,
        Id<"flights">
      > = await ctx.runMutation(internal.flights.bulkInsertFlights, {
        flights: flightsForDb,
      });

      // Step 4: Convert bundles to database format
      const bundlesForDb = args.scrapeResult.bundles.map(
        (bundle, bundleIndex) => {
          const outboundFlightUniqueIds: string[] = [];
          const inboundFlightUniqueIds: string[] = [];

          // Map outbound flights
          bundle.outboundFlights.forEach((flight) => {
            const flightId = `flight_${flight.flightNumber}_${flight.departureAirportIataCode}_${flight.arrivalAirportIataCode}`;
            if (flightUniqueIdToDbId[flightId]) {
              outboundFlightUniqueIds.push(flightId);
            }
          });

          // Map inbound flights
          bundle.inboundFlights.forEach((flight) => {
            const flightId = `flight_${flight.flightNumber}_${flight.departureAirportIataCode}_${flight.arrivalAirportIataCode}`;
            if (flightUniqueIdToDbId[flightId]) {
              inboundFlightUniqueIds.push(flightId);
            }
          });

          return {
            uniqueId: `bundle_${bundleIndex}`,
            outboundFlightUniqueIds,
            inboundFlightUniqueIds,
          };
        }
      );

      // Step 5: Insert bundles and get ID mapping
      const bundleUniqueIdToDbId: Record<
        string,
        Id<"bundles">
      > = await ctx.runMutation(internal.bundles.bulkInsertBundles, {
        bundles: bundlesForDb,
        flightUniqueIdToDbId: flightUniqueIdToDbId,
      });

      // Step 6: Convert booking options to database format
      const bookingOptionsForDb = allBookingOptions.map(
        (option, optionIndex) => {
          // Find the bundle this booking option belongs to
          const bundleIndex = args.scrapeResult.bundles.findIndex((bundle) =>
            bundle.bookingOptions.some(
              (bo) =>
                bo.agency === option.agency &&
                bo.price === option.price &&
                bo.linkToBook === option.linkToBook
            )
          );

          const bundleId =
            bundleIndex >= 0 ? `bundle_${bundleIndex}` : `bundle_0`;

          return {
            uniqueId: `booking_${optionIndex}`,
            targetUniqueId: bundleId,
            agency: option.agency,
            price: option.price,
            linkToBook: option.linkToBook,
            currency: option.currency,
            extractedAt: option.extractedAt,
          };
        }
      );

      // Step 7: Insert booking options
      const bookingOptionsResult: { inserted: number; replaced: number } =
        await ctx.runMutation(
          internal.bookingOptions.bulkInsertBookingOptions,
          {
            bookingOptions: bookingOptionsForDb,
            bundleUniqueIdToDbId: bundleUniqueIdToDbId,
          }
        );

      return {
        success: true,
        message: `Successfully processed and inserted scraped data`,
        flightsInserted: flightsForDb.length,
        bundlesInserted: bundlesForDb.length,
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
    const mapping: Record<string, Id<"airports">> = {};

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
