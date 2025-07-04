import * as cheerio from "cheerio";
import { ScrapedFlight, ScrapedBookingOption } from "../types/scraper";

/**
 * Shared HTML extraction utilities for both Kiwi and Skyscanner
 */

// Helper function to extract flights from a modal (shared logic)
export function extractFlightsFromModal(
  $modal: cheerio.Cheerio<any>,
  $: cheerio.CheerioAPI,
  outboundDate: string,
  inboundDate: string,
  flightNumberExtractor: (flightText: string) => string
): { outboundFlights: ScrapedFlight[]; inboundFlights: ScrapedFlight[] } {
  const outboundFlights: ScrapedFlight[] = [];
  const inboundFlights: ScrapedFlight[] = [];
  const outboundConnectionDurations: (number | undefined)[] = [];
  const inboundConnectionDurations: (number | undefined)[] = [];

  // Find all _panel elements (outbound first, inbound second if present)
  const panels = $modal.find("div._panel");
  panels.each((panelIdx, panel) => {
    const $panel = $(panel);
    const isOutbound = panelIdx === 0;
    // Find all _panel_body divs in the panel
    $panel.find("div._panel_body").each((i, panelBody) => {
      const $panelBody = $(panelBody);
      // Find the _head div and extract flight number
      const $head = $panelBody.find("div._head");
      const flightText = $head.find("small").first().text().trim();
      const flightNumber = flightNumberExtractor(flightText);
      // Find the _item div
      const $item = $panelBody.find("div._item");
      // Extract times from c3 div
      const times: string[] = [];
      $item.find("div.c3 p").each((_, el) => {
        const t = $(el).text().trim();
        if (/^\d{2}:\d{2}$/.test(t)) times.push(t);
      });
      if (times.length < 2) return;
      const departureTime = times[0];
      const arrivalTime = times[1];
      // Extract airports from c4 div
      const airports: string[] = [];
      $item.find("div.c4 p").each((_, el) => {
        const code = $(el).text().trim().split(" ")[0];
        if (/^[A-Z]{3}$/.test(code)) airports.push(code);
      });
      if (airports.length < 2) return;
      const departureAirport = airports[0];
      const arrivalAirport = airports[1];
      // Calculate duration from departure and arrival times
      const [depHour, depMin] = departureTime.split(":").map(Number);
      const [arrHour, arrMin] = arrivalTime.split(":").map(Number);
      let duration = arrHour * 60 + arrMin - (depHour * 60 + depMin);
      if (duration <= 0) duration += 24 * 60;
      // Extract connection duration (if present) after this flight
      let connectionDuration: number | undefined = undefined;
      const $connect = $item.find("p.connect_airport").first();
      if ($connect.length && $connect.hasClass("connect_airport")) {
        const text = $connect.text();
        const match = text.match(/(\d+)h\s*(\d+)?/);
        if (match) {
          const hours = parseInt(match[1]);
          const minutes = match[2] ? parseInt(match[2]) : 0;
          connectionDuration = hours * 60 + minutes;
        }
      }
      const flight: ScrapedFlight = {
        flightNumber: flightNumber,
        departureAirportIataCode: departureAirport,
        arrivalAirportIataCode: arrivalAirport,
        departureTime: departureTime,
        duration: duration,
        // connectionDurationFromPreviousFlight will be set after loop
      };
      if (isOutbound) {
        outboundConnectionDurations.push(connectionDuration);
        outboundFlights.push(flight);
      } else {
        inboundConnectionDurations.push(connectionDuration);
        inboundFlights.push(flight);
      }
    });
  });
  // Assign connectionDurationFromPreviousFlight to the next flight in each direction
  function assignConnections(
    flights: ScrapedFlight[],
    connectionDurations: (number | undefined)[]
  ) {
    for (let i = 1; i < flights.length; i++) {
      if (connectionDurations[i - 1] !== undefined) {
        flights[i].connectionDurationFromPreviousFlight =
          connectionDurations[i - 1];
      }
    }
  }
  assignConnections(outboundFlights, outboundConnectionDurations);
  assignConnections(inboundFlights, inboundConnectionDurations);
  return { outboundFlights, inboundFlights };
}

// Helper function to extract booking options from a modal (shared logic)
export function extractBookingOptionsFromModal(
  $modal: cheerio.Cheerio<any>,
  $: cheerio.CheerioAPI,
  source: "kiwi" | "skyscanner"
): ScrapedBookingOption[] {
  const bookingOptions: ScrapedBookingOption[] = [];

  // Find booking options in the modal
  $modal.find("div._similar").each((_, similarElement) => {
    const $similar = $(similarElement);

    // Extract agency name
    const agencyText = $similar.find("p").first().text().trim();
    const agency = agencyText || "Unknown";

    // Extract price with improved parsing
    const priceText = $similar.find("p").eq(1).text().trim();
    console.log(
      `[${source.charAt(0).toUpperCase() + source.slice(1)}] Raw price text: "${priceText}" for agency: ${agency}`
    );

    // Try multiple price extraction patterns
    let price = 0;
    const pricePatterns = [
      /€(\d+(?:\.\d{2})?)/, // €291 or €291.50
      /EUR\s*(\d+(?:\.\d{2})?)/, // EUR 291 or EUR 291.50
      /(\d+(?:\.\d{2})?)\s*€/, // 291€ or 291.50€
      /(\d+(?:\.\d{2})?)\s*EUR/, // 291 EUR or 291.50 EUR
      /(\d+(?:\.\d{2})?)/, // Just numbers (fallback)
    ];

    for (const pattern of pricePatterns) {
      const priceMatch = priceText.match(pattern);
      if (priceMatch) {
        const extractedPrice = parseFloat(priceMatch[1]);
        if (!isNaN(extractedPrice) && extractedPrice > 0) {
          price = extractedPrice;
          console.log(
            `[${source.charAt(0).toUpperCase() + source.slice(1)}] Extracted price: ${price} using pattern: ${pattern}`
          );
          break;
        }
      }
    }

    if (price === 0) {
      console.warn(
        `[${source.charAt(0).toUpperCase() + source.slice(1)}] Failed to extract price from: "${priceText}" for agency: ${agency}`
      );
    }

    // Extract booking link
    const $link = $similar.find("a");
    const linkToBook = $link.attr("href") || "";

    const bookingOption: ScrapedBookingOption = {
      agency,
      price,
      linkToBook,
      currency: "EUR",
      extractedAt: Date.now(),
    };

    bookingOptions.push(bookingOption);
  });

  return bookingOptions;
}

// Helper function to parse price text (shared logic)
export function parsePriceText(priceText: string, source: string): number {
  const pricePatterns = [
    /€(\d+(?:\.\d{2})?)/, // €291 or €291.50
    /EUR\s*(\d+(?:\.\d{2})?)/, // EUR 291 or EUR 291.50
    /(\d+(?:\.\d{2})?)\s*€/, // 291€ or 291.50€
    /(\d+(?:\.\d{2})?)\s*EUR/, // 291 EUR or 291.50 EUR
    /(\d+(?:\.\d{2})?)/, // Just numbers (fallback)
  ];

  for (const pattern of pricePatterns) {
    const priceMatch = priceText.match(pattern);
    if (priceMatch) {
      const extractedPrice = parseFloat(priceMatch[1]);
      if (!isNaN(extractedPrice) && extractedPrice > 0) {
        return extractedPrice;
      }
    }
  }

  return 0;
}
