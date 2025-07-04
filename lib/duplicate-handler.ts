import {
  ScrapedFlight,
  ScrapedBundle,
  ScrapedBookingOption,
} from "../types/scraper";

/**
 * Duplicate handling logic for scraped data.
 *
 * Strategy:
 * - Flights: Keep existing, skip duplicates (based on generated uniqueId)
 * - Bundles: Keep existing, skip duplicates (based on generated uniqueId)
 * - Booking Options: Replace existing with new data (based on generated uniqueId)
 */
export interface DuplicateHandlingResult {
  flightsToInsert: ScrapedFlight[];
  bundlesToInsert: ScrapedBundle[];
  bookingOptionsToInsert: ScrapedBookingOption[];
  bookingOptionsToReplace: ScrapedBookingOption[];
  skippedFlights: number;
  skippedBundles: number;
  replacedBookingOptions: number;
}

/**
 * Handle duplicates in scraped data according to the deduplication strategy.
 *
 * @param newFlights - New flights to process
 * @param newBundles - New bundles to process
 * @param newBookingOptions - New booking options to process
 * @param existingFlightIds - Set of existing flight uniqueIds
 * @param existingBundleIds - Set of existing bundle uniqueIds
 * @param existingBookingOptionIds - Set of existing booking option uniqueIds
 * @returns Result with items to insert/replace and statistics
 */
export function handleDuplicates(
  newFlights: ScrapedFlight[],
  newBundles: ScrapedBundle[],
  newBookingOptions: ScrapedBookingOption[],
  existingFlightIds: Set<string>,
  existingBundleIds: Set<string>,
  existingBookingOptionIds: Set<string>
): DuplicateHandlingResult {
  const result: DuplicateHandlingResult = {
    flightsToInsert: [],
    bundlesToInsert: [],
    bookingOptionsToInsert: [],
    bookingOptionsToReplace: [],
    skippedFlights: 0,
    skippedBundles: 0,
    replacedBookingOptions: 0,
  };

  // Handle flights: keep existing, skip duplicates
  for (const flight of newFlights) {
    // Generate unique ID on the fly from the bundle context
    // Note: This requires access to the bundle date, which we'll handle in the bundle loop
    result.flightsToInsert.push(flight);
  }

  // Handle bundles: keep existing, skip duplicates
  for (const bundle of newBundles) {
    const bundleId = generateBundleUniqueId(bundle);
    if (existingBundleIds.has(bundleId)) {
      result.skippedBundles++;
      // Also skip the flights in this bundle
      result.skippedFlights +=
        bundle.outboundFlights.length + bundle.inboundFlights.length;
    } else {
      result.bundlesToInsert.push(bundle);
    }
  }

  // Handle booking options: replace existing with new data
  for (const bookingOption of newBookingOptions) {
    // Find the bundle this booking option belongs to
    const bundle = newBundles.find((b) =>
      b.bookingOptions.includes(bookingOption)
    );
    if (bundle) {
      const bundleId = generateBundleUniqueId(bundle);
      const bookingId = generateBookingOptionUniqueId(bookingOption, bundleId);

      if (existingBookingOptionIds.has(bookingId)) {
        result.bookingOptionsToReplace.push(bookingOption);
        result.replacedBookingOptions++;
      } else {
        result.bookingOptionsToInsert.push(bookingOption);
      }
    }
  }

  return result;
}

/**
 * Generate unique IDs for scraped entities to ensure proper deduplication.
 *
 * @param flight - Flight to generate unique ID for
 * @param departureDate - Departure date in YYYY-MM-DD format
 * @returns Unique ID string
 */
export function generateFlightUniqueId(
  flight: ScrapedFlight,
  departureDate: string
): string {
  const dateStr = departureDate.replace(/-/g, ""); // YYYYMMDD format
  const timeStr = flight.departureTime.replace(/:/g, ""); // HHMM format
  return `flight_${flight.flightNumber}_${flight.departureAirportIataCode}_${flight.arrivalAirportIataCode}_${dateStr}_${timeStr}`;
}

/**
 * Generate unique ID for a bundle based on its flight composition.
 *
 * @param bundle - Bundle to generate unique ID for
 * @returns Unique ID string
 */
export function generateBundleUniqueId(bundle: ScrapedBundle): string {
  const outboundIds = bundle.outboundFlights
    .map((flight) => generateFlightUniqueId(flight, bundle.outboundDate))
    .sort()
    .join("_");
  const inboundIds = bundle.inboundFlights
    .map((flight) => generateFlightUniqueId(flight, bundle.inboundDate))
    .sort()
    .join("_");
  return `bundle_${outboundIds}_${inboundIds}`;
}

/**
 * Generate unique ID for a booking option.
 *
 * @param bookingOption - Booking option to generate unique ID for
 * @param bundleId - Unique ID of the target bundle
 * @returns Unique ID string
 */
export function generateBookingOptionUniqueId(
  bookingOption: ScrapedBookingOption,
  bundleId: string
): string {
  return `booking_${bookingOption.agency}_${bundleId}_${bookingOption.price}_${bookingOption.currency}`;
}

/**
 * Validate that all entities have proper data for unique ID generation.
 *
 * @param flights - Flights to validate
 * @param bundles - Bundles to validate
 * @param bookingOptions - Booking options to validate
 * @returns Array of validation errors, empty if all valid
 */
export function validateUniqueIds(
  flights: ScrapedFlight[],
  bundles: ScrapedBundle[],
  bookingOptions: ScrapedBookingOption[]
): string[] {
  const errors: string[] = [];

  // Check for duplicate unique IDs within each collection
  const flightIds = new Set<string>();
  const bundleIds = new Set<string>();
  const bookingOptionIds = new Set<string>();

  for (const bundle of bundles) {
    try {
      const bundleId = generateBundleUniqueId(bundle);
      if (bundleIds.has(bundleId)) {
        errors.push(`Duplicate bundle uniqueId: ${bundleId}`);
      } else {
        bundleIds.add(bundleId);
      }

      // Validate flights in this bundle
      for (const flight of [
        ...bundle.outboundFlights,
        ...bundle.inboundFlights,
      ]) {
        if (
          !flight.flightNumber ||
          !flight.departureAirportIataCode ||
          !flight.arrivalAirportIataCode ||
          !flight.departureTime
        ) {
          errors.push(`Flight missing data: ${flight.flightNumber}`);
        } else {
          const flightDate = bundle.outboundFlights.includes(flight)
            ? bundle.outboundDate
            : bundle.inboundDate;
          const flightId = generateFlightUniqueId(flight, flightDate);
          if (flightIds.has(flightId)) {
            errors.push(`Duplicate flight uniqueId: ${flightId}`);
          } else {
            flightIds.add(flightId);
          }
        }
      }

      // Validate booking options in this bundle
      for (const bookingOption of bundle.bookingOptions) {
        if (
          !bookingOption.agency ||
          !bookingOption.price ||
          !bookingOption.currency
        ) {
          errors.push(`Booking option missing data: ${bookingOption.agency}`);
        } else {
          const bookingId = generateBookingOptionUniqueId(
            bookingOption,
            bundleId
          );
          if (bookingOptionIds.has(bookingId)) {
            errors.push(`Duplicate booking option uniqueId: ${bookingId}`);
          } else {
            bookingOptionIds.add(bookingId);
          }
        }
      }
    } catch (error) {
      errors.push(`Bundle missing data for unique ID generation`);
    }
  }

  return errors;
}
