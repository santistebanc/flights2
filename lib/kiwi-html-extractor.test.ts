import {
  extractSessionDataFromPhase1Html,
  extractFlightsFromPhase2Html,
  extractBundlesFromPhase2Html,
  extractBookingOptionsFromPhase2Html,
} from "./kiwi-html-extractor";

describe("kiwi-html-extractor", () => {
  const phase1Html = `
    <html>
      <head>
        <title>Kiwi.com - Search Flights</title>
      </head>
      <body>
        <div id="app">
          <script>
            window.__INITIAL_STATE__ = {
              _token: "abc123def456ghi789",
              user: { id: 123 },
              search: { origin: "NYC", destination: "LAX" }
            };
          </script>
          <script>
            // Other scripts...
            var config = { apiKey: "xyz789" };
          </script>
        </div>
      </body>
    </html>
  `;

  const phase2Html = `<html><body><!-- TODO: Add real Phase 2 sample HTML here --></body></html>`;

  it("extracts session data from Phase 1 HTML", () => {
    const session = extractSessionDataFromPhase1Html(phase1Html);
    expect(session).toHaveProperty("token");
    expect(session.token).toBe("abc123def456ghi789");
  });

  it("handles HTML without token gracefully", () => {
    const htmlWithoutToken = `<html><body><script>var x = 1;</script></body></html>`;
    const session = extractSessionDataFromPhase1Html(htmlWithoutToken);
    expect(session.token).toBe("");
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
