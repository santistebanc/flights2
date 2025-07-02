#!/usr/bin/env node

/**
 * Script to clear all flight-related data from the database
 * Usage: node scripts/clear-flight-data.js
 */

import { ConvexHttpClient } from "convex/browser";

// Get the Convex URL from environment or use default
const CONVEX_URL = process.env.CONVEX_URL || "https://coordinated-seahorse-724.convex.cloud";

async function clearFlightData() {
  try {
    console.log("🗑️ Connecting to Convex...");
    const client = new ConvexHttpClient(CONVEX_URL);
    
    console.log("🗑️ Clearing flight data...");
    const result = await client.mutation("mutations:clearFlightData", {
      confirm: "DELETE_ALL_FLIGHT_DATA"
    });
    
    if (result.success) {
      console.log("✅ Database cleanup completed successfully!");
      console.log("📊 Deleted counts:");
      console.log(`   - Booking Options: ${result.deletedCounts.bookingOptions}`);
      console.log(`   - Bundles: ${result.deletedCounts.bundles}`);
      console.log(`   - Flights: ${result.deletedCounts.flights}`);
    } else {
      console.error("❌ Database cleanup failed");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

// Run the script
clearFlightData(); 