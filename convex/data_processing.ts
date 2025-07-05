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

function shortHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(hash).toString(36);
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
          departureDate: v.string(),
          returnDate: v.string(),
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
            bundle.departureDate,
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
            bundle.returnDate,
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
              uniqueId: `flight_${flight.flightNumber}_${flight.departureAirportIataCode}_${flight.arrivalAirportIataCode}_${flight.departureDate}`,
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

          // Map outbound flights - use the same uniqueId format as generated for flights
          bundle.outboundFlights.forEach((flight, flightIndex) => {
            const departureDate = calculateFlightDepartureDate(
              bundle.departureDate,
              flightIndex,
              bundle.outboundFlights
            );
            const flightUniqueId = `flight_${flight.flightNumber}_${flight.departureAirportIataCode}_${flight.arrivalAirportIataCode}_${departureDate}`;
            if (flightUniqueIdToDbId[flightUniqueId]) {
              outboundFlightUniqueIds.push(flightUniqueId);
            }
          });

          // Map inbound flights - use the same uniqueId format as generated for flights
          bundle.inboundFlights.forEach((flight, flightIndex) => {
            const departureDate = calculateFlightDepartureDate(
              bundle.returnDate,
              flightIndex,
              bundle.inboundFlights
            );
            const flightUniqueId = `flight_${flight.flightNumber}_${flight.departureAirportIataCode}_${flight.arrivalAirportIataCode}_${departureDate}`;
            if (flightUniqueIdToDbId[flightUniqueId]) {
              inboundFlightUniqueIds.push(flightUniqueId);
            }
          });

          return {
            uniqueId: `bundle_${outboundFlightUniqueIds.join("_")}_${inboundFlightUniqueIds.join("_")}`,
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
          // Find the bundle this booking option belongs to by matching the exact bundle
          let targetBundleUniqueId = "";

          for (let i = 0; i < args.scrapeResult.bundles.length; i++) {
            const bundle = args.scrapeResult.bundles[i];
            const hasMatchingBookingOption = bundle.bookingOptions.some(
              (bo) =>
                bo.agency === option.agency &&
                bo.price === option.price &&
                bo.linkToBook === option.linkToBook &&
                bo.currency === option.currency &&
                bo.extractedAt === option.extractedAt
            );

            if (hasMatchingBookingOption) {
              // Generate the same bundle uniqueId as above
              const outboundFlightUniqueIds: string[] = [];
              const inboundFlightUniqueIds: string[] = [];

              // Map outbound flights
              bundle.outboundFlights.forEach((flight, flightIndex) => {
                const departureDate = calculateFlightDepartureDate(
                  bundle.departureDate,
                  flightIndex,
                  bundle.outboundFlights
                );
                const flightUniqueId = `flight_${flight.flightNumber}_${flight.departureAirportIataCode}_${flight.arrivalAirportIataCode}_${departureDate}`;
                if (flightUniqueIdToDbId[flightUniqueId]) {
                  outboundFlightUniqueIds.push(flightUniqueId);
                }
              });

              // Map inbound flights
              bundle.inboundFlights.forEach((flight, flightIndex) => {
                const departureDate = calculateFlightDepartureDate(
                  bundle.returnDate,
                  flightIndex,
                  bundle.inboundFlights
                );
                const flightUniqueId = `flight_${flight.flightNumber}_${flight.departureAirportIataCode}_${flight.arrivalAirportIataCode}_${departureDate}`;
                if (flightUniqueIdToDbId[flightUniqueId]) {
                  inboundFlightUniqueIds.push(flightUniqueId);
                }
              });

              targetBundleUniqueId = `bundle_${outboundFlightUniqueIds.join("_")}_${inboundFlightUniqueIds.join("_")}`;
              break;
            }
          }

          // Fallback to first bundle if no match found (shouldn't happen in normal operation)
          if (!targetBundleUniqueId && bundlesForDb.length > 0) {
            targetBundleUniqueId = bundlesForDb[0].uniqueId;
          }

          return {
            uniqueId: `booking_${option.agency}_${option.price}_${option.currency}_${option.extractedAt}_${shortHash(option.linkToBook)}`,
            targetUniqueId: targetBundleUniqueId,
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

/**
 * Save scraped data after each poll to prevent memory issues and provide progress tracking.
 * This function processes and saves a single batch of bundles from a poll.
 */
export const savePollData = internalMutation({
  args: {
    scrapeResult: v.object({
      bundles: v.array(
        v.object({
          departureDate: v.string(),
          returnDate: v.string(),
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
    pollNumber: v.number(),
    scraperName: v.string(),
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
            bundle.departureDate,
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
            bundle.returnDate,
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
              uniqueId: `flight_${flight.flightNumber}_${flight.departureAirportIataCode}_${flight.arrivalAirportIataCode}_${flight.departureDate}`,
              flightNumber: flight.flightNumber,
              departureAirportId:
                airportIdMapping[flight.departureAirportIataCode],
              arrivalAirportId: airportIdMapping[flight.arrivalAirportIataCode],
              departureDateTime,
              arrivalDateTime,
            };
          })
      );

      // Step 3: Insert flights (keep original if duplicate uniqueId exists)
      const flightUniqueIdToDbId: Record<string, Id<"flights">> = {};
      for (const flight of flightsForDb) {
        // Check if flight already exists
        const existingFlight = await ctx.db
          .query("flights")
          .withIndex("by_uniqueId", (q) => q.eq("uniqueId", flight.uniqueId))
          .unique();

        if (!existingFlight) {
          const flightId = await ctx.db.insert("flights", flight);
          flightUniqueIdToDbId[flight.uniqueId] = flightId;
        } else {
          flightUniqueIdToDbId[flight.uniqueId] = existingFlight._id;
        }
      }

      // Step 4: Create bundles
      const bundleIds: Id<"bundles">[] = [];

      for (const bundle of args.scrapeResult.bundles) {
        // Get flight IDs for this bundle
        const outboundFlightUniqueIds: string[] = [];
        const inboundFlightUniqueIds: string[] = [];

        // Map outbound flights
        bundle.outboundFlights.forEach((flight, flightIndex) => {
          const departureDate = calculateFlightDepartureDate(
            bundle.departureDate,
            flightIndex,
            bundle.outboundFlights
          );
          const uniqueId = `flight_${flight.flightNumber}_${flight.departureAirportIataCode}_${flight.arrivalAirportIataCode}_${departureDate}`;
          outboundFlightUniqueIds.push(uniqueId);
        });

        // Map inbound flights
        bundle.inboundFlights.forEach((flight, flightIndex) => {
          const departureDate = calculateFlightDepartureDate(
            bundle.returnDate,
            flightIndex,
            bundle.inboundFlights
          );
          const uniqueId = `flight_${flight.flightNumber}_${flight.departureAirportIataCode}_${flight.arrivalAirportIataCode}_${departureDate}`;
          inboundFlightUniqueIds.push(uniqueId);
        });

        // Create bundle
        const bundleData = {
          uniqueId: `bundle_${outboundFlightUniqueIds.join("_")}_${inboundFlightUniqueIds.join("_")}`,
          outboundFlightIds: outboundFlightUniqueIds
            .map((uniqueId) => flightUniqueIdToDbId[uniqueId])
            .filter(Boolean) as Id<"flights">[],
          inboundFlightIds: inboundFlightUniqueIds
            .map((uniqueId) => flightUniqueIdToDbId[uniqueId])
            .filter(Boolean) as Id<"flights">[],
        };

        // Check if bundle already exists
        const existingBundle = await ctx.db
          .query("bundles")
          .withIndex("by_uniqueId", (q) =>
            q.eq("uniqueId", bundleData.uniqueId)
          )
          .unique();

        if (!existingBundle) {
          const bundleId = await ctx.db.insert("bundles", bundleData);
          bundleIds.push(bundleId);
        } else {
          bundleIds.push(existingBundle._id);
        }
      }

      // Step 5: Insert booking options (replace if duplicate uniqueId exists)
      let bookingOptionsInserted = 0;
      let bookingOptionsReplaced = 0;

      for (const bundle of args.scrapeResult.bundles) {
        // Generate the same bundle uniqueId as above to find the correct bundle ID
        const outboundFlightUniqueIds: string[] = [];
        const inboundFlightUniqueIds: string[] = [];

        // Map outbound flights
        bundle.outboundFlights.forEach((flight, flightIndex) => {
          const departureDate = calculateFlightDepartureDate(
            bundle.departureDate,
            flightIndex,
            bundle.outboundFlights
          );
          const uniqueId = `flight_${flight.flightNumber}_${flight.departureAirportIataCode}_${flight.arrivalAirportIataCode}_${departureDate}`;
          outboundFlightUniqueIds.push(uniqueId);
        });

        // Map inbound flights
        bundle.inboundFlights.forEach((flight, flightIndex) => {
          const departureDate = calculateFlightDepartureDate(
            bundle.returnDate,
            flightIndex,
            bundle.inboundFlights
          );
          const uniqueId = `flight_${flight.flightNumber}_${flight.departureAirportIataCode}_${flight.arrivalAirportIataCode}_${departureDate}`;
          inboundFlightUniqueIds.push(uniqueId);
        });

        const bundleUniqueId = `bundle_${outboundFlightUniqueIds.join("_")}_${inboundFlightUniqueIds.join("_")}`;

        // Find the bundle ID by looking up the bundle we just created
        const bundleIndex = bundleIds.findIndex((_, index) => {
          const bundleData = args.scrapeResult.bundles[index];
          const bundleOutboundFlightUniqueIds: string[] = [];
          const bundleInboundFlightUniqueIds: string[] = [];

          // Map outbound flights
          bundleData.outboundFlights.forEach((flight, flightIndex) => {
            const departureDate = calculateFlightDepartureDate(
              bundleData.departureDate,
              flightIndex,
              bundleData.outboundFlights
            );
            const uniqueId = `flight_${flight.flightNumber}_${flight.departureAirportIataCode}_${flight.arrivalAirportIataCode}_${departureDate}`;
            bundleOutboundFlightUniqueIds.push(uniqueId);
          });

          // Map inbound flights
          bundleData.inboundFlights.forEach((flight, flightIndex) => {
            const departureDate = calculateFlightDepartureDate(
              bundleData.returnDate,
              flightIndex,
              bundleData.inboundFlights
            );
            const uniqueId = `flight_${flight.flightNumber}_${flight.departureAirportIataCode}_${flight.arrivalAirportIataCode}_${departureDate}`;
            bundleInboundFlightUniqueIds.push(uniqueId);
          });

          const currentBundleUniqueId = `bundle_${bundleOutboundFlightUniqueIds.join("_")}_${bundleInboundFlightUniqueIds.join("_")}`;
          return currentBundleUniqueId === bundleUniqueId;
        });

        const bundleId =
          bundleIndex >= 0 ? bundleIds[bundleIndex] : bundleIds[0];

        for (const option of bundle.bookingOptions) {
          const bookingOptionData = {
            uniqueId: `booking_${option.agency}_${option.price}_${option.currency}_${option.extractedAt}_${shortHash(option.linkToBook)}`,
            targetId: bundleId,
            agency: option.agency,
            price: option.price,
            linkToBook: option.linkToBook,
            currency: option.currency,
            extractedAt: option.extractedAt,
          };

          // Check if booking option already exists
          const existingBookingOption = await ctx.db
            .query("bookingOptions")
            .withIndex("by_uniqueId", (q) =>
              q.eq("uniqueId", bookingOptionData.uniqueId)
            )
            .unique();

          if (existingBookingOption) {
            // Replace existing booking option
            await ctx.db.replace(existingBookingOption._id, bookingOptionData);
            bookingOptionsReplaced++;
          } else {
            // Insert new booking option
            await ctx.db.insert("bookingOptions", bookingOptionData);
            bookingOptionsInserted++;
          }
        }
      }

      return {
        success: true,
        message: `Poll ${args.pollNumber} data saved successfully`,
        flightsInserted: flightsForDb.length,
        bundlesInserted: bundleIds.length,
        bookingOptionsInserted,
        bookingOptionsReplaced,
      };
    } catch (error) {
      console.error(
        `[${args.scraperName}] Error saving poll ${args.pollNumber} data:`,
        error
      );
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        flightsInserted: 0,
        bundlesInserted: 0,
        bookingOptionsInserted: 0,
        bookingOptionsReplaced: 0,
      };
    }
  },
});
