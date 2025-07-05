import {
  BaseFlightScraper,
  ScrapingPhase1Result,
  ScrapingPhase2Result,
} from "./base-scraper";
import {
  FlightSearchParams,
  ScrapeResult,
  ScrapedFlight,
  ScrapedBundle,
  ScrapedBookingOption,
} from "../../types/scraper";
import {
  extractSessionDataFromPhase1Html,
  extractBundlesFromPhase2Html,
} from "../kiwi-html-extractor";

export class KiwiScraper extends BaseFlightScraper {
  constructor() {
    super("kiwi", "https://www.flightsfinder.com");
  }

  /**
   * Phase 1: Fetch initial HTML and extract token and cookie
   */
  protected async executePhase1(
    params: FlightSearchParams
  ): Promise<ScrapingPhase1Result> {
    this.logProgress("phase1", "Starting Kiwi Phase 1 scraping");
    this.validateParams(params);

    try {
      // Build query parameters for Kiwi
      const queryParams = this.buildPhase1QueryParams(params);
      const url = `${this.baseUrl}/portal/kiwi?${queryParams}`;

      // Only log the URL being fetched
      // this.logProgress("phase1", `Fetching HTML from ${url}`);

      // Fetch the initial HTML
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Accept-Encoding": "gzip, deflate",
          Connection: "keep-alive",
          "Upgrade-Insecure-Requests": "1",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const cookie = response.headers.get("set-cookie") || "";

      // this.logProgress("phase1", "Extracting token and session data from HTML");

      // Extract token and other session data from HTML
      const phase1Data = extractSessionDataFromPhase1Html(html);

      // Only log summary of extracted data
      // this.logProgress("phase1", `Extracted token: ${phase1Data.token ? phase1Data.token.substring(0, 20) + "..." : "NOT_FOUND"}`);
      // this.logProgress("phase1", `Extracted cookie: ${cookie ? cookie.substring(0, 50) + "..." : "NOT_FOUND"}`);

      this.logProgress("phase1", "Phase 1 completed successfully");

      return {
        token: phase1Data.token,
        cookie: cookie,
      };
    } catch (error) {
      const scrapingError = {
        phase: "phase1" as const,
        message:
          error instanceof Error ? error.message : "Unknown error in Phase 1",
        details: error,
        timestamp: Date.now(),
      };
      this.logError(scrapingError);
      throw error;
    }
  }

  /**
   * Phase 2: Use token and cookie to fetch actual flight data
   */
  protected async executePhase2(
    params: FlightSearchParams,
    phase1Result: ScrapingPhase1Result
  ): Promise<ScrapingPhase2Result> {
    this.logProgress("phase2", "Starting Kiwi Phase 2 scraping");

    let currentCookie = phase1Result.cookie;
    let currentToken = phase1Result.token;
    let retryCount = 0;
    const maxRetries = 2;

    while (retryCount <= maxRetries) {
      try {
        // Build POST data for Phase 2
        const postData = this.buildPhase2PostData(params, currentToken);
        const url = `${this.baseUrl}/portal/kiwi/search`;

        // Only log the first and last retry
        if (retryCount === 0 || retryCount === maxRetries) {
          this.logProgress(
            "phase2",
            `POSTing to ${url} (attempt ${retryCount + 1})`
          );
        }

        // Make the POST request
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate",
            "Content-Type": "application/x-www-form-urlencoded",
            Cookie: currentCookie || "",
            Connection: "keep-alive",
            "Upgrade-Insecure-Requests": "1",
          },
          body: postData,
        });

        // Always update cookie from response headers (even on success)
        const newCookie = response.headers.get("set-cookie");
        if (newCookie) {
          currentCookie = newCookie;
          // Only log on first/last retry
          if (retryCount === 0 || retryCount === maxRetries) {
            this.logProgress("phase2", `Updated cookie from response headers`);
          }
        }

        // Handle 419 error specifically
        if (response.status === 419) {
          // Only log on first/last retry
          if (retryCount === 0 || retryCount === maxRetries) {
            this.logProgress(
              "phase2",
              `HTTP 419 error on attempt ${retryCount + 1}`
            );
          }

          // Check if response includes a new token in the body
          const responseText = await response.text();
          const newToken = this.extractTokenFromResponse(responseText);

          if (newToken) {
            const oldToken = currentToken;
            currentToken = newToken;
            // Only log on first/last retry
            if (retryCount === 0 || retryCount === maxRetries) {
              this.logProgress("phase2", "Updated token from 419 response");
            }
            retryCount++;
            continue; // Retry with new token
          } else {
            // No new token in response, need to refresh session
            // Only log on first/last retry
            if (retryCount === 0 || retryCount === maxRetries) {
              this.logProgress(
                "phase2",
                "No new token found, refreshing session via Phase 1"
              );
            }

            // Repeat Phase 1 to get fresh session
            const newPhase1Result = await this.executePhase1(params);
            currentCookie = newPhase1Result.cookie;
            currentToken = newPhase1Result.token;

            // Only log on first/last retry
            if (retryCount === 0 || retryCount === maxRetries) {
              this.logProgress("phase2", "Session refreshed via Phase 1");
            }
            retryCount++;
            continue; // Retry with fresh session
          }
        }

