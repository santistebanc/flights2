import {
  handleDuplicates,
  generateFlightUniqueId,
  generateBundleUniqueId,
  generateBookingOptionUniqueId,
  validateUniqueIds,
  DuplicateHandlingResult,
} from "./duplicate-handler";
import {
  ScrapedFlight,
  ScrapedBundle,
  ScrapedBookingOption,
} from "../types/scraper";

describe("duplicate-handler", () => {
  const mockFlight1: ScrapedFlight = {
    flightNumber: "EI337",
    departureAirportIataCode: "BER",
    arrivalAirportIataCode: "DUB",
    departureTime: "10:00",
    duration: 120, // 2 hours in minutes
  };

  const mockFlight2: ScrapedFlight = {
    flightNumber: "FR123",
    departureAirportIataCode: "BER",
    arrivalAirportIataCode: "CDG",
    departureTime: "14:30",
    duration: 90, // 1.5 hours in minutes
  };

  const mockFlight3: ScrapedFlight = {
    flightNumber: "BA456",
    departureAirportIataCode: "LHR",
    arrivalAirportIataCode: "JFK",
    departureTime: "16:00",
    duration: 480, // 8 hours in minutes
  };

  const mockBookingOption1: ScrapedBookingOption = {
    agency: "kiwi",
    price: 150,
    linkToBook: "https://kiwi.com/book",
    currency: "EUR",
    extractedAt: Date.now(),
  };

  const mockBookingOption2: ScrapedBookingOption = {
    agency: "skyscanner",
    price: 145,
    linkToBook: "https://skyscanner.com/book",
    currency: "EUR",
    extractedAt: Date.now(),
  };

  const mockBundle1: ScrapedBundle = {
    outboundDate: "2024-12-02",
    inboundDate: "2024-12-02",
    outboundFlights: [mockFlight1],
    inboundFlights: [mockFlight2],
    bookingOptions: [mockBookingOption1],
  };

  const mockBundle2: ScrapedBundle = {
    outboundDate: "2024-12-02",
    inboundDate: "",
    outboundFlights: [mockFlight3],
    inboundFlights: [],
    bookingOptions: [mockBookingOption2],
  };

  describe("handleDuplicates", () => {
    it("should handle flights correctly - keep existing, skip duplicates", () => {
      const existingFlightIds = new Set<string>();
      const existingBundleIds = new Set([generateBundleUniqueId(mockBundle1)]);
      const existingBookingOptionIds = new Set<string>();

      const result = handleDuplicates(
        [mockFlight1, mockFlight2],
        [mockBundle1, mockBundle2],
        [mockBookingOption1, mockBookingOption2],
        existingFlightIds,
        existingBundleIds,
        existingBookingOptionIds
      );

      expect(result.flightsToInsert).toHaveLength(2); // All flights are added
      expect(result.bundlesToInsert).toHaveLength(1); // Only mockBundle2
      expect(result.bundlesToInsert[0]).toEqual(mockBundle2);
      expect(result.skippedFlights).toBe(2); // Flights from mockBundle1
      expect(result.skippedBundles).toBe(1);
      expect(result.bookingOptionsToInsert).toHaveLength(2);
    });

    it("should handle bundles correctly - keep existing, skip duplicates", () => {
      const existingFlightIds = new Set<string>();
      const existingBundleIds = new Set([generateBundleUniqueId(mockBundle1)]);
      const existingBookingOptionIds = new Set<string>();

      const result = handleDuplicates(
        [mockFlight1],
        [mockBundle1, mockBundle2],
        [mockBookingOption1],
        existingFlightIds,
        existingBundleIds,
        existingBookingOptionIds
      );

      expect(result.bundlesToInsert).toHaveLength(1);
      expect(result.bundlesToInsert[0]).toEqual(mockBundle2);
      expect(result.skippedBundles).toBe(1);
      expect(result.skippedFlights).toBe(2); // Flights from mockBundle1
      expect(result.flightsToInsert).toHaveLength(1);
      expect(result.bookingOptionsToInsert).toHaveLength(1);
    });

    it("should handle booking options correctly - replace existing with new data", () => {
      const existingFlightIds = new Set<string>();
      const existingBundleIds = new Set<string>();
      const bundleId = generateBundleUniqueId(mockBundle1);
      const existingBookingOptionIds = new Set([
        generateBookingOptionUniqueId(mockBookingOption1, bundleId),
      ]);

      // Create a test bundle that contains both booking options for this test
      const testBundle: ScrapedBundle = {
        outboundDate: "2024-12-02",
        inboundDate: "2024-12-02",
        outboundFlights: [mockFlight1],
        inboundFlights: [mockFlight2],
        bookingOptions: [mockBookingOption1, mockBookingOption2],
      };

      const result = handleDuplicates(
        [mockFlight1, mockFlight2],
        [testBundle],
        [mockBookingOption1, mockBookingOption2],
        existingFlightIds,
        existingBundleIds,
        existingBookingOptionIds
      );

      expect(result.bookingOptionsToInsert).toHaveLength(1);
      expect(result.bookingOptionsToInsert[0]).toEqual(mockBookingOption2);
      expect(result.bookingOptionsToReplace).toHaveLength(1);
      expect(result.bookingOptionsToReplace[0]).toEqual(mockBookingOption1);
      expect(result.replacedBookingOptions).toBe(1);
    });

    it("should handle all new data correctly", () => {
      const existingFlightIds = new Set<string>();
      const existingBundleIds = new Set<string>();
      const existingBookingOptionIds = new Set<string>();

      const result = handleDuplicates(
        [mockFlight1, mockFlight2, mockFlight3],
        [mockBundle1, mockBundle2],
        [mockBookingOption1, mockBookingOption2],
        existingFlightIds,
        existingBundleIds,
        existingBookingOptionIds
      );

      expect(result.flightsToInsert).toHaveLength(3);
      expect(result.bundlesToInsert).toHaveLength(2);
      expect(result.bookingOptionsToInsert).toHaveLength(2);
      expect(result.bookingOptionsToReplace).toHaveLength(0);
      expect(result.skippedFlights).toBe(0);
      expect(result.skippedBundles).toBe(0);
      expect(result.replacedBookingOptions).toBe(0);
    });

    it("should handle all existing data correctly", () => {
      const existingFlightIds = new Set<string>(); // Not used in new logic
      const existingBundleIds = new Set([
        generateBundleUniqueId(mockBundle1),
        generateBundleUniqueId(mockBundle2),
      ]);
      const existingBookingOptionIds = new Set([
        generateBookingOptionUniqueId(
          mockBookingOption1,
          generateBundleUniqueId(mockBundle1)
        ),
        generateBookingOptionUniqueId(
          mockBookingOption2,
          generateBundleUniqueId(mockBundle2)
        ),
      ]);

      const result = handleDuplicates(
        [mockFlight1, mockFlight2, mockFlight3],
        [mockBundle1, mockBundle2],
        [mockBookingOption1, mockBookingOption2],
        existingFlightIds,
        existingBundleIds,
        existingBookingOptionIds
      );

      expect(result.flightsToInsert).toHaveLength(3); // Flights are always added to flightsToInsert
      expect(result.bundlesToInsert).toHaveLength(0);
      expect(result.bookingOptionsToInsert).toHaveLength(0);
      expect(result.bookingOptionsToReplace).toHaveLength(2);
      expect(result.skippedFlights).toBe(3); // All flights from both bundles
      expect(result.skippedBundles).toBe(2);
      expect(result.replacedBookingOptions).toBe(2);
    });
  });

  describe("generateFlightUniqueId", () => {
    it("should generate correct unique ID for flight", () => {
      const uniqueId = generateFlightUniqueId(mockFlight1, "2024-12-02");
      expect(uniqueId).toBe("flight_EI337_BER_DUB_20241202_1000");
    });

    it("should generate consistent unique IDs for same flight", () => {
      const flight1 = { ...mockFlight1 };
      const flight2 = { ...mockFlight1 };

      expect(generateFlightUniqueId(flight1, "2024-12-02")).toBe(
        generateFlightUniqueId(flight2, "2024-12-02")
      );
    });
  });

  describe("generateBundleUniqueId", () => {
    it("should generate correct unique ID for bundle", () => {
      const uniqueId = generateBundleUniqueId(mockBundle1);
      expect(uniqueId).toBe(
        "bundle_flight_EI337_BER_DUB_20241202_1000_flight_FR123_BER_CDG_20241202_1430"
      );
    });

    it("should generate consistent unique IDs regardless of flight order", () => {
      const bundle1 = {
        ...mockBundle1,
        outboundFlights: [mockFlight1, mockFlight2],
        inboundFlights: [mockFlight2],
      };

      const bundle2 = {
        ...mockBundle1,
        outboundFlights: [mockFlight2, mockFlight1],
        inboundFlights: [mockFlight2],
      };

      expect(generateBundleUniqueId(bundle1)).toBe(
        generateBundleUniqueId(bundle2)
      );
    });
  });

  describe("generateBookingOptionUniqueId", () => {
    it("should generate correct unique ID for booking option", () => {
      const bundleId = generateBundleUniqueId(mockBundle1);
      const uniqueId = generateBookingOptionUniqueId(
        mockBookingOption1,
        bundleId
      );
      expect(uniqueId).toBe(
        "booking_kiwi_bundle_flight_EI337_BER_DUB_20241202_1000_flight_FR123_BER_CDG_20241202_1430_150_EUR"
      );
    });
  });

  describe("validateUniqueIds", () => {
    it("should return no errors for valid data", () => {
      const errors = validateUniqueIds(
        [mockFlight1, mockFlight2],
        [mockBundle1, mockBundle2],
        [mockBookingOption1, mockBookingOption2]
      );
      expect(errors).toHaveLength(0);
    });

    it("should detect missing data for unique ID generation", () => {
      const flightWithoutId = { ...mockFlight1, flightNumber: "" };
      const bundleWithoutId = {
        ...mockBundle1,
        outboundFlights: [flightWithoutId],
      };
      const bookingWithoutId = { ...mockBookingOption1, agency: "" };
      const bundleWithBadBooking = {
        ...mockBundle1,
        bookingOptions: [bookingWithoutId],
      };

      const errors = validateUniqueIds(
        [],
        [bundleWithoutId, bundleWithBadBooking],
        []
      );

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.includes("Flight missing data"))).toBe(true);
      expect(
        errors.some((e) => e.includes("Booking option missing data"))
      ).toBe(true);
    });

    it("should detect duplicate unique IDs", () => {
      const duplicateBundle = { ...mockBundle1 };

      const errors = validateUniqueIds([], [mockBundle1, duplicateBundle], []);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.includes("Duplicate bundle uniqueId"))).toBe(
        true
      );
    });
  });
});
