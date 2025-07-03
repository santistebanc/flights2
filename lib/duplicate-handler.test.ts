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
    uniqueId: "flight_EI337_BER_DUB_1733097600000",
    flightNumber: "EI337",
    departureAirportId: "BER",
    arrivalAirportId: "DUB",
    departureDateTime: 1733097600000, // Fixed timestamp for consistent testing
    arrivalDateTime: 1733097600000 + 2 * 60 * 60 * 1000, // 2 hours later
  };

  const mockFlight2: ScrapedFlight = {
    uniqueId: "flight_FR123_BER_CDG_1733097600000",
    flightNumber: "FR123",
    departureAirportId: "BER",
    arrivalAirportId: "CDG",
    departureDateTime: 1733097600000, // Fixed timestamp for consistent testing
    arrivalDateTime: 1733097600000 + 1.5 * 60 * 60 * 1000, // 1.5 hours later
  };

  const mockBundle1: ScrapedBundle = {
    uniqueId:
      "bundle_flight_EI337_BER_DUB_1733097600000_flight_FR123_BER_CDG_1733097600000",
    outboundFlightUniqueIds: ["flight_EI337_BER_DUB_1733097600000"],
    inboundFlightUniqueIds: ["flight_FR123_BER_CDG_1733097600000"],
  };

  const mockBundle2: ScrapedBundle = {
    uniqueId: "bundle_flight_BA456_LHR_JFK_1733097600000",
    outboundFlightUniqueIds: ["flight_BA456_LHR_JFK_1733097600000"],
    inboundFlightUniqueIds: [],
  };

  const mockBookingOption1: ScrapedBookingOption = {
    uniqueId:
      "booking_kiwi_bundle_flight_EI337_BER_DUB_1733097600000_flight_FR123_BER_CDG_1733097600000_150_EUR",
    targetUniqueId:
      "bundle_flight_EI337_BER_DUB_1733097600000_flight_FR123_BER_CDG_1733097600000",
    agency: "kiwi",
    price: 150,
    linkToBook: "https://kiwi.com/book",
    currency: "EUR",
    extractedAt: Date.now(),
  };

  const mockBookingOption2: ScrapedBookingOption = {
    uniqueId:
      "booking_skyscanner_bundle_flight_EI337_BER_DUB_1733097600000_flight_FR123_BER_CDG_1733097600000_145_EUR",
    targetUniqueId:
      "bundle_flight_EI337_BER_DUB_1733097600000_flight_FR123_BER_CDG_1733097600000",
    agency: "skyscanner",
    price: 145,
    linkToBook: "https://skyscanner.com/book",
    currency: "EUR",
    extractedAt: Date.now(),
  };

  describe("handleDuplicates", () => {
    it("should handle flights correctly - keep existing, skip duplicates", () => {
      const existingFlightIds = new Set(["flight_EI337_BER_DUB_1733097600000"]);
      const existingBundleIds = new Set<string>();
      const existingBookingOptionIds = new Set<string>();

      const result = handleDuplicates(
        [mockFlight1, mockFlight2],
        [mockBundle1],
        [mockBookingOption1],
        existingFlightIds,
        existingBundleIds,
        existingBookingOptionIds
      );

      expect(result.flightsToInsert).toHaveLength(1);
      expect(result.flightsToInsert[0]).toEqual(mockFlight2);
      expect(result.skippedFlights).toBe(1);
      expect(result.bundlesToInsert).toHaveLength(1);
      expect(result.bookingOptionsToInsert).toHaveLength(1);
    });

    it("should handle bundles correctly - keep existing, skip duplicates", () => {
      const existingFlightIds = new Set<string>();
      const existingBundleIds = new Set([
        "bundle_flight_EI337_BER_DUB_1733097600000_flight_FR123_BER_CDG_1733097600000",
      ]);
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
      expect(result.flightsToInsert).toHaveLength(1);
      expect(result.bookingOptionsToInsert).toHaveLength(1);
    });

    it("should handle booking options correctly - replace existing with new data", () => {
      const existingFlightIds = new Set<string>();
      const existingBundleIds = new Set<string>();
      const existingBookingOptionIds = new Set([
        "booking_kiwi_bundle_flight_EI337_BER_DUB_1733097600000_flight_FR123_BER_CDG_1733097600000_150_EUR",
      ]);

      const result = handleDuplicates(
        [mockFlight1],
        [mockBundle1],
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
        [mockFlight1, mockFlight2],
        [mockBundle1, mockBundle2],
        [mockBookingOption1, mockBookingOption2],
        existingFlightIds,
        existingBundleIds,
        existingBookingOptionIds
      );

      expect(result.flightsToInsert).toHaveLength(2);
      expect(result.bundlesToInsert).toHaveLength(2);
      expect(result.bookingOptionsToInsert).toHaveLength(2);
      expect(result.bookingOptionsToReplace).toHaveLength(0);
      expect(result.skippedFlights).toBe(0);
      expect(result.skippedBundles).toBe(0);
      expect(result.replacedBookingOptions).toBe(0);
    });

    it("should handle all existing data correctly", () => {
      const existingFlightIds = new Set([
        mockFlight1.uniqueId,
        mockFlight2.uniqueId,
      ]);
      const existingBundleIds = new Set([
        mockBundle1.uniqueId,
        mockBundle2.uniqueId,
      ]);
      const existingBookingOptionIds = new Set([
        mockBookingOption1.uniqueId,
        mockBookingOption2.uniqueId,
      ]);

      const result = handleDuplicates(
        [mockFlight1, mockFlight2],
        [mockBundle1, mockBundle2],
        [mockBookingOption1, mockBookingOption2],
        existingFlightIds,
        existingBundleIds,
        existingBookingOptionIds
      );

      expect(result.flightsToInsert).toHaveLength(0);
      expect(result.bundlesToInsert).toHaveLength(0);
      expect(result.bookingOptionsToInsert).toHaveLength(0);
      expect(result.bookingOptionsToReplace).toHaveLength(2);
      expect(result.skippedFlights).toBe(2);
      expect(result.skippedBundles).toBe(2);
      expect(result.replacedBookingOptions).toBe(2);
    });
  });

  describe("generateFlightUniqueId", () => {
    it("should generate correct unique ID for flight", () => {
      const uniqueId = generateFlightUniqueId(mockFlight1);
      expect(uniqueId).toBe("flight_EI337_BER_DUB_1733097600000");
    });

    it("should generate consistent unique IDs for same flight", () => {
      const flight1 = { ...mockFlight1, uniqueId: "" };
      const flight2 = { ...mockFlight1, uniqueId: "" };

      expect(generateFlightUniqueId(flight1)).toBe(
        generateFlightUniqueId(flight2)
      );
    });
  });

  describe("generateBundleUniqueId", () => {
    it("should generate correct unique ID for bundle", () => {
      const uniqueId = generateBundleUniqueId(mockBundle1);
      expect(uniqueId).toBe(
        "bundle_flight_EI337_BER_DUB_1733097600000_flight_FR123_BER_CDG_1733097600000"
      );
    });

    it("should generate consistent unique IDs regardless of flight order", () => {
      const bundle1 = {
        ...mockBundle1,
        outboundFlightUniqueIds: [
          "flight_EI337_BER_DUB_1733097600000",
          "flight_FR123_BER_CDG_1733097600000",
        ],
        inboundFlightUniqueIds: ["flight_BA456_LHR_JFK_1733097600000"],
      };

      const bundle2 = {
        ...mockBundle1,
        outboundFlightUniqueIds: [
          "flight_FR123_BER_CDG_1733097600000",
          "flight_EI337_BER_DUB_1733097600000",
        ],
        inboundFlightUniqueIds: ["flight_BA456_LHR_JFK_1733097600000"],
      };

      expect(generateBundleUniqueId(bundle1)).toBe(
        generateBundleUniqueId(bundle2)
      );
    });
  });

  describe("generateBookingOptionUniqueId", () => {
    it("should generate correct unique ID for booking option", () => {
      const uniqueId = generateBookingOptionUniqueId(mockBookingOption1);
      expect(uniqueId).toBe(
        "booking_kiwi_bundle_flight_EI337_BER_DUB_1733097600000_flight_FR123_BER_CDG_1733097600000_150_EUR"
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

    it("should detect missing unique IDs", () => {
      const flightWithoutId = { ...mockFlight1, uniqueId: "" };
      const bundleWithoutId = { ...mockBundle1, uniqueId: "" };
      const bookingWithoutId = { ...mockBookingOption1, uniqueId: "" };

      const errors = validateUniqueIds(
        [flightWithoutId],
        [bundleWithoutId],
        [bookingWithoutId]
      );

      expect(errors).toHaveLength(3);
      expect(errors[0]).toContain("Flight missing uniqueId");
      expect(errors[1]).toContain("Bundle missing uniqueId");
      expect(errors[2]).toContain("Booking option missing uniqueId");
    });

    it("should detect duplicate unique IDs", () => {
      const duplicateFlight = {
        ...mockFlight2,
        uniqueId: mockFlight1.uniqueId,
      };
      const duplicateBundle = {
        ...mockBundle2,
        uniqueId: mockBundle1.uniqueId,
      };
      const duplicateBooking = {
        ...mockBookingOption2,
        uniqueId: mockBookingOption1.uniqueId,
      };

      const errors = validateUniqueIds(
        [mockFlight1, duplicateFlight],
        [mockBundle1, duplicateBundle],
        [mockBookingOption1, duplicateBooking]
      );

      expect(errors).toHaveLength(3);
      expect(errors[0]).toContain("Duplicate flight uniqueId");
      expect(errors[1]).toContain("Duplicate bundle uniqueId");
      expect(errors[2]).toContain("Duplicate booking option uniqueId");
    });
  });
});