        // Handle other HTTP errors
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const responseText = await response.text();

        // Only log on first/last retry
        if (retryCount === 0 || retryCount === maxRetries) {
          this.logProgress(
            "phase2",
            "Parsing response and extracting flight data"
          );
        }

        // Parse the response (split by '|' and extract 7th part)
        const parts = responseText.split("|");
        if (parts.length < 7) {
          throw new Error(
            `Invalid response format: expected at least 7 parts, got ${parts.length}`
          );
        }

        const resultHtml = parts[6]; // 7th part (0-indexed)
        const numResults = parseInt(parts[1] || "0", 10);

        // Only log on first/last retry
        if (retryCount === 0 || retryCount === maxRetries) {
          this.logProgress(
            "phase2",
            `Found ${numResults} results, extracting bundles`
          );
        }

        // Extract bundles from HTML (includes flights and booking options)
        const bundles = extractBundlesFromPhase2Html(resultHtml);

        // Only log on first/last retry
        if (retryCount === 0 || retryCount === maxRetries) {
          this.logProgress("phase2", `Extracted ${bundles.length} bundles`);
        }

        return { bundles };
      } catch (error) {
        // If it's not a 419 error, or we've exhausted retries, throw the error
        if (
          retryCount >= maxRetries ||
          (error instanceof Error && !error.message.includes("419"))
        ) {
          const scrapingError = {
            phase: "phase2" as const,
            message:
              error instanceof Error
                ? error.message
                : "Unknown error in Phase 2",
            details: error,
            timestamp: Date.now(),
          };
          this.logError(scrapingError);
          throw error;
        }

        // For 419 errors, continue to retry
        retryCount++;
        // Only log on first/last retry
        if (retryCount === 0 || retryCount === maxRetries) {
          this.logProgress(
            "phase2",
            `Retrying after error (attempt ${retryCount + 1}/${maxRetries + 1})`
          );
        }
      }
    }

    // This should never be reached, but just in case
    throw new Error("Max retries exceeded for Phase 2");
  }

  /**
   * Extract token from response body (for 419 error recovery)
   */
  private extractTokenFromResponse(responseText: string): string | null {
    try {
      // Try to extract token from response body if it contains HTML
      if (responseText.includes("_token")) {
        const tokenMatch = responseText.match(
          /['"]_token['"]\s*:\s*['"]([^'"]+)['"]/
        );
        if (tokenMatch) {
          return tokenMatch[1];
        }
      }

      // Try to extract from meta tag
      const metaMatch = responseText.match(
        /<meta[^>]*name=["']csrf-token["'][^>]*content=["']([^'"]+)["']/
      );
      if (metaMatch) {
        return metaMatch[1];
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Build query parameters for Phase 1 request
   */
  private buildPhase1QueryParams(params: FlightSearchParams): string {
    const searchParams = new URLSearchParams();

    searchParams.append("originplace", params.departureAirport);
    searchParams.append("destinationplace", params.arrivalAirport);
    searchParams.append("outbounddate", this.formatDate(params.departureDate));

    if (params.isRoundTrip && params.returnDate) {
      searchParams.append("inbounddate", this.formatDate(params.returnDate));
    }

    // Default values for other parameters
    searchParams.append("cabinclass", "M");
    searchParams.append("adults", "1");
    searchParams.append("children", "0");
    searchParams.append("infants", "0");
    searchParams.append("currency", "EUR");
    searchParams.append("type", params.isRoundTrip ? "return" : "oneway");
    searchParams.append("bags-cabin", "0");
    searchParams.append("bags-checked", "0");

    return searchParams.toString();
  }

  /**
   * Build POST data for Phase 2 request
   */
  private buildPhase2PostData(
    params: FlightSearchParams,
    token: string
  ): string {
    const postData = new URLSearchParams();

    // Add the token
    postData.append("_token", token);

    // Add all the same parameters as Phase 1
    postData.append("originplace", params.departureAirport);
    postData.append("destinationplace", params.arrivalAirport);
    postData.append("outbounddate", this.formatDate(params.departureDate));

    if (params.isRoundTrip && params.returnDate) {
      postData.append("inbounddate", this.formatDate(params.returnDate));
    }

    // Default values for other parameters
    postData.append("cabinclass", "M");
    postData.append("adults", "1");
    postData.append("children", "0");
    postData.append("infants", "0");
    postData.append("currency", "EUR");
    postData.append("type", params.isRoundTrip ? "return" : "oneway");
    postData.append("bags-cabin", "0");
    postData.append("bags-checked", "0");

    return postData.toString();
  }

  /**
   * Format date for Kiwi API (DD/MM/YYYY format)
   */
  private formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
