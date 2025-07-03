import {
  ScrapedFlight,
  ScrapedBundle,
  ScrapedBookingOption,
} from "../types/scraper";

// Phase 1: Extract session data (token, etc.) from initial HTML
export function extractSessionDataFromPhase1Html(html: string): {
  token: string;
} {
  let token = "";

  // Use regex to find token in script tags
  const scriptMatches = html.match(/<script[^>]*>([\s\S]*?)<\/script>/g);
  if (scriptMatches) {
    for (const scriptMatch of scriptMatches) {
      const scriptContent = scriptMatch.replace(
        /<script[^>]*>|<\/script>/g,
        ""
      );

      // Look for token in script content - matches the CFFLive AJAX data structure
      const tokenMatch = scriptContent.match(
        /['"]_token['"]\s*:\s*['"`]([^'"`]+)['"`]/
      );
      if (tokenMatch) {
        token = tokenMatch[1];
        break;
      }
    }
  }

  return { token };
}

// Phase 2: Extract entities from results HTML
export function extractFlightsFromPhase2Html(html: string): ScrapedFlight[] {
  const flights: ScrapedFlight[] = [];

  // Use regex to find flight information more reliably
  const flightMatches = html.match(/<small>([^<]+)<\/small>/g);
  if (!flightMatches) return flights;

  for (const match of flightMatches) {
    const flightText = match.replace(/<\/?small>/g, "");
    const flightMatch = flightText.match(/([A-Za-z\s]+)\s+([A-Z]{2})\s+(\d+)/);
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

  // Use regex to find bundle divs with data attributes
  const bundleMatches = html.match(
    /<div[^>]*class="[^"]*list-item[^"]*"[^>]*>/g
  );
  if (bundleMatches) {
    for (const bundleMatch of bundleMatches) {
      // Extract data attributes using regex
      const durationMatch = bundleMatch.match(/data-duration="([^"]*)"/);
      const airlineMatch = bundleMatch.match(/data-airline="([^"]*)"/);
      const priceMatch = bundleMatch.match(/data-price="([^"]*)"/);

      if (durationMatch && airlineMatch && priceMatch) {
        const bundle: ScrapedBundle = {
          uniqueId: `bundle_${airlineMatch[1]}_${durationMatch[1]}_${priceMatch[1]}`,
          outboundFlightUniqueIds: [], // Will be populated by linking to flights
          inboundFlightUniqueIds: [], // Will be populated for round trips
        };
        bundles.push(bundle);
      }
    }
  }

  return bundles;
}

export function extractBookingOptionsFromPhase2Html(
  html: string
): ScrapedBookingOption[] {
  const bookingOptions: ScrapedBookingOption[] = [];

  // Use regex to find booking option sections
  const similarMatches = html.match(
    /<div[^>]*class="_similar"[^>]*>([\s\S]*?)<\/div>/g
  );
  if (similarMatches) {
    for (const similarMatch of similarMatches) {
      let currentAgency = "";
      let currentPrice = 0;
      let currentLink = "";

      // Extract agency name
      // Extract agency name from the first <p> tag (more robust than hardcoding names)
      const agencyMatch = similarMatch.match(/<p>([^<]+)<\/p>/);
      if (agencyMatch) {
        currentAgency = agencyMatch[1].trim();
      }

      // Extract price
      const priceMatch = similarMatch.match(/€(\d+)/);
      if (priceMatch) {
        currentPrice = parseInt(priceMatch[1]);
      }

      // Extract link
      const linkMatch = similarMatch.match(/href="([^"]*kiwi\.com[^"]*)"/);
      if (linkMatch) {
        currentLink = linkMatch[1];
      }

      if (currentAgency && currentPrice && currentLink) {
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
      }
    }
  }

  return bookingOptions;
}
