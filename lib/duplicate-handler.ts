import {
  ScrapedFlight,
  ScrapedBundle,
  ScrapedBookingOption,
} from "../types/scraper";

/**
 * Duplicate handling logic for scraped data.
 *
 * Strategy:
 * - Flights: Keep existing, skip duplicates (based on uniqueId)
 * - Bundles: Keep existing, skip duplicates (based on uniqueId)
 * - Booking Options: Replace existing with new data (based on uniqueId)
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
    if (existingFlightIds.has(flight.uniqueId)) {
      result.skippedFlights++;
    } else {
      result.flightsToInsert.push(flight);
    }
  }

  // Handle bundles: keep existing, skip duplicates
  for (const bundle of newBundles) {
    if (existingBundleIds.has(bundle.uniqueId)) {
      result.skippedBundles++;
    } else {
      result.bundlesToInsert.push(bundle);
    }
  }

  // Handle booking options: replace existing with new data
  for (const bookingOption of newBookingOptions) {
    if (existingBookingOptionIds.has(bookingOption.uniqueId)) {
      result.bookingOptionsToReplace.push(bookingOption);
      result.replacedBookingOptions++;
    } else {
      result.bookingOptionsToInsert.push(bookingOption);
    }
  }

  return result;
}

/**
 * Generate unique IDs for scraped entities to ensure proper deduplication.
 *
 * @param flight - Flight to generate unique ID for
 * @returns Unique ID string
 */
export function generateFlightUniqueId(flight: ScrapedFlight): string {
  return `flight_${flight.flightNumber}_${flight.departureAirportId}_${flight.arrivalAirportId}_${flight.departureDateTime}`;
}

/**
 * Generate unique ID for a bundle based on its flight composition.
 *
 * @param bundle - Bundle to generate unique ID for
 * @returns Unique ID string
 */
export function generateBundleUniqueId(bundle: ScrapedBundle): string {
  const outboundIds = bundle.outboundFlightUniqueIds.sort().join("_");
  const inboundIds = bundle.inboundFlightUniqueIds.sort().join("_");
  return `bundle_${outboundIds}_${inboundIds}`;
}

/**
 * Generate unique ID for a booking option.
 *
 * @param bookingOption - Booking option to generate unique ID for
 * @returns Unique ID string
 */
export function generateBookingOptionUniqueId(
  bookingOption: ScrapedBookingOption
): string {
  return `booking_${bookingOption.agency}_${bookingOption.targetUniqueId}_${bookingOption.price}_${bookingOption.currency}`;
}

/**
 * Validate that all entities have proper unique IDs.
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

  for (const flight of flights) {
    if (!flight.uniqueId) {
      errors.push(`Flight missing uniqueId: ${flight.flightNumber}`);
    } else if (flightIds.has(flight.uniqueId)) {
      errors.push(`Duplicate flight uniqueId: ${flight.uniqueId}`);
    } else {
      flightIds.add(flight.uniqueId);
    }
  }

  for (const bundle of bundles) {
    if (!bundle.uniqueId) {
      errors.push(`Bundle missing uniqueId`);
    } else if (bundleIds.has(bundle.uniqueId)) {
      errors.push(`Duplicate bundle uniqueId: ${bundle.uniqueId}`);
    } else {
      bundleIds.add(bundle.uniqueId);
    }
  }

  for (const bookingOption of bookingOptions) {
    if (!bookingOption.uniqueId) {
      errors.push(`Booking option missing uniqueId: ${bookingOption.agency}`);
    } else if (bookingOptionIds.has(bookingOption.uniqueId)) {
      errors.push(
        `Duplicate booking option uniqueId: ${bookingOption.uniqueId}`
      );
    } else {
      bookingOptionIds.add(bookingOption.uniqueId);
    }
  }

  return errors;
}
