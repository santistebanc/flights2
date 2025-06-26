import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const client = new ConvexHttpClient("https://content-warbler-440.convex.cloud");

async function testFileAccess() {
  try {
    console.log("Testing file access...");
    const result = await client.action(api.loadAirportsFromStorage.testFileAccess, {});
    console.log("Result:", result);
  } catch (error) {
    console.error("Error testing file access:", error);
    process.exit(1);
  }
}

testFileAccess(); 