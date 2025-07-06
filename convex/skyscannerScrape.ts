import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { SkyscannerScraper } from "../lib/scrapers/skyscanner-scraper";
import { FlightSearchParams } from "../types/scraper";
import { internal } from "./_generated/api";

interface Phase1Result {
  success: boolean;
  message: string;
  sessionData?: {
    token?: string;
    session?: string;
    suuid?: string;
    deeplink?: string;
    cookie?: string;
  };
  logId?: string;
}

interface Phase2Result {
  success: boolean;
  message: string;
  recordsProcessed: number;
}

export const scrapeSkyscanner = internalAction({
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
      // Update session: Skyscanner starting
      await ctx.runMutation(internal.scrapeSessions.updateScrapeSession, {
        sessionId: args.sessionId,
        skyscannerStatus: "phase1",
        skyscannerMessage: "Starting Skyscanner search...",
      });

      // Phase 1: Get session data
      const phase1Result: Phase1Result = await ctx.runAction(
        internal.skyscannerScrape.skyscannerPhase1,
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
        // Update session: Skyscanner failed
        await ctx.runMutation(internal.scrapeSessions.updateScrapeSession, {
          sessionId: args.sessionId,
          skyscannerStatus: "error",
          skyscannerMessage: phase1Result.message,
          skyscannerError: phase1Result.message,
        });

        return {
          success: false,
          message: phase1Result.message,
          recordsProcessed: 0,
        };
      }

      // Update session: Skyscanner phase 2
      await ctx.runMutation(internal.scrapeSessions.updateScrapeSession, {
        sessionId: args.sessionId,
        skyscannerStatus: "phase2",
        skyscannerMessage: "Extracting Skyscanner data...",
      });

      // Phase 2: Extract data and save to database
      const phase2Result: Phase2Result = await ctx.runAction(
        internal.skyscannerScrape.skyscannerPhase2,
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

      // Update session: Skyscanner completed
      await ctx.runMutation(internal.scrapeSessions.updateScrapeSession, {
        sessionId: args.sessionId,
        skyscannerStatus: phase2Result.success ? "completed" : "error",
        skyscannerMessage: phase2Result.message,
        skyscannerRecordsProcessed: phase2Result.recordsProcessed,
        skyscannerError: phase2Result.success
          ? undefined
          : phase2Result.message,
      });

      return phase2Result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Update session: Skyscanner failed
      await ctx.runMutation(internal.scrapeSessions.updateScrapeSession, {
        sessionId: args.sessionId,
        skyscannerStatus: "error",
        skyscannerMessage: `Failed to scrape Skyscanner: ${errorMessage}`,
        skyscannerError: errorMessage,
      });

      return {
        success: false,
        message: `Failed to scrape Skyscanner: ${errorMessage}`,
        recordsProcessed: 0,
      };
    }
  },
});

// ===== SKYSCANNER SCRAPER PHASE ACTIONS =====

export const skyscannerPhase1 = internalAction({
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
      departureDate: args.departureDate,
      returnDate: args.returnDate,
      isRoundTrip: args.isRoundTrip,
    };

    const logId: string = "temp_log_id";

    try {
      const scraper = new SkyscannerScraper();
      const phase1Result = await scraper.executePhase1(params);

      return {
        success: true,
        message: "Skyscanner Phase 1 completed successfully",
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
        message: `Skyscanner Phase 1 failed: ${errorMessage}`,
        logId,
      };
    }
  },
});

export const skyscannerPhase2 = internalAction({
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
      departureDate: args.departureDate,
      returnDate: args.returnDate,
      isRoundTrip: args.isRoundTrip,
    };

    try {
      const scraper = new SkyscannerScraper();

      // Create compatible session data
      const sessionData = {
        token: args.sessionData.token || "",
        session: args.sessionData.session,
        suuid: args.sessionData.suuid,
        deeplink: args.sessionData.deeplink,
        cookie: args.sessionData.cookie,
      };

      let totalRecordsProcessed = 0;
      let chunkCount = 0;

      // Use the streaming version to process bundles as they arrive
      for await (const bundleChunk of scraper.executePhase2Stream(
        params,
        sessionData
      )) {
        chunkCount++;

        // Schedule saving this chunk of bundles (non-blocking)
        await ctx.scheduler.runAfter(0, internal.data_processing.savePollData, {
          scrapeResult: { bundles: bundleChunk },
          pollNumber: chunkCount,
          scraperName: "skyscanner",
        });

        // Estimate records processed (since we're not waiting for the save result)
        const estimatedRecords = bundleChunk.length * 3; // Rough estimate: bundles + flights + booking options
        totalRecordsProcessed += estimatedRecords;

        // Log progress for this chunk
        console.log(
          `Skyscanner chunk ${chunkCount}: scheduled save for ${bundleChunk.length} bundles (estimated ${estimatedRecords} records)`
        );
      }

      return {
        success: true,
        message: `Successfully streamed and scheduled saves for ${chunkCount} chunks with estimated ${totalRecordsProcessed} records from Skyscanner`,
        recordsProcessed: totalRecordsProcessed,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      return {
        success: false,
        message: `Skyscanner Phase 2 failed: ${errorMessage}`,
        recordsProcessed: 0,
      };
    }
  },
});
