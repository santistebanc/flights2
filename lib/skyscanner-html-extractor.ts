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

        // Look for various session data in script content
        const tokenMatch = scriptContent.match(
          /token\s*[:=]\s*['"`]([^'"`]+)['"`]/i
        );
        if (tokenMatch) {
          token = tokenMatch[1];
        }

        const sessionMatch = scriptContent.match(
          /session\s*[:=]\s*['"`]([^'"`]+)['"`]/i
        );
        if (sessionMatch) {
          session = sessionMatch[1];
        }

        const suuidMatch = scriptContent.match(
          /suuid\s*[:=]\s*['"`]([^'"`]+)['"`]/i
        );
        if (suuidMatch) {
          suuid = suuidMatch[1];
        }

        const deeplinkMatch = scriptContent.match(
          /deeplink\s*[:=]\s*['"`]([^'"`]+)['"`]/i
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
