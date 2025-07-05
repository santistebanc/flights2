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

// Phase 1: Extract session data (token, session, suuid, deeplink, etc.) from initial HTML
export function extractSessionDataFromPhase1Html(html: string): {
  token: string;
  session: string;
  suuid: string;
  deeplink: string;
} {
  const $ = cheerio.load(html);
  let token = "";
  let session = "";
  let suuid = "";
  let deeplink = "";

  // Find all script tags and extract session data
  $("script").each((_, script) => {
    const scriptContent = $(script).html() || "";

    // Extract token
    const tokenMatch = scriptContent.match(
      /['"]_token['"]\s*:\s*['"`]([^'"`]+)['"`]/
    );
    if (tokenMatch) token = tokenMatch[1];

    // Extract session
    const sessionMatch = scriptContent.match(
      /['"]session['"]\s*:\s*['"`]([^'"`]+)['"`]/
    );
    if (sessionMatch) session = sessionMatch[1];

    // Extract suuid
    const suuidMatch = scriptContent.match(
      /['"]suuid['"]\s*:\s*['"`]([^'"`]+)['"`]/
    );
    if (suuidMatch) suuid = suuidMatch[1];

    // Extract deeplink
    const deeplinkMatch = scriptContent.match(
      /['"]deeplink['"]\s*:\s*['"`]([^'"`]+)['"`]/
    );
    if (deeplinkMatch) deeplink = deeplinkMatch[1];
  });

  return { token, session, suuid, deeplink };
}

// Phase 2: Extract bundles from results HTML
export function extractBundlesFromPhase2Html(html: string): ScrapedBundle[] {
  const bundles: ScrapedBundle[] = [];

  const $ = cheerio.load(html);

  // Find all bundle divs with data attributes
  $("div.list-item").each((i, bundleDiv) => {
    const $bundle = $(bundleDiv);

    // Find the modal directly as a child of the bundle div
    const $modal = $bundle.find(".modal").first();
    if ($modal.length === 0) return;

    // Extract outbound/inbound dates from headings
    const $headings = $modal.find("p._heading");
    const departureDate =
      $headings
        .eq(0)
        .text()
        .match(/\w{3},\s+\d{1,2}\s+\w{3}\s+\d{4}/)?.[0] || "";
    const returnDate =
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
    const departureDateStr = convertDate(departureDate);
    const returnDateStr = returnDate ? convertDate(returnDate) : "";

    // Extract flights from this modal
    const { outboundFlights, inboundFlights } = extractFlightsFromModal(
      $modal,
      $,
      departureDateStr,
      returnDateStr
    );
    // Extract booking options for this bundle
    const bookingOptions = extractBookingOptionsFromModal($modal, $);
    const bundle: ScrapedBundle = {
      departureDate: departureDateStr,
      returnDate: returnDateStr,
      outboundFlights,
      inboundFlights,
      bookingOptions,
    };
    bundles.push(bundle);
  });

  return bundles;
}

// Helper function to extract flights from a modal
function extractFlightsFromModal(
  $modal: cheerio.Cheerio<any>,
  $: cheerio.CheerioAPI,
  departureDate: string,
  returnDate: string
): { outboundFlights: ScrapedFlight[]; inboundFlights: ScrapedFlight[] } {
  // Skyscanner flight number extraction: take last token only
  const skyscannerFlightNumberExtractor = (flightText: string): string => {
    const tokens = flightText.split(/\s+/);
    if (tokens.length >= 1) {
      return tokens[tokens.length - 1];
    }
    return "";
  };

  return sharedExtractFlightsFromModal(
    $modal,
    $,
    departureDate,
    returnDate,
    skyscannerFlightNumberExtractor
  );
}

// Helper function to extract booking options from a modal
function extractBookingOptionsFromModal(
  $modal: cheerio.Cheerio<any>,
  $: cheerio.CheerioAPI
): ScrapedBookingOption[] {
  return sharedExtractBookingOptionsFromModal($modal, $, "skyscanner");
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
