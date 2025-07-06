import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { KiwiScraper } from "../lib/scrapers/kiwi-scraper";
import { SkyscannerScraper } from "../lib/scrapers/skyscanner-scraper";
import { FlightSearchParams } from "../types/scraper";
import { internal } from "./_generated/api";

// ===== KIWI SCRAPER PHASE ACTIONS =====

export const kiwiPhase1: any = action({
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

export const kiwiPhase2: any = action({
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

// ===== SKYSCANNER SCRAPER PHASE ACTIONS =====

export const skyscannerPhase1: any = action({
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

export const skyscannerPhase2: any = action({
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
      const scraper = new SkyscannerScraper();

      // For Skyscanner, we need to handle polling differently to save data after each poll
      // We'll do the polling logic here and save data incrementally

      let totalRecordsProcessed = 0;
      let pollCount = 0;
      let isComplete = false;
      const maxPolls = 50;

      while (!isComplete && pollCount < maxPolls) {
        pollCount++;

        // Build POST data for polling
        const sessionData = {
          token: args.sessionData.token || "",
          session: args.sessionData.session,
          suuid: args.sessionData.suuid,
          deeplink: args.sessionData.deeplink,
          cookie: args.sessionData.cookie,
        };

        const postData = scraper.buildPhase2PostData(params, sessionData);
        const url = `https://www.flightsfinder.com/portal/sky/poll`;

        // Make the POST request
        const headers: Record<string, string> = {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Accept-Encoding": "gzip, deflate",
          "Content-Type": "application/x-www-form-urlencoded",
          Connection: "keep-alive",
          "Upgrade-Insecure-Requests": "1",
        };

        if (args.sessionData.cookie) {
          headers.Cookie = args.sessionData.cookie;
        }

        const response = await fetch(url, {
          method: "POST",
          headers,
          body: postData,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const responseText = await response.text();

        // Parse the response
        const parts = responseText.split("|");
        if (parts.length < 7) {
          throw new Error(
            `Invalid response format: expected at least 7 parts, got ${parts.length}`
          );
        }

        const status = parts[0]; // 'Y' or 'N'
        const numResults = parseInt(parts[1] || "0", 10);
        const resultHtml = parts[6]; // 7th part (0-indexed)

        if (status === "Y") {
          isComplete = true;
        }

        if (resultHtml && resultHtml.length > 0) {
          // Extract bundles from this batch
          const { extractBundlesFromPhase2Html } = await import(
            "../lib/skyscanner-html-extractor"
          );
          const bundles = extractBundlesFromPhase2Html(resultHtml);

          // Save this poll's data immediately
          const saveResult = await ctx.runMutation(
            internal.data_processing.savePollData,
            {
              scrapeResult: { bundles },
              pollNumber: pollCount,
              scraperName: "skyscanner",
            }
          );

          if (saveResult.success) {
            totalRecordsProcessed +=
              saveResult.flightsInserted +
              saveResult.bundlesInserted +
              saveResult.bookingOptionsInserted;
          }
        }

        // If not complete, wait before next poll
        if (!isComplete) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      return {
        success: true,
        message: `Successfully scraped ${totalRecordsProcessed} records from Skyscanner`,
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

// ===== COMBINED ACTIONS (now internal, with session tracking) =====

export const scrapeKiwi: any = internalAction({
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
  handler: async (ctx: any, args: any): Promise<any> => {
    try {
      // Update session: Kiwi starting
      await ctx.runMutation(internal.scrapeSessions.updateScrapeSession, {
        sessionId: args.sessionId,
        kiwiStatus: "phase1",
        kiwiMessage: "Starting Kiwi search...",
      });

      // Phase 1: Get session data
      const phase1Result = await kiwiPhase1.handler(ctx, args);

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
      const phase2Result = await kiwiPhase2.handler(ctx, {
        ...args,
        sessionData: phase1Result.sessionData,
        logId: phase1Result.logId,
      });

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

export const scrapeSkyscanner: any = internalAction({
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
  handler: async (ctx: any, args: any): Promise<any> => {
    try {
      // Update session: Skyscanner starting
      await ctx.runMutation(internal.scrapeSessions.updateScrapeSession, {
        sessionId: args.sessionId,
        skyscannerStatus: "phase1",
        skyscannerMessage: "Starting Skyscanner search...",
      });

      // Phase 1: Get session data
      const phase1Result = await skyscannerPhase1.handler(ctx, args);

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
      const phase2Result = await skyscannerPhase2.handler(ctx, {
        ...args,
        sessionData: phase1Result.sessionData,
        logId: phase1Result.logId,
      });

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
