import {
  extractSessionDataFromPhase1Html,
  extractBundlesFromPhase2Html,
} from "./kiwi-html-extractor";
import { readFileSync } from "fs";
import { join } from "path";

describe("kiwi-html-extractor", () => {
  const phase1Html = readFileSync(
    join(__dirname, "../test-data/phase1-kiwi.html"),
    "utf8"
  );

  const phase2Html = readFileSync(
    join(__dirname, "../test-data/phase2-kiwi.html"),
    "utf8"
  );

  it("extracts session data from Phase 1 HTML", () => {
    const session = extractSessionDataFromPhase1Html(phase1Html);
    expect(session).toEqual({
      cookie: "",
      token: "1XiMiR5s6GbdvkWghMEH6maCeZVGNOXdlINUjVhI",
    });
  });

  it("handles HTML without token gracefully", () => {
    const htmlWithoutToken = `<html><body><script>var x = 1;</script></body></html>`;
    const session = extractSessionDataFromPhase1Html(htmlWithoutToken);
    expect(session).toEqual({
      cookie: "",
      token: "",
    });
  });

  it("extracts bundles from Phase 2 HTML", () => {
    const bundles = extractBundlesFromPhase2Html(phase2Html);
    expect(bundles).toHaveLength(1);

    const bundle = bundles[0];
    expect(bundle.outboundFlights).toHaveLength(2);
    expect(bundle.inboundFlights).toHaveLength(1);
    expect(bundle.bookingOptions).toHaveLength(1);
    expect(bundle.departureDate).toBe("2025-10-10");
    expect(bundle.returnDate).toBe("2025-10-20");

    // Check outbound flights
    expect(bundle.outboundFlights[0]).toEqual({
      flightNumber: "EI337",
      departureAirportIataCode: "BER",
      arrivalAirportIataCode: "DUB",
      departureTime: "21:40",
      duration: 80,
      connectionDurationFromPreviousFlight: undefined,
    });

    expect(bundle.outboundFlights[1]).toEqual({
      flightNumber: "I21882",
      departureAirportIataCode: "DUB",
      arrivalAirportIataCode: "MAD",
      departureTime: "08:55",
      duration: 215,
      connectionDurationFromPreviousFlight: 595,
    });

    // Check inbound flight
    expect(bundle.inboundFlights[0]).toEqual({
      flightNumber: "I21801",
      departureAirportIataCode: "MAD",
      arrivalAirportIataCode: "BER",
      departureTime: "07:30",
      duration: 185,
      connectionDurationFromPreviousFlight: undefined,
    });

    // Check booking option
    expect(bundle.bookingOptions[0]).toEqual({
      agency: "Kiwi.com",
      price: 164,
      linkToBook: expect.stringMatching(
        /^https:\/\/www\.kiwi\.com\/deep\?affilid=cffinternationalltdapi&currency=EUR&flightsId=/
      ),
      currency: "EUR",
      extractedAt: expect.any(Number),
    });
  });
});
