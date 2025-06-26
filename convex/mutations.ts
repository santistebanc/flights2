import { internalMutation, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

type AirlineArgs = {
  uniqueId: string;
  name: string;
};

type AirportArgs = {
  uniqueId: string;
  name: string;
  iata_code: string;
  iso_country: string;
  municipality?: string;
  timezone: string;
};

type FlightArgs = {
  uniqueId: string;
  airline: Id<"airlines">;
  flightNumber: string;
  from: Id<"airports">;
  to: Id<"airports">;
  departure: string;
  arrival: string;
};

type DealArgs = {
  uniqueId: string;
  flights: Id<"flights">[];
  price: number;
  dealer: string;
  link: string;
  date: string;
};

type EntityArgs = 
  | { type: "airlines"; args: AirlineArgs }
  | { type: "airports"; args: AirportArgs }
  | { type: "flights"; args: FlightArgs }
  | { type: "deals"; args: DealArgs };

async function getOrCreateEntity(
  ctx: MutationCtx,
  entity: EntityArgs
) {
  // For all entities, use uniqueId for deduplication
  const existing = await ctx.db
    .query(entity.type)
    .withIndex("by_uniqueId", (q) => q.eq("uniqueId", entity.args.uniqueId))
    .unique();

  if (existing) {
    return existing._id;
  }

  return await ctx.db.insert(entity.type, entity.args);
}

export const createAirline = internalMutation({
  args: {
    uniqueId: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    return await getOrCreateEntity(ctx, { type: "airlines", args });
  },
});

export const createAirport = internalMutation({
  args: {
    uniqueId: v.string(),
    name: v.string(),
    iata_code: v.string(),
    iso_country: v.string(),
    municipality: v.optional(v.string()),
    timezone: v.string(),
  },
  handler: async (ctx, args) => {
    return await getOrCreateEntity(ctx, { type: "airports", args });
  },
});

export const createFlight = internalMutation({
  args: {
    uniqueId: v.string(),
    airline: v.id("airlines"),
    flightNumber: v.string(),
    from: v.id("airports"),
    to: v.id("airports"),
    departure: v.string(),
    arrival: v.string(),
  },
  handler: async (ctx, args) => {
    return await getOrCreateEntity(ctx, { type: "flights", args });
  },
});

export const createDeal = internalMutation({
  args: {
    uniqueId: v.string(),
    flights: v.array(v.id("flights")),
    price: v.number(),
    dealer: v.string(),
    link: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    return await getOrCreateEntity(ctx, { type: "deals", args });
  },
});
