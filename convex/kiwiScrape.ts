import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { KiwiScraper } from "../lib/scrapers/kiwi-scraper";
import { FlightSearchParams } from "../types/scraper";
import { internal } from "./_generated/api";

interface Phase1Result {
  success: boolean;
  message: string;
  sessionData?: {
    token: string;
    cookie: string;
  };
  logId?: string;
}

interface Phase2Result {
  success: boolean;
  message: string;
  recordsProcessed: number;
}

export const scrapeKiwi = internalAction({
  args: {
    sessionId: v.id("scrapeSessions"),
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
  }),
  handler: async (ctx, args) => {
    try {
      // Update session: Kiwi starting
      await ctx.runMutation(internal.scrapeSessions.updateScrapeSession, {
        sessionId: args.sessionId,
        kiwiStatus: "phase1",
        kiwiMessage: "Starting Kiwi search...",
      });

      // Phase 1: Get session data
      const phase1Result: Phase1Result = await ctx.runAction(
        internal.kiwiScrape.kiwiPhase1,
        {
          departureAirport: args.departureAirport,
          arrivalAirport: args.arrivalAirport,
          departureDate: args.departureDate,
          returnDate: args.returnDate,
          isRoundTrip: args.isRoundTrip,
        }
      );

      if (
        !phase1Result.success ||
        !phase1Result.sessionData ||
        !phase1Result.logId
      ) {
        // Update session: Kiwi failed
        await ctx.runMutation(internal.scrapeSessions.updateScrapeSession, {
          sessionId: args.sessionId,
          kiwiStatus: "error",
          kiwiMessage: phase1Result.message,
          kiwiError: phase1Result.message,
        });

        return {
          success: false,
          message: phase1Result.message,
          recordsProcessed: 0,
        };
      }

      // Update session: Kiwi phase 2
      await ctx.runMutation(internal.scrapeSessions.updateScrapeSession, {
        sessionId: args.sessionId,
        kiwiStatus: "phase2",
        kiwiMessage: "Extracting Kiwi data...",
      });

      // Phase 2: Extract data and save to database
      const phase2Result: Phase2Result = await ctx.runAction(
        internal.kiwiScrape.kiwiPhase2,
        {
          departureAirport: args.departureAirport,
          arrivalAirport: args.arrivalAirport,
          departureDate: args.departureDate,
          returnDate: args.returnDate,
          isRoundTrip: args.isRoundTrip,
          sessionData: phase1Result.sessionData,
          logId: phase1Result.logId,
        }
      );

      // Update session: Kiwi completed
      await ctx.runMutation(internal.scrapeSessions.updateScrapeSession, {
        sessionId: args.sessionId,
        kiwiStatus: phase2Result.success ? "completed" : "error",
        kiwiMessage: phase2Result.message,
        kiwiRecordsProcessed: phase2Result.recordsProcessed,
        kiwiError: phase2Result.success ? undefined : phase2Result.message,
      });

      return phase2Result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Update session: Kiwi failed
      await ctx.runMutation(internal.scrapeSessions.updateScrapeSession, {
        sessionId: args.sessionId,
        kiwiStatus: "error",
        kiwiMessage: `Failed to scrape Kiwi: ${errorMessage}`,
        kiwiError: errorMessage,
      });

      return {
        success: false,
        message: `Failed to scrape Kiwi: ${errorMessage}`,
        recordsProcessed: 0,
      };
    }
  },
});

// ===== KIWI SCRAPER PHASE ACTIONS =====

export const kiwiPhase1 = internalAction({
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
    sessionData: v.optional(
      v.object({
        token: v.optional(v.string()),
        session: v.optional(v.string()),
        suuid: v.optional(v.string()),
        deeplink: v.optional(v.string()),
        cookie: v.optional(v.string()),
      })
    ),
    logId: v.optional(v.string()),
  }),
  handler: async (ctx: any, args: any): Promise<any> => {
    const params: FlightSearchParams = {
      departureAirport: args.departureAirport,
      arrivalAirport: args.arrivalAirport,
      departureDate: new Date(args.departureDate),
      returnDate: args.returnDate ? new Date(args.returnDate) : undefined,
      isRoundTrip: args.isRoundTrip,
    };

    const logId: string = "temp_log_id";

    try {
      const scraper = new KiwiScraper();
      const phase1Result = await scraper.executePhase1(params);

      return {
        success: true,
        message: "Kiwi Phase 1 completed successfully",
        sessionData: {
          token: phase1Result.token,
          session: phase1Result.session,
          suuid: phase1Result.suuid,
          deeplink: phase1Result.deeplink,
          cookie: phase1Result.cookie,
        },
        logId,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      return {
        success: false,
        message: `Kiwi Phase 1 failed: ${errorMessage}`,
        logId,
      };
    }
  },
});

export const kiwiPhase2 = internalAction({
  args: {
    departureAirport: v.string(),
    arrivalAirport: v.string(),
    departureDate: v.string(), // ISO string
    returnDate: v.optional(v.string()), // ISO string
    isRoundTrip: v.boolean(),
    sessionData: v.object({
      token: v.optional(v.string()),
      session: v.optional(v.string()),
      suuid: v.optional(v.string()),
      deeplink: v.optional(v.string()),
      cookie: v.optional(v.string()),
    }),
    logId: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    recordsProcessed: v.number(),
  }),
  handler: async (ctx: any, args: any): Promise<any> => {
    const params: FlightSearchParams = {
      departureAirport: args.departureAirport,
      arrivalAirport: args.arrivalAirport,
      departureDate: new Date(args.departureDate),
      returnDate: args.returnDate ? new Date(args.returnDate) : undefined,
      isRoundTrip: args.isRoundTrip,
    };

    try {
      const scraper = new KiwiScraper();

      // Create compatible session data
      const sessionData = {
        token: args.sessionData.token || "",
        session: args.sessionData.session,
        suuid: args.sessionData.suuid,
        deeplink: args.sessionData.deeplink,
        cookie: args.sessionData.cookie,
      };

      const phase2Result = await scraper.executePhase2(params, sessionData);

      // Process and insert scraped data into database
      const insertionResult: any = await ctx.runMutation(
        internal.data_processing.processAndInsertScrapedData,
        {
          scrapeResult: { bundles: phase2Result.bundles },
        }
      );

      const recordsProcessed =
        insertionResult.flightsInserted +
        insertionResult.bundlesInserted +
        insertionResult.bookingOptionsInserted +
        insertionResult.bookingOptionsReplaced;

      return {
        success: insertionResult.success,
        message: insertionResult.message,
        recordsProcessed,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      return {
        success: false,
        message: `Kiwi Phase 2 failed: ${errorMessage}`,
        recordsProcessed: 0,
      };
    }
  },
});
