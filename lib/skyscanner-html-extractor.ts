import { Parser } from "htmlparser2";
import {
  ScrapedFlight,
  ScrapedBundle,
  ScrapedBookingOption,
} from "../types/scraper";

// Phase 1: Extract session data (token, session, suuid, deeplink, etc.) from initial HTML
export function extractSessionDataFromPhase1Html(html: string): {
  token: string;
  session: string;
  suuid: string;
  deeplink: string;
} {
  let token = "";
  let session = "";
  let suuid = "";
  let deeplink = "";
  let inScriptTag = false;
  let scriptContent = "";

  const parser = new Parser({
    onopentag(name, attributes) {
      if (name === "script") {
        inScriptTag = true;
        scriptContent = "";
      }
    },
    ontext(text) {
      if (inScriptTag) {
        scriptContent += text;
      }
    },
    onclosetag(tagname) {
      if (tagname === "script" && inScriptTag) {
        inScriptTag = false;

        // Look for session data in script content - matches the CFFLive AJAX data structure
        const tokenMatch = scriptContent.match(
          /['"]_token['"]\s*:\s*['"`]([^'"`]+)['"`]/
        );
        if (tokenMatch) {
          token = tokenMatch[1];
        }

        const sessionMatch = scriptContent.match(
          /['"]session['"]\s*:\s*['"`]([^'"`]+)['"`]/
        );
        if (sessionMatch) {
          session = sessionMatch[1];
        }

        const suuidMatch = scriptContent.match(
          /['"]suuid['"]\s*:\s*['"`]([^'"`]+)['"`]/
        );
        if (suuidMatch) {
          suuid = suuidMatch[1];
        }

        const deeplinkMatch = scriptContent.match(
          /['"]deeplink['"]\s*:\s*['"`]([^'"`]+)['"`]/
        );
        if (deeplinkMatch) {
          deeplink = deeplinkMatch[1];
        }
      }
    },
  });

  parser.write(html);
  parser.end();

  return { token, session, suuid, deeplink };
}

// Phase 2: Extract entities from results HTML
export function extractFlightsFromPhase2Html(html: string): ScrapedFlight[] {
  const flights: ScrapedFlight[] = [];

  // Use regex to find flight information more reliably
  const flightMatches = html.match(/<small>([^<]+)<\/small>/g);
  if (!flightMatches) return flights;

  for (const match of flightMatches) {
    const flightText = match.replace(/<\/?small>/g, "");
    const flightMatch = flightText.match(/([A-Za-z\s]+)\s+([A-Z]{2})(\d+)/);
    if (!flightMatch) continue;

    const airline = flightMatch[1].trim();
    const flightNumber = `${flightMatch[2]}${flightMatch[3]}`;

    // Find the corresponding _item div that follows this flight info
    const itemStart = html.indexOf('<div class="_item">', html.indexOf(match));
    if (itemStart === -1) continue;

    // Find the correct closing tag by counting opening and closing divs
    let itemEnd = itemStart;
    let divCount = 0;
    let inItem = false;

    for (let i = itemStart; i < html.length; i++) {
      if (html.substring(i, i + 4) === "<div") {
        divCount++;
        if (html.substring(i, i + 20).includes('class="_item"')) {
          inItem = true;
        }
      } else if (html.substring(i, i + 6) === "</div>") {
        divCount--;
        if (inItem && divCount === 0) {
          itemEnd = i + 6;
          break;
        }
      }
    }

    if (itemEnd === itemStart) continue;

    const itemHtml = html.substring(itemStart, itemEnd);

    // Extract times from c3 div
    const timeMatches = itemHtml.match(/(\d{2}:\d{2})/g);
    if (!timeMatches || timeMatches.length < 2) continue;

    const departureTime = timeMatches[0];
    const arrivalTime = timeMatches[1];

    // Extract airports from c4 div
    const airportMatches = itemHtml.match(/([A-Z]{3})\s+([A-Za-z\s]+)/g);
    if (!airportMatches || airportMatches.length < 2) continue;

    const depMatch = airportMatches[0].match(/([A-Z]{3})/);
    const arrMatch = airportMatches[1].match(/([A-Z]{3})/);
    if (!depMatch || !arrMatch) continue;

    const departureAirport = depMatch[1];
    const arrivalAirport = arrMatch[1];

    const flight: ScrapedFlight = {
      uniqueId: `flight_${flightNumber}_${departureAirport}_${arrivalAirport}`,
      flightNumber: flightNumber,
      departureAirportId: departureAirport,
      arrivalAirportId: arrivalAirport,
      departureDateTime: Date.now(),
      arrivalDateTime: Date.now(),
    };

    flights.push(flight);
  }

  return flights;
}

