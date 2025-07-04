import * as cheerio from "cheerio";
import {
  ScrapedFlight,
  ScrapedBundle,
  ScrapedBookingOption,
} from "../types/scraper";
import {
  extractFlightsFromModal as sharedExtractFlightsFromModal,
  extractBookingOptionsFromModal as sharedExtractBookingOptionsFromModal,
} from "./shared-html-extractor";

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
    const $modal = $bundle.find(".modal").first();

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
  // Kiwi flight number extraction: take last 2 tokens and join them
  const kiwiFlightNumberExtractor = (flightText: string): string => {
    const tokens = flightText.split(/\s+/);
    if (tokens.length >= 2) {
      return tokens.slice(-2).join("");
    }
    return "";
  };

  return sharedExtractFlightsFromModal(
    $modal,
    $,
    outboundDate,
    inboundDate,
    kiwiFlightNumberExtractor
  );
}

// Helper function to extract booking options from a modal
function extractBookingOptionsFromModal(
  $modal: cheerio.Cheerio<any>,
  $: cheerio.CheerioAPI
): ScrapedBookingOption[] {
  return sharedExtractBookingOptionsFromModal($modal, $, "kiwi");
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
