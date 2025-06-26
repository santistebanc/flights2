import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const client = new ConvexHttpClient("https://content-warbler-440.convex.cloud");

async function loadAirports() {
  try {
    console.log("Loading airports from storage...");
    const result = await client.action(api.loadAirports.loadAirportsFromStorage, {});
    console.log("Result:", result);
  } catch (error) {
    console.error("Error loading airports:", error);
    process.exit(1);
  }
}

loadAirports(); 