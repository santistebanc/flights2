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
} from "../skyscanner-html-extractor";

export class SkyscannerScraper extends BaseFlightScraper {
  constructor() {
    super("skyscanner", "https://www.flightsfinder.com");
  }

  /**
   * Phase 1: Fetch initial HTML and extract token, session, suuid, and deeplink
   */
  protected async executePhase1(
    params: FlightSearchParams
  ): Promise<ScrapingPhase1Result> {
    this.logProgress("phase1", "Starting Skyscanner Phase 1 scraping");
    this.validateParams(params);

    try {
      // Build query parameters for Skyscanner
      const queryParams = this.buildPhase1QueryParams(params);
      const url = `${this.baseUrl}/portal/sky?${queryParams}`;

      this.logProgress("phase1", `Fetching HTML from ${url}`);

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

      this.logProgress("phase1", "Extracting session data from HTML");

      // Extract token, session, suuid, and deeplink from HTML
      const phase1Data = extractSessionDataFromPhase1Html(html);

      // Log extracted session data
      this.logProgress(
        "phase1",
        `Extracted token: ${phase1Data.token || "NOT_FOUND"}`
      );
      this.logProgress(
        "phase1",
        `Extracted session: ${phase1Data.session || "NOT_FOUND"}`
      );
      this.logProgress(
        "phase1",
        `Extracted suuid: ${phase1Data.suuid || "NOT_FOUND"}`
      );
      this.logProgress(
        "phase1",
        `Extracted deeplink: ${phase1Data.deeplink || "NOT_FOUND"}`
      );
      this.logProgress(
        "phase1",
        `Extracted cookie: ${cookie ? cookie.substring(0, 50) + "..." : "NOT_FOUND"}`
      );

      this.logProgress("phase1", "Phase 1 completed successfully");

      return {
        token: phase1Data.token,
        session: phase1Data.session,
        suuid: phase1Data.suuid,
        deeplink: phase1Data.deeplink,
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
   * Phase 2: Poll for results using session data
   */
  protected async executePhase2(
    params: FlightSearchParams,
    phase1Result: ScrapingPhase1Result
  ): Promise<ScrapingPhase2Result> {
    this.logProgress("phase2", "Starting Skyscanner Phase 2 polling");

    try {
      let currentCookie = phase1Result.cookie;
      let allBundles: ScrapedBundle[] = [];
      let isComplete = false;
      let pollCount = 0;
      const maxPolls = 50; // Prevent infinite polling

      while (!isComplete && pollCount < maxPolls) {
        pollCount++;
        this.logProgress("phase2", `Polling attempt ${pollCount}`);

        // Build POST data for polling
        const postData = this.buildPhase2PostData(params, phase1Result);
        const url = `${this.baseUrl}/portal/sky/poll`;

        // Make the POST request
        const headers: Record<string, string> = {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Accept-Encoding": "gzip, deflate",
          "Content-Type": "application/x-www-form-urlencoded",
          Connection: "keep-alive",
          "Upgrade-Insecure-Requests": "1",
        };

        if (currentCookie) {
          headers.Cookie = currentCookie;
        }

        const response = await fetch(url, {
          method: "POST",
          headers,
          body: postData,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const responseText = await response.text();

        // Update cookie from response and log changes
        const newCookie = response.headers.get("set-cookie");
        if (newCookie) {
          const oldCookie = currentCookie;
          currentCookie = newCookie;
          this.logProgress("phase2", `Updated cookie from response headers`);
          this.logProgress(
            "phase2",
            `Old cookie: ${oldCookie ? oldCookie.substring(0, 50) + "..." : "NOT_FOUND"}`
          );
          this.logProgress(
            "phase2",
            `New cookie: ${newCookie.substring(0, 50) + "..."}`
          );
        } else {
          this.logProgress(
            "phase2",
            `No new cookie in response headers, keeping existing`
          );
        }

        // Parse the response (split by '|' and extract parts)
        const parts = responseText.split("|");
        if (parts.length < 7) {
          throw new Error(
            `Invalid response format: expected at least 7 parts, got ${parts.length}`
          );
        }

        const status = parts[0]; // 'Y' or 'N'
        const numResults = parseInt(parts[1] || "0", 10);
        const resultHtml = parts[6]; // 7th part (0-indexed)

        this.logProgress(
          "phase2",
          `Poll ${pollCount}: status=${status}, results=${numResults}`
        );

        if (status === "Y") {
          // Polling complete
          isComplete = true;
        }

        if (resultHtml && resultHtml.length > 0) {
          // Extract bundles from this batch of results (includes flights and booking options)
          const bundles = extractBundlesFromPhase2Html(resultHtml);

          // Add to cumulative results
          allBundles.push(...bundles);

          this.logProgress(
            "phase2",
            `Extracted ${bundles.length} bundles from poll ${pollCount}`
          );
        }

        // If not complete, wait before next poll
        if (!isComplete) {
          await new Promise((resolve) => setTimeout(resolve, 100)); // 100ms delay
        }
      }

      if (!isComplete) {
        this.logProgress(
          "phase2",
          `Polling incomplete after ${maxPolls} attempts`
        );
      }

      this.logProgress(
        "phase2",
        `Phase 2 completed: ${allBundles.length} total bundles`
      );

      return { bundles: allBundles };
    } catch (error) {
      const scrapingError = {
        phase: "phase2" as const,
        message:
          error instanceof Error ? error.message : "Unknown error in Phase 2",
        details: error,
        timestamp: Date.now(),
      };
      this.logError(scrapingError);
      throw error;
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
    searchParams.append("cabinclass", "Economy");
    searchParams.append("adults", "1");
    searchParams.append("children", "0");
    searchParams.append("infants", "0");
    searchParams.append("currency", "EUR");

    return searchParams.toString();
  }

  /**
   * Build POST data for Phase 2 polling
   */
  private buildPhase2PostData(
    params: FlightSearchParams,
    phase1Result: ScrapingPhase1Result
  ): string {
    const postData = new URLSearchParams();

    // Add session data from Phase 1
    if (phase1Result.token) {
      postData.append("_token", phase1Result.token);
    }
    if (phase1Result.session) {
      postData.append("session", phase1Result.session);
    }
    if (phase1Result.suuid) {
      postData.append("suuid", phase1Result.suuid);
    }
    if (phase1Result.deeplink) {
      postData.append("deeplink", phase1Result.deeplink);
    }

    // Add additional required parameters
    postData.append("noc", Date.now().toString()); // Current timestamp
    postData.append("s", "www"); // Site parameter
    postData.append("adults", "1");
    postData.append("children", "0");
    postData.append("infants", "0");
    postData.append("currency", "EUR");

    return postData.toString();
  }

  /**
   * Format date for Skyscanner API (YYYY-MM-DD format)
   */
  private formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
  }
}
