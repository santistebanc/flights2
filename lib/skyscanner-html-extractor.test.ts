import {
  extractSessionDataFromPhase1Html,
  extractFlightsFromPhase2Html,
  extractBundlesFromPhase2Html,
  extractBookingOptionsFromPhase2Html,
} from "./skyscanner-html-extractor";

describe("skyscanner-html-extractor", () => {
  const phase1Html = `
    <html>
      <head>
        <title>Skyscanner - Search Flights</title>
      </head>
      <body>
        <div id="app">
          <script>
            window.__INITIAL_STATE__ = {
              token: "sk_abc123def456",
              session: "sess_789ghi012jkl",
              suuid: "uuid_345mno678pqr",
              deeplink: "https://www.skyscanner.com/flights/nyc/lax/2024-01-15",
              user: { id: 456 },
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
    expect(session).toHaveProperty("session");
    expect(session).toHaveProperty("suuid");
    expect(session).toHaveProperty("deeplink");
    expect(session.token).toBe("sk_abc123def456");
    expect(session.session).toBe("sess_789ghi012jkl");
    expect(session.suuid).toBe("uuid_345mno678pqr");
    expect(session.deeplink).toBe(
      "https://www.skyscanner.com/flights/nyc/lax/2024-01-15"
    );
  });

  it("handles HTML without session data gracefully", () => {
    const htmlWithoutSession = `<html><body><script>var x = 1;</script></body></html>`;
    const session = extractSessionDataFromPhase1Html(htmlWithoutSession);
    expect(session.token).toBe("");
    expect(session.session).toBe("");
    expect(session.suuid).toBe("");
    expect(session.deeplink).toBe("");
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
