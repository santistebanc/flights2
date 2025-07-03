import { action } from "./_generated/server";
import { v } from "convex/values";
import { KiwiScraper } from "../lib/scrapers/kiwi-scraper";
import { SkyscannerScraper } from "../lib/scrapers/skyscanner-scraper";
import { FlightSearchParams } from "../types/scraper";
import { internal } from "./_generated/api";

export const scrapeKiwi = action({
  args: {
    departureAirport: v.string(),
    arrivalAirport: v.string(),
    departureDate: v.string(), // ISO string
    returnDate: v.optional(v.string()), // ISO string
    isRoundTrip: v.boolean(),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    recordsProcessed: v.number(),
    scrapedData: v.any(), // For debugging - will be removed later
  }),
  handler: async (ctx, args) => {
    const params: FlightSearchParams = {
      departureAirport: args.departureAirport,
      arrivalAirport: args.arrivalAirport,
      departureDate: new Date(args.departureDate),
      returnDate: args.returnDate ? new Date(args.returnDate) : undefined,
      isRoundTrip: args.isRoundTrip,
    };

    // Log scraping start
    const logId = await ctx.runMutation(
      internal["scraping-logs"].logScrapingStart,
      {
        source: "kiwi",
        searchParams: JSON.stringify(params),
      }
    );

    try {
      const scraper = new KiwiScraper();
      const result = await scraper.scrape(params);

      // For now, just count the scraped records without inserting into DB
      const recordsProcessed =
        (result.flights?.length || 0) +
        (result.bundles?.length || 0) +
        (result.bookingOptions?.length || 0);

      // Log success
      await ctx.runMutation(internal["scraping-logs"].logScrapingSuccess, {
        logId,
        recordsProcessed,
        message: `Successfully scraped ${recordsProcessed} records from Kiwi`,
      });

      return {
        success: true,
        message: `Successfully scraped ${recordsProcessed} records from Kiwi`,
        recordsProcessed,
        scrapedData: result, // For debugging
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Log error
      await ctx.runMutation(internal["scraping-logs"].logScrapingError, {
        logId,
        errorMessage,
        errorDetails: error instanceof Error ? error.stack : undefined,
        phase: "scraping",
      });

      return {
        success: false,
        message: `Failed to scrape Kiwi: ${errorMessage}`,
        recordsProcessed: 0,
        scrapedData: null,
      };
    }
  },
});

export const scrapeSkyscanner = action({
  args: {
    departureAirport: v.string(),
    arrivalAirport: v.string(),
    departureDate: v.string(), // ISO string
    returnDate: v.optional(v.string()), // ISO string
    isRoundTrip: v.boolean(),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    recordsProcessed: v.number(),
    scrapedData: v.any(), // For debugging - will be removed later
  }),
  handler: async (ctx, args) => {
    const params: FlightSearchParams = {
      departureAirport: args.departureAirport,
      arrivalAirport: args.arrivalAirport,
      departureDate: new Date(args.departureDate),
      returnDate: args.returnDate ? new Date(args.returnDate) : undefined,
      isRoundTrip: args.isRoundTrip,
    };

    // Log scraping start
    const logId = await ctx.runMutation(
      internal["scraping-logs"].logScrapingStart,
      {
        source: "skyscanner",
        searchParams: JSON.stringify(params),
      }
    );

    try {
      const scraper = new SkyscannerScraper();
      const result = await scraper.scrape(params);

      // For now, just count the scraped records without inserting into DB
      const recordsProcessed =
        (result.flights?.length || 0) +
        (result.bundles?.length || 0) +
        (result.bookingOptions?.length || 0);

      // Log success
      await ctx.runMutation(internal["scraping-logs"].logScrapingSuccess, {
        logId,
        recordsProcessed,
        message: `Successfully scraped ${recordsProcessed} records from Skyscanner`,
      });

      return {
        success: true,
        message: `Successfully scraped ${recordsProcessed} records from Skyscanner`,
        recordsProcessed,
        scrapedData: result, // For debugging
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Log error
      await ctx.runMutation(internal["scraping-logs"].logScrapingError, {
        logId,
        errorMessage,
        errorDetails: error instanceof Error ? error.stack : undefined,
        phase: "scraping",
      });

      return {
        success: false,
        message: `Failed to scrape Skyscanner: ${errorMessage}`,
        recordsProcessed: 0,
        scrapedData: null,
      };
    }
  },
});
