import { query } from "./_generated/server";
import { v } from "convex/values";

export const getFlights = query({
  args: {},
  handler: async (ctx) => {
    const flights = await ctx.db.query("flights").collect();
    return await Promise.all(
      flights.map(async (flight) => {
        const airline = await ctx.db.get(flight.airline);
        const from = await ctx.db.get(flight.from);
        const to = await ctx.db.get(flight.to);
        if (!from || !to || !airline) {
          throw new Error("Missing data");
        }
        return {
          ...flight,
          airline,
          from,
          to,
        };
      })
    );
  },
});
