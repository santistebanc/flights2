#!/usr/bin/env node

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
config({ path: join(__dirname, "../.env.local") });

// Get Convex URL from environment
const CONVEX_URL = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;

if (!CONVEX_URL) {
    console.error("❌ Error: CONVEX_URL environment variable not set");
    console.error("Please set VITE_CONVEX_URL or CONVEX_URL in your environment");
    process.exit(1);
}

async function clearFlightData() {
    console.log("🗑️  Clearing flight data...");
    console.log(`📡 Connecting to: ${CONVEX_URL}`);

    const client = new ConvexHttpClient(CONVEX_URL);

    try {
        const result = await client.mutation(api.clearData.clearFlightData, {});

        if (result.success) {
            console.log("✅ Success!");
            console.log(`📊 Deleted counts:`);
            console.log(`   - Booking Options: ${result.deletedCounts.bookingOptions}`);
            console.log(`   - Bundles: ${result.deletedCounts.bundles}`);
            console.log(`   - Flights: ${result.deletedCounts.flights}`);
            console.log(`💬 ${result.message}`);
        } else {
            console.error("❌ Failed to clear data:");
            console.error(result.message);
            process.exit(1);
        }
    } catch (error) {
        console.error("❌ Error calling clearFlightData action:");
        console.error(error.message);
        process.exit(1);
    }
}

// Run the script
clearFlightData().catch((error) => {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
}); 