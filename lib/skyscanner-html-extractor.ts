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

  // Use regex to find token, session, suuid, deeplink in script tags
  const scriptMatches = html.match(/<script[^>]*>([\s\S]*?)<\/script>/g);
  if (scriptMatches) {
    for (const scriptMatch of scriptMatches) {
      const scriptContent = scriptMatch.replace(
        /<script[^>]*>|<\/script>/g,
        ""
      );
      const tokenMatch = scriptContent.match(
        /['"]_token['"]\s*:\s*['"`]([^'"`]+)['"`]/
      );
      if (tokenMatch) token = tokenMatch[1];
      const sessionMatch = scriptContent.match(
        /['"]session['"]\s*:\s*['"`]([^'"`]+)['"`]/
      );
      if (sessionMatch) session = sessionMatch[1];
      const suuidMatch = scriptContent.match(
        /['"]suuid['"]\s*:\s*['"`]([^'"`]+)['"`]/
      );
      if (suuidMatch) suuid = suuidMatch[1];
      const deeplinkMatch = scriptContent.match(
        /['"]deeplink['"]\s*:\s*['"`]([^'"`]+)['"`]/
      );
      if (deeplinkMatch) deeplink = deeplinkMatch[1];
    }
  }
  return { token, session, suuid, deeplink };
}

// Phase 2: Extract entities from results HTML
export function extractFlightsFromPhase2Html(html: string): ScrapedFlight[] {
  const flights: ScrapedFlight[] = [];
  const flightMatches = html.match(/<small>([^<]+)<\/small>/g);
  if (!flightMatches) return flights;
  for (const match of flightMatches) {
    const flightText = match.replace(/<\/?small>/g, "");
    const flightMatch = flightText.match(/([A-Za-z\s]+)\s+([A-Z]{2})(\d+)/);
    if (!flightMatch) continue;
    const airline = flightMatch[1].trim();
    const flightNumber = `${flightMatch[2]}${flightMatch[3]}`;
    const itemStart = html.indexOf('<div class="_item">', html.indexOf(match));
    if (itemStart === -1) continue;
    let itemEnd = itemStart;
    let divCount = 0;
    let inItem = false;
    for (let i = itemStart; i < html.length; i++) {
      if (html.substring(i, i + 4) === "<div") {
        divCount++;
        if (html.substring(i, i + 20).includes('class="_item"')) inItem = true;
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
    const timeMatches = itemHtml.match(/(\d{2}:\d{2})/g);
    if (!timeMatches || timeMatches.length < 2) continue;
    const departureTime = timeMatches[0];
    const arrivalTime = timeMatches[1];
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
  const bundleMatches = html.match(
    /<div[^>]*class="[^"]*list-item[^"]*"[^>]*>/g
  );
  if (bundleMatches) {
    for (const bundleMatch of bundleMatches) {
      const durationMatch = bundleMatch.match(/data-duration="([^"]*)"/);
      const airlineMatch = bundleMatch.match(/data-airline="([^"]*)"/);
      const priceMatch = bundleMatch.match(/data-price="([^"]*)"/);
      if (durationMatch && airlineMatch && priceMatch) {
        const bundle: ScrapedBundle = {
          uniqueId: `bundle_${airlineMatch[1]}_${durationMatch[1]}_${priceMatch[1]}`,
          outboundFlightUniqueIds: [],
          inboundFlightUniqueIds: [],
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
  // Find all _similar blocks (these contain the booking options)
  const similarMatches = html.match(
    /<div[^>]*class="_similar"[^>]*>([\s\S]*?)<\/div>/g
  );
  if (similarMatches) {
    for (const similarMatch of similarMatches) {
      // Extract agency name from the first <p> tag
      const agencyMatch = similarMatch.match(/<p>([^<]+)<\/p>/);
      // Extract price and link from the second <p> tag that contains € and <a>
      const priceLinkMatch = similarMatch.match(
        /€(\d+)\s*<a[^>]*href="([^"]*skyscanner[^"]*)"/
      );

      if (agencyMatch && priceLinkMatch) {
        const agency = agencyMatch[1].trim();
        const price = parseInt(priceLinkMatch[1]);
        const link = priceLinkMatch[2];

        const bookingOption: ScrapedBookingOption = {
          uniqueId: `booking_${agency}_${price}`,
          targetUniqueId: `bundle_placeholder`,
          agency,
          price,
          linkToBook: link,
          currency: "EUR",
          extractedAt: Date.now(),
        };
        bookingOptions.push(bookingOption);
      }
    }
  }
  return bookingOptions;
}
