export interface FlightSearchParams {
  departureAirport: string; // IATA code
  arrivalAirport: string; // IATA code
  departureDate: Date;
  returnDate?: Date;
  isRoundTrip: boolean;
}

export interface ScrapedFlight {
  flightNumber: string;
  departureAirportIataCode: string; // IATA code
  arrivalAirportIataCode: string; // IATA code
  departureTime: string; // HH:MM format
  duration: number; // duration in minutes
  connectionDurationFromPreviousFlight?: number; // duration in minutes
}

export interface ScrapedBookingOption {
  agency: string;
  price: number;
  linkToBook: string;
  currency: string;
  extractedAt: number; // Unix ms
}

export interface ScrapedBundle {
  outboundDate: string; // YYYY-MM-DD format
  inboundDate: string; // YYYY-MM-DD format
  outboundFlights: ScrapedFlight[];
  inboundFlights: ScrapedFlight[];
  bookingOptions: ScrapedBookingOption[];
}

export interface ScrapeResult {
  bundles: ScrapedBundle[];
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
