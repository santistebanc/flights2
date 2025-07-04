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

      this.logProgress("phase1", "Extracting token and session data from HTML");

      // Extract token and other session data from HTML
      const phase1Data = extractSessionDataFromPhase1Html(html);

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

    try {
      // Build POST data for Phase 2
      const postData = this.buildPhase2PostData(params, phase1Result.token);
      const url = `${this.baseUrl}/portal/kiwi/search`;

      this.logProgress("phase2", `POSTing to ${url}`);

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
          Cookie: phase1Result.cookie || "",
          Connection: "keep-alive",
          "Upgrade-Insecure-Requests": "1",
        },
        body: postData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseText = await response.text();

      this.logProgress("phase2", "Parsing response and extracting flight data");

      // Parse the response (split by '|' and extract 7th part)
      const parts = responseText.split("|");
      if (parts.length < 7) {
        throw new Error(
          `Invalid response format: expected at least 7 parts, got ${parts.length}`
        );
      }

      const resultHtml = parts[6]; // 7th part (0-indexed)
      const numResults = parseInt(parts[1] || "0", 10);

      this.logProgress(
        "phase2",
        `Found ${numResults} results, extracting bundles`
      );

      // Extract bundles from HTML (includes flights and booking options)
      const bundles = extractBundlesFromPhase2Html(resultHtml);

      this.logProgress("phase2", `Extracted ${bundles.length} bundles`);

      return { bundles };
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
