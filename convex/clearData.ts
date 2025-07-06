import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const clearFlightData = mutation({
  args: {},
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    deletedCounts: v.object({
      bookingOptions: v.number(),
      bundles: v.number(),
      flights: v.number(),
    }),
  }),
  handler: async (ctx) => {
    try {
      // Clear in order of dependencies: booking options -> bundles -> flights

      // 1. Clear booking options
      const bookingOptions = await ctx.db.query("bookingOptions").collect();
      for (const option of bookingOptions) {
        await ctx.db.delete(option._id);
      }

      // 2. Clear bundles
      const bundles = await ctx.db.query("bundles").collect();
      for (const bundle of bundles) {
        await ctx.db.delete(bundle._id);
      }

      // 3. Clear flights
      const flights = await ctx.db.query("flights").collect();
      for (const flight of flights) {
        await ctx.db.delete(flight._id);
      }

      return {
        success: true,
        message: `Successfully cleared all flight data. Deleted ${bookingOptions.length} booking options, ${bundles.length} bundles, and ${flights.length} flights.`,
        deletedCounts: {
          bookingOptions: bookingOptions.length,
          bundles: bundles.length,
          flights: flights.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to clear flight data: ${error instanceof Error ? error.message : "Unknown error"}`,
        deletedCounts: {
          bookingOptions: 0,
          bundles: 0,
          flights: 0,
        },
      };
    }
  },
});
