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
  let currentFlightData: any = null;
  let inModal = false;
  let inPanelBody = false;
  let inItem = false;
  let inSmall = false;
  let smallText = "";

  const parser = new Parser({
    onopentag(name, attributes) {
      if (name === "div" && attributes.id?.startsWith("myModal")) {
        inModal = true;
      }

      if (name === "div" && attributes.class === "_panel_body") {
        inPanelBody = true;
      }

      if (name === "div" && attributes.class === "_item") {
        inItem = true;
        currentFlightData = {};
      }

      if (name === "small" && inPanelBody && inItem) {
        inSmall = true;
        smallText = "";
      }
    },
    ontext(text) {
      if (inSmall) {
        smallText += text;
      }

      if (inItem && currentFlightData) {
        const trimmedText = text.trim();

        // Extract times (e.g., "06:00", "09:10")
        const timeMatch = trimmedText.match(/(\d{2}:\d{2})/g);
        if (timeMatch && timeMatch.length >= 2) {
          currentFlightData.departureTime = timeMatch[0];
          currentFlightData.arrivalTime = timeMatch[1];
        }

        // Extract airports (e.g., "BER Berlin Brandenburg", "OTP Bucharest Otopeni")
        const airportMatch = trimmedText.match(/([A-Z]{3})\s+([A-Za-z\s]+)/);
        if (airportMatch) {
          if (!currentFlightData.departureAirport) {
            currentFlightData.departureAirport = airportMatch[1];
          } else {
            currentFlightData.arrivalAirport = airportMatch[1];
          }
        }

        // Extract duration (e.g., "2h 10")
        const durationMatch = trimmedText.match(/(\d+)h\s+(\d+)/);
        if (durationMatch) {
          currentFlightData.duration = `${durationMatch[1]}:${durationMatch[2]}`;
        }
      }
    },
    onclosetag(tagname) {
      if (tagname === "small" && inSmall) {
        // Extract flight number from small tag text (e.g., "Ryanair FR314")
        const flightMatch = smallText.match(/([A-Za-z\s]+)\s+([A-Z]{2})(\d+)/);
        if (flightMatch) {
          currentFlightData.airline = flightMatch[1].trim();
          currentFlightData.flightNumber = `${flightMatch[2]}${flightMatch[3]}`;
        }
        inSmall = false;
        smallText = "";
      }

      if (tagname === "div" && inItem) {
        // When we finish a flight item, create a flight record
        if (
          currentFlightData &&
          currentFlightData.flightNumber &&
          currentFlightData.departureAirport &&
          currentFlightData.arrivalAirport
        ) {
          const flight: ScrapedFlight = {
            uniqueId: `flight_${currentFlightData.flightNumber}_${currentFlightData.departureAirport}_${currentFlightData.arrivalAirport}`,
            flightNumber: currentFlightData.flightNumber,
            departureAirportId: currentFlightData.departureAirport, // Will be converted to DB ID later
            arrivalAirportId: currentFlightData.arrivalAirport, // Will be converted to DB ID later
            departureDateTime: Date.now(), // Will be calculated from date + time
            arrivalDateTime: Date.now(), // Will be calculated from date + time
          };
          flights.push(flight);
        }
        inItem = false;
        currentFlightData = null;
      }

      if (tagname === "div" && inPanelBody) {
        inPanelBody = false;
      }

      if (tagname === "div" && inModal) {
        inModal = false;
      }
    },
  });

  parser.write(html);
  parser.end();

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
