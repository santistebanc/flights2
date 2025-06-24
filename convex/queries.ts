import { internalQuery, query } from "./_generated/server";
import { v } from "convex/values";

export const getAirline = query({
  args: { id: v.id("airlines") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getAirport = query({
  args: { id: v.id("airports") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getFlight = query({
  args: { id: v.id("flights") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getDetailedFlight = query({
  args: { id: v.id("flights") },
  handler: async (ctx, args) => {
    const flight = await ctx.db.get(args.id);
    if (!flight) return null;
    const airline = await ctx.db.get(flight.airline);
    const from = await ctx.db.get(flight.from);
    const to = await ctx.db.get(flight.to);
    if (!airline || !from || !to) return null;
    return { ...flight, airline, from, to };
  },
});

export const getAirlineByUniqueId = internalQuery({
  args: {
    uniqueId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("airlines")
      .withIndex("by_uniqueId", (q) => q.eq("uniqueId", args.uniqueId))
      .unique();
  },
});

export const getAirportByUniqueId = internalQuery({
  args: {
    uniqueId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("airports")
      .withIndex("by_uniqueId", (q) => q.eq("uniqueId", args.uniqueId))
      .unique();
  },
});

export const getFlightByUniqueId = internalQuery({
  args: {
    uniqueId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("flights")
      .withIndex("by_uniqueId", (q) => q.eq("uniqueId", args.uniqueId))
      .unique();
  },
});

export const getDealByUniqueId = internalQuery({
  args: {
    uniqueId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("deals")
      .withIndex("by_uniqueId", (q) => q.eq("uniqueId", args.uniqueId))
      .unique();
  },
});
