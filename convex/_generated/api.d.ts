/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as airports from "../airports.js";
import type * as bookingOptions from "../bookingOptions.js";
import type * as bundles from "../bundles.js";
import type * as data_processing from "../data_processing.js";
import type * as duplicate_handling from "../duplicate_handling.js";
import type * as flights from "../flights.js";
import type * as scrapingActions from "../scrapingActions.js";
import type * as scraping_logs from "../scraping_logs.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  airports: typeof airports;
  bookingOptions: typeof bookingOptions;
  bundles: typeof bundles;
  data_processing: typeof data_processing;
  duplicate_handling: typeof duplicate_handling;
  flights: typeof flights;
  scrapingActions: typeof scrapingActions;
  scraping_logs: typeof scraping_logs;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
