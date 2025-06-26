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
import type * as auth from "../auth.js";
import type * as flights from "../flights.js";
import type * as http from "../http.js";
import type * as loadAirportsFromStorage from "../loadAirportsFromStorage.js";
import type * as mutations from "../mutations.js";
import type * as offers from "../offers.js";
import type * as queries from "../queries.js";
import type * as router from "../router.js";
import type * as webhooks from "../webhooks.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  flights: typeof flights;
  http: typeof http;
  loadAirportsFromStorage: typeof loadAirportsFromStorage;
  mutations: typeof mutations;
  offers: typeof offers;
  queries: typeof queries;
  router: typeof router;
  webhooks: typeof webhooks;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
