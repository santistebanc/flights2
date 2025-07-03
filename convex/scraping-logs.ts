import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { FlightSearchParams } from "../types/scraper";

/**
 * Log a scraping operation start.
 */
export const logScrapingStart = internalMutation({
  args: {
    source: v.string(),
    searchParams: v.string(), // JSON string of FlightSearchParams
  },
  returns: v.id("scrapingLogs"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("scrapingLogs", {
      source: args.source,
      status: "started",
      message: `Scraping started for ${args.source}`,
      startTime: Date.now(),
      searchParams: args.searchParams,
    });
  },
});

/**
 * Log a scraping operation success.
 */
export const logScrapingSuccess = internalMutation({
  args: {
    logId: v.id("scrapingLogs"),
    recordsProcessed: v.number(),
    message: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.logId, {
      status: "success",
      message:
        args.message ||
        `Scraping completed successfully for ${args.recordsProcessed} records`,
      endTime: Date.now(),
      recordsProcessed: args.recordsProcessed,
    });
    return null;
  },
});

/**
 * Log a scraping operation error.
 */
export const logScrapingError = internalMutation({
  args: {
    logId: v.id("scrapingLogs"),
    errorMessage: v.string(),
    errorDetails: v.optional(v.string()),
    phase: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const message = args.phase
      ? `Scraping error in ${args.phase}: ${args.errorMessage}`
      : `Scraping error: ${args.errorMessage}`;

    await ctx.db.patch(args.logId, {
      status: "error",
      message,
      errorDetails: args.errorDetails,
      endTime: Date.now(),
    });
    return null;
  },
});

/**
 * Log a scraping operation failure (complete failure).
 */
export const logScrapingFailure = internalMutation({
  args: {
    logId: v.id("scrapingLogs"),
    errorMessage: v.string(),
    errorDetails: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.logId, {
      status: "failed",
      message: `Scraping failed: ${args.errorMessage}`,
      errorDetails: args.errorDetails,
      endTime: Date.now(),
    });
    return null;
  },
});

/**
 * Get recent scraping logs for monitoring.
 */
export const getRecentScrapingLogs = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("scrapingLogs"),
      _creationTime: v.number(),
      source: v.string(),
      status: v.union(
        v.literal("started"),
        v.literal("success"),
        v.literal("error"),
        v.literal("failed")
      ),
      message: v.string(),
      errorDetails: v.optional(v.string()),
      startTime: v.number(),
      endTime: v.optional(v.number()),
      recordsProcessed: v.optional(v.number()),
      searchParams: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("scrapingLogs")
      .order("desc")
      .take(args.limit || 50);

    return logs;
  },
});

/**
 * Get scraping logs by source.
 */
export const getScrapingLogsBySource = query({
  args: {
    source: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("scrapingLogs"),
      _creationTime: v.number(),
      source: v.string(),
      status: v.union(
        v.literal("started"),
        v.literal("success"),
        v.literal("error"),
        v.literal("failed")
      ),
      message: v.string(),
      errorDetails: v.optional(v.string()),
      startTime: v.number(),
      endTime: v.optional(v.number()),
      recordsProcessed: v.optional(v.number()),
      searchParams: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("scrapingLogs")
      .withIndex("by_source", (q) => q.eq("source", args.source))
      .order("desc")
      .take(args.limit || 50);

    return logs;
  },
});

/**
 * Get scraping statistics for monitoring dashboard.
 */
export const getScrapingStats = query({
  args: {
    hours: v.optional(v.number()), // Look back N hours, default 24
  },
  returns: v.object({
    totalOperations: v.number(),
    successfulOperations: v.number(),
    failedOperations: v.number(),
    errorOperations: v.number(),
    totalRecordsProcessed: v.number(),
    averageRecordsPerSuccess: v.number(),
    successRate: v.number(),
    sources: v.array(
      v.object({
        source: v.string(),
        totalOperations: v.number(),
        successfulOperations: v.number(),
        failedOperations: v.number(),
        errorOperations: v.number(),
        totalRecordsProcessed: v.number(),
        successRate: v.number(),
      })
    ),
  }),
  handler: async (ctx, args) => {
    const hours = args.hours || 24;
    const startTime = Date.now() - hours * 60 * 60 * 1000;

    const logs = await ctx.db
      .query("scrapingLogs")
      .withIndex("by_startTime", (q) => q.gte("startTime", startTime))
      .collect();

    const stats = {
      totalOperations: logs.length,
      successfulOperations: logs.filter((log) => log.status === "success")
        .length,
      failedOperations: logs.filter((log) => log.status === "failed").length,
      errorOperations: logs.filter((log) => log.status === "error").length,
      totalRecordsProcessed: logs.reduce(
        (sum, log) => sum + (log.recordsProcessed || 0),
        0
      ),
      averageRecordsPerSuccess: 0,
      successRate: 0,
      sources: [] as any[],
    };

    // Calculate averages
    const successfulLogs = logs.filter((log) => log.status === "success");
    if (successfulLogs.length > 0) {
      stats.averageRecordsPerSuccess =
        stats.totalRecordsProcessed / successfulLogs.length;
    }

    if (stats.totalOperations > 0) {
      stats.successRate = stats.successfulOperations / stats.totalOperations;
    }

    // Calculate per-source stats
    const sourceMap = new Map<string, any>();
    for (const log of logs) {
      if (!sourceMap.has(log.source)) {
        sourceMap.set(log.source, {
          source: log.source,
          totalOperations: 0,
          successfulOperations: 0,
          failedOperations: 0,
          errorOperations: 0,
          totalRecordsProcessed: 0,
          successRate: 0,
        });
      }

      const sourceStats = sourceMap.get(log.source)!;
      sourceStats.totalOperations++;

      if (log.status === "success") {
        sourceStats.successfulOperations++;
        sourceStats.totalRecordsProcessed += log.recordsProcessed || 0;
      } else if (log.status === "failed") {
        sourceStats.failedOperations++;
      } else if (log.status === "error") {
        sourceStats.errorOperations++;
      }
    }

    // Calculate success rates for each source
    for (const sourceStats of sourceMap.values()) {
      if (sourceStats.totalOperations > 0) {
        sourceStats.successRate =
          sourceStats.successfulOperations / sourceStats.totalOperations;
      }
    }

    stats.sources = Array.from(sourceMap.values());

    return stats;
  },
});

/**
 * Get error logs for debugging.
 */
export const getErrorLogs = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("scrapingLogs"),
      _creationTime: v.number(),
      source: v.string(),
      message: v.string(),
      errorDetails: v.optional(v.string()),
      startTime: v.number(),
      endTime: v.optional(v.number()),
      searchParams: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("scrapingLogs")
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "error"),
          q.eq(q.field("status"), "failed")
        )
      )
      .order("desc")
      .take(args.limit || 20);

    return logs;
  },
});

/**
 * Clean up old scraping logs (older than specified days).
 */
export const cleanupOldLogs = internalMutation({
  args: {
    daysToKeep: v.optional(v.number()),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    const daysToKeep = args.daysToKeep || 30;
    const cutoffTime = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;

    const oldLogs = await ctx.db
      .query("scrapingLogs")
      .withIndex("by_startTime", (q) => q.lt("startTime", cutoffTime))
      .collect();

    let deletedCount = 0;
    for (const log of oldLogs) {
      await ctx.db.delete(log._id);
      deletedCount++;
    }

    return deletedCount;
  },
});
