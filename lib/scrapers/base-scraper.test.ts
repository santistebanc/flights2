import {
  BaseFlightScraper,
  ScrapingPhase1Result,
  ScrapingPhase2Result,
} from "./base-scraper";
import { FlightSearchParams } from "../../types/scraper";

// Create a concrete implementation for testing
class TestScraper extends BaseFlightScraper {
  constructor() {
    super("TestScraper", "https://test.example.com");
  }

  protected async executePhase1(
    params: FlightSearchParams
  ): Promise<ScrapingPhase1Result> {
    this.logProgress("phase1", "Executing phase 1");
    return {
      token: "test_token_123",
      session: "test_session_456",
    };
  }

  protected async executePhase2(
    params: FlightSearchParams,
    phase1Result: ScrapingPhase1Result
  ): Promise<ScrapingPhase2Result> {
    this.logProgress("phase2", "Executing phase 2");
    return {
      flights: [],
      bundles: [],
      bookingOptions: [],
    };
  }

  // Expose protected methods for testing
  public testGenerateUniqueId(prefix: string, data: string): string {
    return this.generateUniqueId(prefix, data);
  }

  public testValidateParams(params: FlightSearchParams): void {
    return this.validateParams(params);
  }
}

describe("BaseFlightScraper", () => {
  let scraper: TestScraper;

  beforeEach(() => {
    scraper = new TestScraper();
  });

  describe("validation", () => {
    it("validates correct search parameters", () => {
      const validParams: FlightSearchParams = {
        departureAirport: "NYC",
        arrivalAirport: "LAX",
        departureDate: new Date("2024-01-15"),
        isRoundTrip: false,
      };

      expect(() => scraper.testValidateParams(validParams)).not.toThrow();
    });

    it("validates round trip parameters", () => {
      const validRoundTripParams: FlightSearchParams = {
        departureAirport: "NYC",
        arrivalAirport: "LAX",
        departureDate: new Date("2024-01-15"),
        returnDate: new Date("2024-01-22"),
        isRoundTrip: true,
      };

      expect(() =>
        scraper.testValidateParams(validRoundTripParams)
      ).not.toThrow();
    });

    it("throws error for invalid departure airport", () => {
      const invalidParams: FlightSearchParams = {
        departureAirport: "N", // Too short
        arrivalAirport: "LAX",
        departureDate: new Date("2024-01-15"),
        isRoundTrip: false,
      };

      expect(() => scraper.testValidateParams(invalidParams)).toThrow(
        "Invalid departure airport IATA code"
      );
    });

    it("throws error for invalid arrival airport", () => {
      const invalidParams: FlightSearchParams = {
        departureAirport: "NYC",
        arrivalAirport: "", // Empty
        departureDate: new Date("2024-01-15"),
        isRoundTrip: false,
      };

      expect(() => scraper.testValidateParams(invalidParams)).toThrow(
        "Invalid arrival airport IATA code"
      );
    });

    it("throws error for missing departure date", () => {
      const invalidParams: FlightSearchParams = {
        departureAirport: "NYC",
        arrivalAirport: "LAX",
        departureDate: null as any,
        isRoundTrip: false,
      };

      expect(() => scraper.testValidateParams(invalidParams)).toThrow(
        "Departure date is required"
      );
    });

    it("throws error for round trip without return date", () => {
      const invalidParams: FlightSearchParams = {
        departureAirport: "NYC",
        arrivalAirport: "LAX",
        departureDate: new Date("2024-01-15"),
        isRoundTrip: true,
        // Missing returnDate
      };

      expect(() => scraper.testValidateParams(invalidParams)).toThrow(
        "Return date is required for round trips"
      );
    });
  });

  describe("unique ID generation", () => {
    it("generates consistent unique IDs for same input", () => {
      const id1 = scraper.testGenerateUniqueId(
        "flight",
        "NYC-LAX-2024-01-15-AA123"
      );
      const id2 = scraper.testGenerateUniqueId(
        "flight",
        "NYC-LAX-2024-01-15-AA123"
      );

      expect(id1).toBe(id2);
      expect(id1).toMatch(/^flight_[a-z0-9]+$/);
    });

    it("generates different IDs for different inputs", () => {
      const id1 = scraper.testGenerateUniqueId(
        "flight",
        "NYC-LAX-2024-01-15-AA123"
      );
      const id2 = scraper.testGenerateUniqueId(
        "flight",
        "NYC-LAX-2024-01-15-AA124"
      );

      expect(id1).not.toBe(id2);
    });

    it("generates different IDs for different prefixes", () => {
      const id1 = scraper.testGenerateUniqueId(
        "flight",
        "NYC-LAX-2024-01-15-AA123"
      );
      const id2 = scraper.testGenerateUniqueId(
        "bundle",
        "NYC-LAX-2024-01-15-AA123"
      );

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^flight_/);
      expect(id2).toMatch(/^bundle_/);
    });
  });

  describe("scraper identification", () => {
    it("returns correct scraper name", () => {
      expect(scraper.getName()).toBe("TestScraper");
    });
  });

  describe("main scraping flow", () => {
    it("executes both phases successfully", async () => {
      const params: FlightSearchParams = {
        departureAirport: "NYC",
        arrivalAirport: "LAX",
        departureDate: new Date("2024-01-15"),
        isRoundTrip: false,
      };

      const result = await scraper.scrape(params);

      expect(result).toEqual({
        flights: [],
        bundles: [],
        bookingOptions: [],
      });
    });

    it("handles errors gracefully", async () => {
      // Create a scraper that throws an error
      class ErrorScraper extends BaseFlightScraper {
        constructor() {
          super("ErrorScraper", "https://error.example.com");
        }

        protected async executePhase1(): Promise<ScrapingPhase1Result> {
          throw new Error("Phase 1 failed");
        }

        protected async executePhase2(): Promise<ScrapingPhase2Result> {
          throw new Error("Phase 2 failed");
        }
      }

      const errorScraper = new ErrorScraper();
      const params: FlightSearchParams = {
        departureAirport: "NYC",
        arrivalAirport: "LAX",
        departureDate: new Date("2024-01-15"),
        isRoundTrip: false,
      };

      await expect(errorScraper.scrape(params)).rejects.toThrow(
        "[ErrorScraper] Scraping failed: Phase 1 failed"
      );
    });
  });
});
