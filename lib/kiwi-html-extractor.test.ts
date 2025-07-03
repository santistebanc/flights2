import {
  extractFlightsFromHtml,
  extractBundlesFromHtml,
  extractBookingOptionsFromHtml,
} from "./kiwi-html-extractor";

describe("kiwi-html-extractor", () => {
  const sampleHtml = `<html><body><!-- TODO: Add real sample HTML here --></body></html>`;

  it("extracts flights from Kiwi HTML", () => {
    const flights = extractFlightsFromHtml(sampleHtml);
    expect(Array.isArray(flights)).toBe(true);
    // TODO: Add more specific assertions when sample HTML is available
  });

  it("extracts bundles from Kiwi HTML", () => {
    const bundles = extractBundlesFromHtml(sampleHtml);
    expect(Array.isArray(bundles)).toBe(true);
    // TODO: Add more specific assertions when sample HTML is available
  });

  it("extracts booking options from Kiwi HTML", () => {
    const bookingOptions = extractBookingOptionsFromHtml(sampleHtml);
    expect(Array.isArray(bookingOptions)).toBe(true);
    // TODO: Add more specific assertions when sample HTML is available
  });
});
