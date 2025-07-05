import {
  FlightSearchParams,
  ScrapeResult,
  ScrapedFlight,
  ScrapedBundle,
  ScrapedBookingOption,
} from "../../types/scraper";

export interface ScrapingPhase1Result {
  token: string;
  session?: string;
  suuid?: string;
  deeplink?: string;
  cookie?: string;
}

export interface ScrapingPhase2Result {
  bundles: ScrapedBundle[];
}

export interface ScrapingError {
  phase: "phase1" | "phase2" | "unknown";
  message: string;
  details?: any;
  timestamp: number;
}

export abstract class BaseFlightScraper {
  protected readonly name: string;
  protected readonly baseUrl: string;

  constructor(name: string, baseUrl: string) {
    this.name = name;
    this.baseUrl = baseUrl;
  }

  /**
   * Main scraping method that orchestrates the two-phase process
   */
  async scrape(params: FlightSearchParams): Promise<ScrapeResult> {
    try {
      // Phase 1: Get session data (token, etc.)
      const phase1Result = await this.executePhase1(params);

      // Phase 2: Get actual flight data
      const phase2Result = await this.executePhase2(params, phase1Result);

      return {
        bundles: phase2Result.bundles,
      };
    } catch (error) {
      const scrapingError: ScrapingError = {
        phase: "unknown",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        details: error,
        timestamp: Date.now(),
      };

      this.logError(scrapingError);
      throw new Error(
        `[${this.name}] Scraping failed: ${scrapingError.message}`
      );
    }
  }

  /**
   * Phase 1: Extract session data (token, session, etc.) from initial HTML
   * Must be implemented by each scraper
   */
  protected abstract executePhase1(
    params: FlightSearchParams
  ): Promise<ScrapingPhase1Result>;

  /**
   * Phase 2: Extract flight data using session data from Phase 1
   * Must be implemented by each scraper
   */
  protected abstract executePhase2(
    params: FlightSearchParams,
    phase1Result: ScrapingPhase1Result
  ): Promise<ScrapingPhase2Result>;

  /**
   * Log scraping errors for monitoring and debugging
   */
  protected logError(error: ScrapingError): void {
    console.error(`[${this.name}] Scraping Error:`, {
      phase: error.phase,
      message: error.message,
      timestamp: new Date(error.timestamp).toISOString(),
      details: error.details,
    });
  }

  /**
   * Log scraping progress for monitoring
   */
  protected logProgress(
    phase: "phase1" | "phase2",
    message: string,
    details?: any
  ): void {
    // Progress logging disabled for production
  }

  /**
   * Validate search parameters
   */
  protected validateParams(params: FlightSearchParams): void {
    if (!params.departureAirport || params.departureAirport.length !== 3) {
      throw new Error("Invalid departure airport IATA code");
    }
    if (!params.arrivalAirport || params.arrivalAirport.length !== 3) {
      throw new Error("Invalid arrival airport IATA code");
    }
    if (!params.departureDate) {
      throw new Error("Departure date is required");
    }
    if (params.isRoundTrip && !params.returnDate) {
      throw new Error("Return date is required for round trips");
    }
  }

  /**
   * Get scraper name for logging and identification
   */
  getName(): string {
    return this.name;
  }
}
