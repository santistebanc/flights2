import { Parser } from "htmlparser2";
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

        // Look for token in script content
        const tokenMatch = scriptContent.match(
          /_token\s*[:=]\s*['"`]([^'"`]+)['"`]/
        );
        if (tokenMatch) {
          token = tokenMatch[1];
        }
      }
    },
  });

  parser.write(html);
  parser.end();

  return { token };
}

// Phase 2: Extract entities from results HTML
export function extractFlightsFromPhase2Html(html: string): ScrapedFlight[] {
  // TODO: Use htmlparser2 to extract flight data
  // This will be implemented when we have sample HTML for Phase 2
  return [];
}

export function extractBundlesFromPhase2Html(html: string): ScrapedBundle[] {
  // TODO: Use htmlparser2 to extract bundle data
  // This will be implemented when we have sample HTML for Phase 2
  return [];
}

export function extractBookingOptionsFromPhase2Html(
  html: string
): ScrapedBookingOption[] {
  // TODO: Use htmlparser2 to extract booking option data
  // This will be implemented when we have sample HTML for Phase 2
  return [];
}
