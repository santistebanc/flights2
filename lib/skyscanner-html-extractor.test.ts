import {
  extractSessionDataFromPhase1Html,
  extractFlightsFromPhase2Html,
  extractBundlesFromPhase2Html,
  extractBookingOptionsFromPhase2Html,
} from "./skyscanner-html-extractor";

describe("skyscanner-html-extractor", () => {
  const phase1Html = `<html><body><!-- TODO: Add real Phase 1 sample HTML here --></body></html>`;
  const phase2Html = `<html><body><!-- TODO: Add real Phase 2 sample HTML here --></body></html>`;

  it("extracts session data from Phase 1 HTML", () => {
    const session = extractSessionDataFromPhase1Html(phase1Html);
    expect(session).toHaveProperty("token");
    expect(session).toHaveProperty("session");
    expect(session).toHaveProperty("suuid");
    expect(session).toHaveProperty("deeplink");
    // TODO: Add more specific assertions when sample HTML is available
  });

  it("extracts flights from Phase 2 HTML", () => {
    const flights = extractFlightsFromPhase2Html(phase2Html);
    expect(Array.isArray(flights)).toBe(true);
    // TODO: Add more specific assertions when sample HTML is available
  });

  it("extracts bundles from Phase 2 HTML", () => {
    const bundles = extractBundlesFromPhase2Html(phase2Html);
    expect(Array.isArray(bundles)).toBe(true);
    // TODO: Add more specific assertions when sample HTML is available
  });

  it("extracts booking options from Phase 2 HTML", () => {
    const bookingOptions = extractBookingOptionsFromPhase2Html(phase2Html);
    expect(Array.isArray(bookingOptions)).toBe(true);
    // TODO: Add more specific assertions when sample HTML is available
  });
});
