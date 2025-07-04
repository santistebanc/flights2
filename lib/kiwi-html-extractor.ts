import * as cheerio from "cheerio";
import {
  ScrapedFlight,
  ScrapedBundle,
  ScrapedBookingOption,
} from "../types/scraper";

export interface SessionData {
  cookie: string;
  token: string;
}

// Phase 1: Extract session data (token, cookie) from initial HTML
export function extractSessionDataFromPhase1Html(html: string): {
  cookie: string;
  token: string;
} {
  const $ = cheerio.load(html);
  let token = "";

  // Try multiple extraction strategies in order of preference

  // Strategy 1: Look for _token in script tags (most common)
  $("script").each((_, script) => {
    const scriptContent = $(script).html() || "";
    const patterns = [
      /_token:\s*["']([^"']+)["']/,
      /['"]_token['"]\s*:\s*['"]([^'"]+)['"]/,
      /token:\s*["']([^"']+)["']/,
      /['"]token['"]\s*:\s*['"]([^'"]+)['"]/,
    ];

    for (const pattern of patterns) {
      const tokenMatch = scriptContent.match(pattern);
      if (tokenMatch) {
        token = tokenMatch[1];
        return false; // Break early when found
      }
    }
  });

  // Strategy 2: Look for CSRF token in meta tags
  if (!token) {
    const metaToken = $('meta[name="csrf-token"]').attr("content");
    if (metaToken) {
      token = metaToken;
    }
  }

  // Strategy 3: Look for _token in input fields
  if (!token) {
    const inputToken = $('input[name="_token"]').attr("value");
    if (inputToken) {
      token = inputToken;
    }
  }

  // Strategy 4: Search entire HTML for token patterns
  if (!token) {
    const patterns = [
      /_token:\s*["']([^"']+)["']/,
      /['"]_token['"]\s*:\s*['"]([^'"]+)['"]/,
      /token:\s*["']([^"']+)["']/,
      /['"]token['"]\s*:\s*['"]([^'"]+)['"]/,
      /csrf-token['"]\s*:\s*['"]([^'"]+)['"]/,
      /<meta[^>]*name=["']csrf-token["'][^>]*content=["']([^'"]+)["']/,
      /<input[^>]*name=["']_token["'][^>]*value=["']([^'"]+)["']/,
    ];

    for (const pattern of patterns) {
      const tokenMatch = html.match(pattern);
      if (tokenMatch) {
        token = tokenMatch[1];
        break;
      }
    }
  }

  return { cookie: "", token };
}

// Phase 2: Extract bundles from results HTML
export function extractBundlesFromPhase2Html(html: string): ScrapedBundle[] {
  const bundles: ScrapedBundle[] = [];

  const $ = cheerio.load(html);

  // Find all bundle divs with data attributes
  $("div.list-item").each((i, bundleDiv) => {
    const $bundle = $(bundleDiv);

    // Find the modal corresponding to this bundle
    const modalId = $bundle
      .find("a.modal_responsive")
      .attr("onclick")
      ?.match(/\$\(['"]#myModal(\d+)['"]\)/)?.[1];
    const $modal = modalId ? $(`#myModal${modalId}`) : null;

    if ($modal) {
      // Extract outbound/inbound dates from headings
      const $headings = $modal.find("p._heading");
      const outboundDate =
        $headings
          .eq(0)
          .text()
          .match(/\w{3},\s+\d{1,2}\s+\w{3}\s+\d{4}/)?.[0] || "";
      const inboundDate =
        $headings
          .eq(1)
          .text()
          .match(/\w{3},\s+\d{1,2}\s+\w{3}\s+\d{4}/)?.[0] || "";
      const convertDate = (dateStr: string) => {
        const parts = dateStr.match(/(\w{3}),\s+(\d{1,2})\s+(\w{3})\s+(\d{4})/);
        if (parts) {
          const day = parseInt(parts[2]);
          const month = parts[3];
          const year = parseInt(parts[4]);
          const monthMap: { [key: string]: number } = {
            Jan: 0,
            Feb: 1,
            Mar: 2,
            Apr: 3,
            May: 4,
            Jun: 5,
            Jul: 6,
            Aug: 7,
            Sep: 8,
            Oct: 9,
            Nov: 10,
            Dec: 11,
          };
          const monthIndex = monthMap[month];
          if (monthIndex !== undefined) {
            return new Date(Date.UTC(year, monthIndex, day))
              .toISOString()
              .split("T")[0];
          }
        }
        return "";
      };
      const outboundDateStr = convertDate(outboundDate);
      const inboundDateStr = inboundDate ? convertDate(inboundDate) : "";

      // Extract flights from this modal
      const { outboundFlights, inboundFlights } = extractFlightsFromModal(
        $modal,
        $,
        outboundDateStr,
        inboundDateStr
      );
      // Extract booking options for this bundle
      const bookingOptions = extractBookingOptionsFromModal($modal, $);
      const bundle: ScrapedBundle = {
        outboundDate: outboundDateStr,
        inboundDate: inboundDateStr,
        outboundFlights,
        inboundFlights,
        bookingOptions,
      };
      bundles.push(bundle);
    }
  });

  return bundles;
}

// Helper function to extract flights from a modal
function extractFlightsFromModal(
  $modal: cheerio.Cheerio<any>,
  $: cheerio.CheerioAPI,
  outboundDate: string,
  inboundDate: string
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
      const tokens = flightText.split(/\s+/);
      let flightNumber = "";
      if (tokens.length >= 2) {
        flightNumber = tokens.slice(-2).join("");
      }
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

// Helper function to extract booking options from a modal
function extractBookingOptionsFromModal(
  $modal: cheerio.Cheerio<any>,
  $: cheerio.CheerioAPI
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
    console.log(`[Kiwi] Raw price text: "${priceText}" for agency: ${agency}`);

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
            `[Kiwi] Extracted price: ${price} using pattern: ${pattern}`
          );
          break;
        }
      }
    }

    if (price === 0) {
      console.warn(
        `[Kiwi] Failed to extract price from: "${priceText}" for agency: ${agency}`
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

// Legacy functions for backward compatibility (deprecated)
export function extractFlightsFromPhase2Html(html: string): ScrapedFlight[] {
  const bundles = extractBundlesFromPhase2Html(html);
  const flights: ScrapedFlight[] = [];

  bundles.forEach((bundle) => {
    flights.push(...bundle.outboundFlights, ...bundle.inboundFlights);
  });

  return flights;
}

export function extractBookingOptionsFromPhase2Html(
  html: string
): ScrapedBookingOption[] {
  const bundles = extractBundlesFromPhase2Html(html);
  const bookingOptions: ScrapedBookingOption[] = [];

  bundles.forEach((bundle) => {
    bookingOptions.push(...bundle.bookingOptions);
  });

  return bookingOptions;
}

function convertDateToYYYYMMDD(dateString: string): string {
  // Handle date formats like "Fri, 10 Oct 2025" or "Sat, 11 Oct 2025"
  const dateMatch = dateString.match(/(\w+),\s*(\d+)\s+(\w+)\s+(\d{4})/);
  if (dateMatch) {
    const [, , day, month, year] = dateMatch;
    const monthMap: { [key: string]: string } = {
      Jan: "01",
      Feb: "02",
      Mar: "03",
      Apr: "04",
      May: "05",
      Jun: "06",
      Jul: "07",
      Aug: "08",
      Sep: "09",
      Oct: "10",
      Nov: "11",
      Dec: "12",
    };
    const monthNum = monthMap[month] || "01";
    const dayNum = day.padStart(2, "0");
    return `${year}-${monthNum}-${dayNum}`;
  }

  // Fallback: try to parse as YYYY-MM-DD
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateString;
  }

  // Default fallback
  return new Date().toISOString().split("T")[0];
}

// Test function to show actual JSON output
export function testPhase2Extraction(html: string): {
  flights: ScrapedFlight[];
  bundles: ScrapedBundle[];
  bookingOptions: ScrapedBookingOption[];
} {
  const flights = extractFlightsFromPhase2Html(html);
  const bundles = extractBundlesFromPhase2Html(html);
  const bookingOptions = extractBookingOptionsFromPhase2Html(html);

  return {
    flights,
    bundles,
    bookingOptions,
  };
}
