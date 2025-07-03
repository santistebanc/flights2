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

        // Look for session data in script content - handle both patterns
        // Pattern 1: 'key': 'value' (from AJAX data)
        const tokenMatch1 = scriptContent.match(
          /['"]_token['"]\s*:\s*['"`]([^'"`]+)['"`]/
        );
        if (tokenMatch1) {
          token = tokenMatch1[1];
        }

        const sessionMatch1 = scriptContent.match(
          /['"]session['"]\s*:\s*['"`]([^'"`]+)['"`]/
        );
        if (sessionMatch1) {
          session = sessionMatch1[1];
        }

        const suuidMatch1 = scriptContent.match(
          /['"]suuid['"]\s*:\s*['"`]([^'"`]+)['"`]/
        );
        if (suuidMatch1) {
          suuid = suuidMatch1[1];
        }

        const deeplinkMatch1 = scriptContent.match(
          /['"]deeplink['"]\s*:\s*['"`]([^'"`]+)['"`]/
        );
        if (deeplinkMatch1) {
          deeplink = deeplinkMatch1[1];
        }

        // Pattern 2: key: 'value' (from object properties) - fallback
        if (!token) {
          const tokenMatch2 = scriptContent.match(
            /token\s*[:=]\s*['"`]([^'"`]+)['"`]/i
          );
          if (tokenMatch2) {
            token = tokenMatch2[1];
          }
        }

        if (!session) {
          const sessionMatch2 = scriptContent.match(
            /session\s*[:=]\s*['"`]([^'"`]+)['"`]/i
          );
          if (sessionMatch2) {
            session = sessionMatch2[1];
          }
        }

        if (!suuid) {
          const suuidMatch2 = scriptContent.match(
            /suuid\s*[:=]\s*['"`]([^'"`]+)['"`]/i
          );
          if (suuidMatch2) {
            suuid = suuidMatch2[1];
          }
        }

        if (!deeplink) {
          const deeplinkMatch2 = scriptContent.match(
            /deeplink\s*[:=]\s*['"`]([^'"`]+)['"`]/i
          );
          if (deeplinkMatch2) {
            deeplink = deeplinkMatch2[1];
          }
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
