import { api } from "./_generated/api";
import { query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { v } from "convex/values";

export type DetailedFlight = Omit<Doc<"flights">, "airline" | "from" | "to"> & {
  airline: Doc<"airlines">;
  from: Doc<"airports">;
  to: Doc<"airports">;
};

export type Offer = {
  flights: DetailedFlight[];
  deals: Doc<"deals">[];
};

export const getOffers = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const deals = await ctx.db.query("deals").take(args.limit ?? 100);
    const offersMap = new Map<string, Offer>();
    for (const deal of deals) {
      const flights = await Promise.all(
        deal.flights.map(async (flight) => {
          const detailedFlight = await ctx.runQuery(
            api.queries.getDetailedFlight,
            { id: flight }
          );
          if (!detailedFlight) throw new Error("Missing flight");
          return detailedFlight;
        })
      );
      if (!flights.length) continue;
      const key = deal.flights.join(",");
      const existingOffer = offersMap.get(key);
      if (!existingOffer) {
        offersMap.set(key, {
          flights,
          deals: [deal],
        });
      } else {
        existingOffer.deals.push(deal);
      }
    }
    return Array.from(offersMap.values());
  },
});
