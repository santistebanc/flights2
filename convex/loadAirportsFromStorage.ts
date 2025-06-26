"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export const testFileAccess = action({
  args: {},
  returns: v.string(),
  handler: async (ctx, args) => {
    try {
      const fileId = "kg25f963sqn9pmpy0738be447x7jg7ns" as Id<"_storage">;
      console.log("Attempting to access file:", fileId);
      
      const fileData = await ctx.storage.get(fileId);
      if (!fileData) {
        return "File not found in storage";
      }
      
      const text = await fileData.text();
      const data = JSON.parse(text);
      const airportCount = Object.keys(data).length;
      
      return `File found! Contains ${airportCount} airports. First airport: ${JSON.stringify(Object.values(data)[0])}`;
    } catch (error) {
      return `Error: ${error}`;
    }
  },
});

export const loadAirportsFromStorage = action({
  args: {},
  returns: v.string(),
  handler: async (ctx, args) => {
    const fileId = "kg25f963sqn9pmpy0738be447x7jg7ns" as Id<"_storage">;
    const fileData = await ctx.storage.get(fileId);
    if (!fileData) {
      throw new Error("airports.json file not found in storage. Please check the file ID.");
    }
    const airportsData = JSON.parse(await fileData.text());
    let createdCount = 0;
    let alreadyExistsCount = 0;
    let skippedCount = 0;
    
    for (const [iataCode, airportRaw] of Object.entries(airportsData)) {
      const airport = airportRaw as {
        name: string;
        iata_code: string;
        iso_country: string;
        municipality?: string;
        timezone: string;
      };
      
      if (
        airport.name &&
        airport.iata_code &&
        airport.iso_country &&
        airport.timezone
      ) {
        try {
          const wasCreated = await ctx.runMutation(internal.mutations.createAirport, {
            uniqueId: airport.iata_code,
            name: airport.name,
            iata_code: airport.iata_code,
            iso_country: airport.iso_country,
            municipality: airport.municipality,
            timezone: airport.timezone,
          });
          
          if (wasCreated) {
            createdCount++;
          } else {
            alreadyExistsCount++;
          }
        } catch (error) {
          console.error(`Error processing airport ${airport.iata_code}:`, error);
          skippedCount++;
        }
      } else {
        console.warn(`Skipping airport ${iataCode} - missing required fields`);
        skippedCount++;
      }
    }
    
    return `Created ${createdCount} new airports, ${alreadyExistsCount} already existed, skipped ${skippedCount} airports.`;
  },
}); 