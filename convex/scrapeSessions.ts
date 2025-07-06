import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Create a new scrape session and schedule the scraping actions
export const createScrapeSession = mutation({
  args: {
    departureAirport: v.string(),
    arrivalAirport: v.string(),
    departureDate: v.string(), // ISO string
    returnDate: v.optional(v.string()), // ISO string
    isRoundTrip: v.boolean(),
  },
  returns: v.id("scrapeSessions"),
  handler: async (ctx, args) => {
    const now = Date.now();

    // Create the scrape session
    const sessionId = await ctx.db.insert("scrapeSessions", {
      departureAirport: args.departureAirport,
      arrivalAirport: args.arrivalAirport,
      departureDate: args.departureDate,
      returnDate: args.returnDate,
      isRoundTrip: args.isRoundTrip,
      status: "pending",
      kiwiStatus: "idle",
      kiwiMessage: "",
      skyscannerStatus: "idle",
      skyscannerMessage: "",
      createdAt: now,
      updatedAt: now,
    });

    // Schedule both scraping actions
    await ctx.scheduler.runAfter(0, internal.scrapingActions.scrapeKiwi, {
      sessionId,
      departureAirport: args.departureAirport,
      arrivalAirport: args.arrivalAirport,
      departureDate: args.departureDate,
      returnDate: args.returnDate,
      isRoundTrip: args.isRoundTrip,
    });

    await ctx.scheduler.runAfter(0, internal.scrapingActions.scrapeSkyscanner, {
      sessionId,
      departureAirport: args.departureAirport,
      arrivalAirport: args.arrivalAirport,
      departureDate: args.departureDate,
      returnDate: args.returnDate,
      isRoundTrip: args.isRoundTrip,
    });

    // Update session status to in_progress
    await ctx.db.patch(sessionId, {
      status: "in_progress",
      updatedAt: Date.now(),
    });

    return sessionId;
  },
});

// Update scrape session progress
export const updateScrapeSession = mutation({
  args: {
    sessionId: v.id("scrapeSessions"),
    kiwiStatus: v.optional(
      v.union(
        v.literal("idle"),
        v.literal("phase1"),
        v.literal("phase2"),
        v.literal("completed"),
        v.literal("error")
      )
    ),
    kiwiMessage: v.optional(v.string()),
    kiwiRecordsProcessed: v.optional(v.number()),
    kiwiError: v.optional(v.string()),
    skyscannerStatus: v.optional(
      v.union(
        v.literal("idle"),
        v.literal("phase1"),
        v.literal("phase2"),
        v.literal("completed"),
        v.literal("error")
      )
    ),
    skyscannerMessage: v.optional(v.string()),
    skyscannerRecordsProcessed: v.optional(v.number()),
    skyscannerError: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Scrape session not found");
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    // Update Kiwi status if provided
    if (args.kiwiStatus !== undefined) {
      updates.kiwiStatus = args.kiwiStatus;
    }
    if (args.kiwiMessage !== undefined) {
      updates.kiwiMessage = args.kiwiMessage;
    }
    if (args.kiwiRecordsProcessed !== undefined) {
      updates.kiwiRecordsProcessed = args.kiwiRecordsProcessed;
    }
    if (args.kiwiError !== undefined) {
      updates.kiwiError = args.kiwiError;
    }

    // Update Skyscanner status if provided
    if (args.skyscannerStatus !== undefined) {
      updates.skyscannerStatus = args.skyscannerStatus;
    }
    if (args.skyscannerMessage !== undefined) {
      updates.skyscannerMessage = args.skyscannerMessage;
    }
    if (args.skyscannerRecordsProcessed !== undefined) {
      updates.skyscannerRecordsProcessed = args.skyscannerRecordsProcessed;
    }
    if (args.skyscannerError !== undefined) {
      updates.skyscannerError = args.skyscannerError;
    }

    // Get current session state to determine overall status
    const currentSession = { ...session, ...updates };
    const kiwiDone =
      currentSession.kiwiStatus === "completed" ||
      currentSession.kiwiStatus === "error";
    const skyscannerDone =
      currentSession.skyscannerStatus === "completed" ||
      currentSession.skyscannerStatus === "error";

    if (kiwiDone && skyscannerDone) {
      const kiwiSuccess = currentSession.kiwiStatus === "completed";
      const skyscannerSuccess = currentSession.skyscannerStatus === "completed";

      if (kiwiSuccess && skyscannerSuccess) {
        updates.status = "completed";
      } else if (kiwiSuccess || skyscannerSuccess) {
        updates.status = "partial_success";
      } else {
        updates.status = "failed";
      }

      updates.completedAt = Date.now();
    }

    await ctx.db.patch(args.sessionId, updates);
  },
});

// Get a scrape session by ID
export const getScrapeSession = query({
  args: { sessionId: v.id("scrapeSessions") },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("scrapeSessions"),
      _creationTime: v.number(),
      departureAirport: v.string(),
      arrivalAirport: v.string(),
      departureDate: v.string(),
      returnDate: v.optional(v.string()),
      isRoundTrip: v.boolean(),
      status: v.union(
        v.literal("pending"),
        v.literal("in_progress"),
        v.literal("completed"),
        v.literal("failed"),
        v.literal("partial_success")
      ),
      kiwiStatus: v.union(
        v.literal("idle"),
        v.literal("phase1"),
        v.literal("phase2"),
        v.literal("completed"),
        v.literal("error")
      ),
      kiwiMessage: v.string(),
      kiwiRecordsProcessed: v.optional(v.number()),
      kiwiError: v.optional(v.string()),
      skyscannerStatus: v.union(
        v.literal("idle"),
        v.literal("phase1"),
        v.literal("phase2"),
        v.literal("completed"),
        v.literal("error")
      ),
      skyscannerMessage: v.string(),
      skyscannerRecordsProcessed: v.optional(v.number()),
      skyscannerError: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
      completedAt: v.optional(v.number()),
    })
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.sessionId);
  },
});

// Get recent scrape sessions
export const getRecentScrapeSessions = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(
    v.object({
      _id: v.id("scrapeSessions"),
      _creationTime: v.number(),
      departureAirport: v.string(),
      arrivalAirport: v.string(),
      departureDate: v.string(),
      returnDate: v.optional(v.string()),
      isRoundTrip: v.boolean(),
      status: v.union(
        v.literal("pending"),
        v.literal("in_progress"),
        v.literal("completed"),
        v.literal("failed"),
        v.literal("partial_success")
      ),
      kiwiStatus: v.union(
        v.literal("idle"),
        v.literal("phase1"),
        v.literal("phase2"),
        v.literal("completed"),
        v.literal("error")
      ),
      kiwiMessage: v.string(),
      kiwiRecordsProcessed: v.optional(v.number()),
      kiwiError: v.optional(v.string()),
      skyscannerStatus: v.union(
        v.literal("idle"),
        v.literal("phase1"),
        v.literal("phase2"),
        v.literal("completed"),
        v.literal("error")
      ),
      skyscannerMessage: v.string(),
      skyscannerRecordsProcessed: v.optional(v.number()),
      skyscannerError: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
      completedAt: v.optional(v.number()),
    })
  ),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    return await ctx.db
      .query("scrapeSessions")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limit);
  },
});
