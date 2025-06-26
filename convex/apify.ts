"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { ApifyClient } from "apify-client";

export const runApifyActor = action({
  args: v.object({
    from: v.string(),
    to: v.string(),
    outboundDate: v.string(),
    inboundDate: v.optional(v.string()),
    isRoundTrip: v.boolean(),
  }),
  returns: v.object({ runId: v.string(), status: v.string(), input: v.any() }),
  handler: async (ctx, args) => {
    const token = process.env.APIFY_TOKEN;
    if (!token) throw new Error("APIFY_TOKEN not set in environment");
    const client = new ApifyClient({ token });
    const actorId = "KQvc45mofBo5I2p7s";
    // Map to Apify actor's expected input
    const input = {
      origin: args.from,
      destination: args.to,
      outDate: args.outboundDate,
      inDate: args.inboundDate,
    };
    const run = await client.actor(actorId).start(input);
    return { runId: run.id, status: run.status, input };
  },
}); 