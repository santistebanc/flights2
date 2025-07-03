import { action } from "./_generated/server";
import { v } from "convex/values";
import { KiwiScraper } from "../lib/scrapers/kiwi-scraper";
import { FlightSearchParams } from "../types/scraper";

export const scrapeKiwi = action({
  args: {
    departureAirport: v.string(),
    arrivalAirport: v.string(),
    departureDate: v.string(), // ISO string
    returnDate: v.optional(v.string()), // ISO string
    isRoundTrip: v.boolean(),
  },
  handler: async (ctx, args) => {
    const params: FlightSearchParams = {
      departureAirport: args.departureAirport,
      arrivalAirport: args.arrivalAirport,
      departureDate: new Date(args.departureDate),
      returnDate: args.returnDate ? new Date(args.returnDate) : undefined,
      isRoundTrip: args.isRoundTrip,
    };
    const scraper = new KiwiScraper();
    try {
      const result = await scraper.scrape(params);
      return result;
    } catch (error) {
      // Error logging can be added here if a logId is available
      throw error;
    }
  },
});
