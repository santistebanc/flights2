import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Bulk insert booking options with duplicate handling.
 * Maps bundle uniqueIds to database IDs and replaces existing booking options.
 */
export const bulkInsertBookingOptions = internalMutation({
  args: {
    bookingOptions: v.array(
      v.object({
        uniqueId: v.string(),
        targetUniqueId: v.string(), // bundle uniqueId
        agency: v.string(),
        price: v.number(),
        linkToBook: v.string(),
        currency: v.string(),
        extractedAt: v.number(),
      })
    ),
    bundleUniqueIdToDbId: v.record(v.string(), v.id("bundles")), // Mapping from bundle uniqueId to DB ID
  },
  returns: v.object({
    inserted: v.number(),
    replaced: v.number(),
  }),
  handler: async (ctx, args) => {
    let inserted = 0;
    let replaced = 0;

    for (const bookingOption of args.bookingOptions) {
      // Check if booking option already exists by uniqueId
      const existingBookingOption = await ctx.db
        .query("bookingOptions")
        .withIndex("by_uniqueId", (q) =>
          q.eq("uniqueId", bookingOption.uniqueId)
        )
        .unique();

      const bundleDbId =
        args.bundleUniqueIdToDbId[bookingOption.targetUniqueId];
      if (!bundleDbId) {
        // Skip if bundle mapping is not found
        continue;
      }

      if (existingBookingOption) {
        // Replace existing booking option
        await ctx.db.patch(existingBookingOption._id, {
          targetId: bundleDbId,
          agency: bookingOption.agency,
          price: bookingOption.price,
          linkToBook: bookingOption.linkToBook,
          currency: bookingOption.currency,
          extractedAt: bookingOption.extractedAt,
        });
        replaced++;
      } else {
        // Insert new booking option
        await ctx.db.insert("bookingOptions", {
          uniqueId: bookingOption.uniqueId,
          targetId: bundleDbId,
          agency: bookingOption.agency,
          price: bookingOption.price,
          linkToBook: bookingOption.linkToBook,
          currency: bookingOption.currency,
          extractedAt: bookingOption.extractedAt,
        });
        inserted++;
      }
    }

    return { inserted, replaced };
  },
});

/**
 * Get booking options by bundle ID.
 */
export const getBookingOptionsByBundleId = query({
  args: {
    bundleId: v.id("bundles"),
  },
  returns: v.array(
    v.object({
      _id: v.id("bookingOptions"),
      _creationTime: v.number(),
      uniqueId: v.string(),
      targetId: v.id("bundles"),
      agency: v.string(),
      price: v.number(),
      linkToBook: v.string(),
      currency: v.string(),
      extractedAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookingOptions")
      .withIndex("by_targetId", (q) => q.eq("targetId", args.bundleId))
      .order("asc")
      .collect();
  },
});

/**
 * Get booking options by bundle IDs.
 */
export const getBookingOptionsByBundleIds = query({
  args: {
    bundleIds: v.array(v.id("bundles")),
  },
  returns: v.array(
    v.object({
      _id: v.id("bookingOptions"),
      _creationTime: v.number(),
      uniqueId: v.string(),
      targetId: v.id("bundles"),
      agency: v.string(),
      price: v.number(),
      linkToBook: v.string(),
      currency: v.string(),
      extractedAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const allBookingOptions = [];
    for (const bundleId of args.bundleIds) {
      const bookingOptions = await ctx.db
        .query("bookingOptions")
        .withIndex("by_targetId", (q) => q.eq("targetId", bundleId))
        .collect();
      allBookingOptions.push(...bookingOptions);
    }
    return allBookingOptions;
  },
});

/**
 * Get all booking option unique IDs for duplicate checking.
 */
export const getAllBookingOptionUniqueIds = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx, args) => {
    const bookingOptions = await ctx.db.query("bookingOptions").collect();
    return bookingOptions.map((booking) => booking.uniqueId);
  },
});

/**
 * Get bundles with booking options for display.
 */
export const getBundlesWithBookingOptions = query({
  args: {
    bundleIds: v.array(v.id("bundles")),
  },
  returns: v.array(
    v.object({
      _id: v.id("bundles"),
      _creationTime: v.number(),
      uniqueId: v.string(),
      outboundFlightIds: v.array(v.id("flights")),
      inboundFlightIds: v.array(v.id("flights")),
      bookingOptions: v.array(
        v.object({
          _id: v.id("bookingOptions"),
          _creationTime: v.number(),
          uniqueId: v.string(),
          targetId: v.id("bundles"),
          agency: v.string(),
          price: v.number(),
          linkToBook: v.string(),
          currency: v.string(),
          extractedAt: v.number(),
        })
      ),
    })
  ),
  handler: async (ctx, args) => {
    const bundlesWithBookingOptions = [];

    for (const bundleId of args.bundleIds) {
      const bundle = await ctx.db.get(bundleId);
      if (!bundle) continue;

      // Get booking options for this bundle
      const bookingOptions = await ctx.db
        .query("bookingOptions")
        .withIndex("by_targetId", (q) => q.eq("targetId", bundleId))
        .order("asc")
        .collect();

      bundlesWithBookingOptions.push({
        _id: bundle._id,
        _creationTime: bundle._creationTime,
        uniqueId: bundle.uniqueId,
        outboundFlightIds: bundle.outboundFlightIds,
        inboundFlightIds: bundle.inboundFlightIds,
        bookingOptions,
      });
    }

    return bundlesWithBookingOptions;
  },
});