export function extractBundlesFromPhase2Html(html: string): ScrapedBundle[] {
  const bundles: ScrapedBundle[] = [];
  let currentBundleData: any = null;

  const parser = new Parser({
    onopentag(name, attributes) {
      if (name === "div" && attributes.class?.includes("list-item")) {
        // Start of a new bundle
        currentBundleData = {
          duration: attributes["data-duration"],
          outboundmins: attributes["data-outboundmins"],
          returnmins: attributes["data-returnmins"],
          journey: attributes["data-journey"],
          airline: attributes["data-airline"],
          price: attributes["data-price"],
          totalstops: attributes["data-totalstops"],
        };
      }
    },
    onclosetag(tagname) {
      if (tagname === "div" && currentBundleData) {
        // End of bundle, create bundle record
        const bundle: ScrapedBundle = {
          uniqueId: `bundle_${currentBundleData.airline}_${currentBundleData.duration}_${currentBundleData.price}`,
          outboundFlightUniqueIds: [], // Will be populated by linking to flights
          inboundFlightUniqueIds: [], // Will be populated for round trips
        };
        bundles.push(bundle);
        currentBundleData = null;
      }
    },
  });

  parser.write(html);
  parser.end();

  return bundles;
}

export function extractBookingOptionsFromPhase2Html(
  html: string
): ScrapedBookingOption[] {
  const bookingOptions: ScrapedBookingOption[] = [];
  let currentAgency = "";
  let currentPrice = 0;
  let currentLink = "";
  let inSimilar = false;

  const parser = new Parser({
    onopentag(name, attributes) {
      if (name === "div" && attributes.class === "_similar") {
        inSimilar = true;
      }

      if (
        name === "a" &&
        attributes.href &&
        attributes.href.includes("skyscanner")
      ) {
        currentLink = attributes.href;
      }
    },
    ontext(text) {
      if (inSimilar) {
        const trimmedText = text.trim();

        // Extract agency name (e.g., "WAYA", "Kiwi.com", "Mytrip")
        if (
          trimmedText.includes("WAYA") ||
          trimmedText.includes("Kiwi.com") ||
          trimmedText.includes("Mytrip") ||
          trimmedText.includes("Flightnetwork") ||
          trimmedText.includes("Gotogate")
        ) {
          currentAgency = trimmedText;
        }

        // Extract price (e.g., "€107")
        const priceMatch = trimmedText.match(/€(\d+)/);
        if (priceMatch) {
          currentPrice = parseInt(priceMatch[1]);
        }
      }
    },
    onclosetag(tagname) {
      if (tagname === "div" && inSimilar && currentAgency && currentLink) {
        // Create booking option when we have all the data
        const bookingOption: ScrapedBookingOption = {
          uniqueId: `booking_${currentAgency}_${currentPrice}`,
          targetUniqueId: `bundle_placeholder`, // Will be linked to actual bundle
          agency: currentAgency,
          price: currentPrice,
          linkToBook: currentLink,
          currency: "EUR",
          extractedAt: Date.now(),
        };
        bookingOptions.push(bookingOption);

        // Reset for next booking option
        currentAgency = "";
        currentLink = "";
      }

      if (tagname === "div" && inSimilar) {
        inSimilar = false;
      }
    },
  });

  parser.write(html);
  parser.end();

  return bookingOptions;
}
