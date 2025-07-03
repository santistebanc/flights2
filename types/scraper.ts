export interface FlightSearchParams {
  departureAirport: string; // IATA code
  arrivalAirport: string; // IATA code
  departureDate: Date;
  returnDate?: Date;
  isRoundTrip: boolean;
}

export interface ScrapedFlight {
  uniqueId: string;
  flightNumber: string;
  departureAirportId: string; // DB id
  arrivalAirportId: string; // DB id
  departureDateTime: number; // Unix ms
  arrivalDateTime: number; // Unix ms
}

export interface ScrapedBundle {
  uniqueId: string;
  outboundFlightUniqueIds: string[];
  inboundFlightUniqueIds: string[];
}

export interface ScrapedBookingOption {
  uniqueId: string;
  targetUniqueId: string; // bundle uniqueId
  agency: string;
  price: number;
  linkToBook: string;
  currency: string;
  extractedAt: number; // Unix ms
}

export interface ScrapeResult {
  flights: ScrapedFlight[];
  bundles: ScrapedBundle[];
  bookingOptions: ScrapedBookingOption[];
  rawHtml?: string; // Optionally include for debugging
}

export interface FlightScraper {
  /**
   * Run the scraping process for a given set of search parameters.
   * Returns all scraped entities, or throws on error.
   */
  scrape(params: FlightSearchParams): Promise<ScrapeResult>;
  // Optionally, add methods for progress, logging, etc.
}
