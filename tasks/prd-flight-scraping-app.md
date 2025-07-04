# Product Requirements Document: Flight Scraping Application

## Introduction/Overview

This document outlines the requirements for extending the existing React/Tailwind/shadcn frontend application into a full-stack flight scraping application. The system will scrape flight data from multiple sources (Skyscanner and Kiwi initially) based on user-defined search criteria, store the results in a database, and display matching flight bundles to users. The application will support both one-way and round-trip searches with real-time scraping progress tracking.

**Important Note:** This implementation builds upon an existing Convex schema and UI components. The development should extend and modify the current codebase rather than starting from scratch.

**Problem Statement:** Users need a centralized platform to search and compare flight prices across multiple travel websites without manually visiting each site.

**Goal:** Create a seamless flight search experience that aggregates data from multiple sources, provides real-time scraping progress, and displays results in an organized, price-sorted format.

## Goals

1. **Multi-Source Flight Aggregation:** Successfully scrape and aggregate flight data from Skyscanner and Kiwi in parallel
2. **Real-Time User Experience:** Provide immediate feedback on scraping progress without blocking the user interface
3. **Flexible Search Capabilities:** Support both one-way and round-trip searches with comprehensive filtering options
4. **Efficient Data Management:** Store and retrieve flight data efficiently with automatic cleanup of expired entries
5. **Responsive Performance:** Deliver search results within 30 seconds when possible
6. **Graceful Error Handling:** Continue operation even when individual scraping sources fail

## User Stories

1. **As a traveler**, I want to search for flights by entering departure and arrival airports so that I can find available routes
2. **As a traveler**, I want to specify whether I need a one-way or round-trip ticket so that I get relevant results
3. **As a traveler**, I want to set departure and return dates so that I can plan my trip timeline
4. **As a traveler**, I want to see real-time progress of data scraping so that I know the system is working
5. **As a traveler**, I want to see flight bundles sorted by price so that I can easily find the best deals
6. **As a traveler**, I want to see booking options with agency information and direct booking links so that I can make a purchase
7. **As a traveler**, I want my search preferences saved locally so that I don't have to re-enter them each time
8. **As a traveler**, I want to be notified if no flights match my criteria so that I can adjust my search
9. **As a traveler**, I want my frequently used airports and popular airports to appear first in autocomplete suggestions so that I can quickly select them

## Functional Requirements

### Search Interface

1. The system must provide a search form with the following fields:

   - Departure airport (IATA code input with autocomplete)
   - Arrival airport (IATA code input with autocomplete)
   - Round-trip toggle (boolean flag)
   - Date range picker (existing component that handles both outbound and inbound dates)
   - Search button

2. The system must save search preferences to localStorage for future use

3. The system must validate that required fields are filled before allowing search

4. The system must provide autocomplete functionality for airport inputs with search priority:

   - IATA code exact match (highest priority)
   - Recently used airports (from localStorage history, second priority)
   - Popular airports (based on popularity score, third priority)
   - IATA code search (starts with)
   - Airport name
   - City name
   - Country name (lowest priority)

5. The system must save selected airport IATA codes to localStorage history for future autocomplete suggestions

6. The system must limit airport history to the 10 most recently used airports per input field

7. The system must order autocomplete results by popularity score (descending) within each match type category

### Scraping Engine

4. The system must scrape flight data from Skyscanner and Kiwi simultaneously in parallel

5. The system must display real-time progress indicators for each scraping source

6. The system must continue scraping from available sources even if one source fails

7. The system must log scraping failures to the database for monitoring purposes

8. The system must implement specific scraping methods for each source (to be defined later)

### Kiwi Scraping Process

The scraping for Kiwi will be performed in an actor that receives the following parameters (FlightSearchParams):

- departureAirport: string (IATA code)
- arrivalAirport: string (IATA code)
- departureDate: Date
- returnDate?: Date
- isRoundTrip: boolean

The process consists of two phases:

#### Phase 1: Initial Fetch

- Make a fetch call to: `https://www.flightsfinder.com/portal/kiwi` with the following query parameters:
  - type: 'return' or 'oneway' (based on isRoundTrip)
  - currency: 'EUR'
  - cabinclass: 'M'
  - originplace: departureAirport (IATA code)
  - destinationplace: arrivalAirport (IATA code)
  - outbounddate: departureDate formatted as `DD/MM/YYYY`
  - inbounddate: returnDate formatted as `DD/MM/YYYY` (if round trip)
  - adults: 1
  - children: 0
  - infants: 0
- Save the cookie returned in the response for use in phase 2.
- In the HTML response, locate the <script> tag at the bottom of <body> and extract the value of the `_token` property (e.g., '\_token': 'iXTVMnr7mtz704XEsNmO4rsyltbn9HLTz459z9BQ').

#### Phase 2: Polling and Results Fetch

- Make a POST request to `https://www.flightsfinder.com/portal/kiwi/search` with:
  - The cookie from phase 1
  - The extracted token as '\_token' in the POST body
  - All other parameters as in phase 1 (originplace, destinationplace, outbounddate, inbounddate, cabinclass, adults, children, infants, currency, type, bags-cabin: 0, bags-checked: 0)
  - Use the same headers as the browser (see user example)
- The response will be a string split by '|' into 7 parts:
  - The second part is the number of results
  - The seventh part is the actual results in HTML
- Scrape the seventh part HTML to extract lists of:
  - ScrapedFlight
  - ScrapedBundle
  - ScrapedBookingOption

#### Entity Shapes

- **ScrapedFlight**
  - flightNumber: string
  - departureAirportIataCode: string (IATA code)
  - arrivalAirportIataCode: string (IATA code)
  - departureTime: string (HH:MM format, extracted from HTML)
  - duration: number (duration in minutes, calculated from HTML departure/arrival times)
  - connectionDurationFromPreviousFlight?: number // duration in minutes, parsed from connection string (e.g. "9h 55") after each flight in the HTML. Only present for flights after the first in a sequence.
  # Note: The extractor outputs these fields with real data extracted from HTML. Mapping to DB IDs and datetime calculation is performed in the data processing layer.
- **ScrapedBundle**
  - outboundDate: string (YYYY-MM-DD format, extracted from HTML content like "Sat, 11 Oct 2025")
  - inboundDate: string (YYYY-MM-DD format, extracted from HTML content like "Sat, 11 Oct 2025")
  - outboundFlights: array of ScrapedFlight objects
  - inboundFlights: array of ScrapedFlight objects
  - bookingOptions: array of ScrapedBookingOption objects
- **ScrapedBookingOption**
  - agency: string
  - price: number
  - linkToBook: string
  - currency: string
  - extractedAt: Unix timestamp in ms

#### Database Insertion Order

1. Insert scrapedFlights to flights table (bulk insert)
2. Insert scrapedBundles to bundles table (map outbound/inbound flights to DB ids from flights)
3. Insert scrapedBookingOptions to bookingOptions table (map to DB id from bundles)

#### Error Handling

- Log success and handle errors at each step.
- Ensure deduplication by using flight number, airports, and dates for flights.
- Handle 419 responses by always using the latest cookie from the previous poll response.

### Skyscanner Scraping Process

The scraping for Skyscanner will be performed in an actor that receives the following parameters (FlightSearchParams):

- departureAirport: string (IATA code)
- arrivalAirport: string (IATA code)
- departureDate: Date
- returnDate?: Date
- isRoundTrip: boolean

The process consists of two phases:

#### Phase 1: Initial Fetch

- Make a fetch call to: `https://www.flightsfinder.com/portal/sky` with the following query parameters:
  - originplace: departureAirport (IATA code)
  - destinationplace: arrivalAirport (IATA code)
  - outbounddate: departureDate formatted as `YYYY-MM-DD`
  - inbounddate: returnDate formatted as `YYYY-MM-DD` (if round trip)
  - cabinclass: 'Economy'
  - adults: 1
  - children: 0
  - infants: 0
  - currency: 'EUR'
- Save the cookie returned in the response for use in phase 2.
- In the HTML response, locate the <script> tag at the bottom of <body> and extract the following values:
  - \_token
  - session
  - suuid
  - deeplink

#### Phase 2: Polling for Results

- Enter a polling loop:
  - Make a POST request to `https://www.flightsfinder.com/portal/sky/poll` with:
    - The cookie from the previous request (always use the latest cookie from the last response, whether it's the phase 1 request or another polling request)
    - The extracted values (\_token, session, suuid, deeplink) in the POST body
    - Additional required parameters:
      - `noc`: Current timestamp in milliseconds (e.g., "1751580174779")
      - `s`: Site parameter set to "www"
      - `adults`: 1
      - `children`: 0
      - `infants`: 0
      - `currency`: "EUR"
    - Use the same headers as the browser (see user example)
  - The response will be a string split by '|' into 7 parts:
    - The first part is 'Y' or 'N'. If 'N', more results are available and you must poll again. If 'Y', all results have been received and polling can stop.
    - The second part is the number of total results to be expected
    - The seventh part is the actual results in HTML
  - Scrape the seventh part HTML to extract lists of:
    - ScrapedFlight
    - ScrapedBundle
    - ScrapedBookingOption
  - After each poll, update the cookie for the next request
  - Wait 100ms between polls
- Once all results are received ('Y'), exit the polling loop and log success.

#### Kiwi Phase 2 HTML Structure

The HTML returned in Phase 2 (7th part of the response) has the following structure for extracting flights, bundles, and booking options:

**Bundle Structure:**

- Each `<div class="list-item row">` represents one different bundle
- Inside every `<div class="list-item row">` there is a `<div class="modal">` child
- Deeper nested inside that `<div class="modal">` there is a `<div class="search_modal">`
- Inside that `<div class="search_modal">` there are one or two `<div class="_panel">` elements:
  - The first `<div class="_panel">` contains data on the outbound flights of that bundle
  - The second `<div class="_panel">` contains data on the inbound flights of that bundle (won't exist if the trip is one-way)

**Date Information:**

- Inside the `<div class="search_modal">` there are one or two `<p class="_heading">` elements:
  - The first `<p class="_heading">` contains the departure date of the first outbound flight
  - The second `<p class="_heading">` contains the departure date of the first inbound flight (won't exist if the trip is one-way)

**Booking Options:**

- Inside the `<div class="search_modal">` there is a `<div class="_similar">` element
- This `<div class="_similar">` contains all the booking options available for that bundle

**Flight Information:**

- Inside each `<div class="_panel">` there are multiple `<div class="_item">` elements
- Each `<div class="_item">` represents one flight segment with departure/arrival times and airports
- Flight numbers are found in `<small>` tags within the panel structure

#### Entity Shapes

- **ScrapedFlight**
  - flightNumber: string
  - departureAirportIataCode: string (IATA code)
  - arrivalAirportIataCode: string (IATA code)
  - departureTime: string (HH:MM format, extracted from HTML)
  - duration: number (duration in minutes, calculated from HTML departure/arrival times)
  - connectionDurationFromPreviousFlight?: number // duration in minutes, parsed from connection string (e.g. "9h 55") after each flight in the HTML. Only present for flights after the first in a sequence.
  # Note: The extractor outputs these fields with real data extracted from HTML. Mapping to DB IDs and datetime calculation is performed in the data processing layer.
- **ScrapedBundle**
  - outboundDate: string (YYYY-MM-DD format, extracted from HTML content like "Sat, 11 Oct 2025")
  - inboundDate: string (YYYY-MM-DD format, extracted from HTML content like "Sat, 11 Oct 2025")
  - outboundFlights: array of ScrapedFlight objects
  - inboundFlights: array of ScrapedFlight objects
  - bookingOptions: array of ScrapedBookingOption objects
- **ScrapedBookingOption**
  - agency: string
  - price: number
  - linkToBook: string
  - currency: string
  - extractedAt: Unix timestamp in ms

#### Database Insertion Order

1. Insert scrapedFlights to flights table (bulk insert)
2. Insert scrapedBundles to bundles table (map outbound/inbound flights to DB ids from flights)
3. Insert scrapedBookingOptions to bookingOptions table (map to DB id from bundles)

#### Error Handling

- Log success and handle errors at each step.
- Ensure deduplication by using flight number, airports, and dates for flights.
- Handle 419 responses by always using the latest cookie from the previous poll response.

### Data Storage

9. The system must store flight data in three main tables:

   - **flights**: flightNumber, departureAirportId, arrivalAirportId, departureDateTime, arrivalDateTime
   - **bundles**: uniqueId, outboundFlightIds (array), inboundFlightIds (array, optional for one-way)
   - **bookingOptions**: targetId (bundle reference), agency, price, currency, linkToBook, extractedAt

10. The system must extend the airports table with a popularity score field:

    - **airports**: Add popularityScore field (integer, 0-1000) for ranking airports by popularity
    - Popularity scores should be based on airport size, passenger traffic, and route importance
    - Major hubs (JFK, LAX, LHR, CDG, etc.): 900-1000
    - Large international airports: 700-899
    - Medium regional airports: 400-699
    - Small domestic airports: 100-399
    - Very small airports: 0-99

11. The system must automatically delete bundles where flight dates are in the past

12. The system must handle duplicates based on uniqueId as follows:
    - **flights**: If duplicate uniqueId exists, keep the original flight
    - **bundles**: If duplicate uniqueId exists, keep the original bundle
    - **bookingOptions**: If duplicate uniqueId exists, replace the original with the new booking option
    - No duplicates should exist in any table

### Results Display

13. The system must display bundles sorted by lowest available price

14. The system must calculate bundle price as the minimum price across all associated booking options

15. The system must show "No flights match your search criteria" when no results are found

16. The system must display booking options with agency information and booking links for each bundle

### UI Integration and Search-to-Results Flow

17. The system must integrate the search form with results display in a unified user experience

18. The system must implement a search hook that manages the entire search lifecycle:

    - Form validation and submission
    - Triggering scraping operations for both Kiwi and Skyscanner
    - Real-time progress tracking and updates
    - Results fetching and display
    - Error handling and user feedback

19. The system must wire up the search form to trigger scraping operations when submitted

20. The system must display real-time scraping progress for both sources simultaneously

21. The system must handle all search states:

    - Initial state (no search performed)
    - Loading state (search in progress)
    - Results state (search completed with results)
    - Error state (search failed)
    - Empty results state (search completed with no results)

22. The system must implement proper state management to prevent multiple simultaneous searches

23. The system must provide clear user feedback for each state with appropriate loading indicators and error messages

24. The system must ensure the search form and results list work together seamlessly without layout shifts

25. The system must implement proper cleanup of previous search results when a new search is initiated

### Error Handling

26. The system must handle website structure changes gracefully by logging errors and continuing operation

27. The system must show partial results if some scraping sources are unavailable

28. The system must provide clear error messages for invalid search parameters

### Data Transformation Layer (HTML Extraction)

- For this project, the data transformation layer consists of robust, source-specific HTML parsing and extraction logic. Each scraper (Kiwi, Skyscanner, etc.) must implement its own logic to convert raw HTML (from the 7th part of the response) into standardized ScrapedFlight, ScrapedBundle, and ScrapedBookingOption entities.
- **Each scraper has two phases, and the HTML returned in each phase is different. Phase 1 requires extraction of session/token data; Phase 2 requires extraction of flight/bundle/booking option entities. Separate extraction logic and tests are needed for each phase.**
- This logic must be modular and testable, as HTML extraction is a common source of bugs. Unit tests should be written for the extraction functions using sample HTML snippets from each source and phase.
- **The extractors now work with real data instead of mock data:**
  - Extract actual flight dates from HTML content (e.g., "Sat, 11 Oct 2025") and convert to YYYY-MM-DD format
  - Calculate actual flight durations from departure and arrival times in the HTML
  - Parse date patterns in summary sections and other parts of the HTML
  - Fall back to search parameters only if no date is found in the HTML
  - Handle multi-leg flights where different legs may have different dates
  - The extractors receive search parameters as fallback but prioritize actual HTML content

## Non-Goals (Out of Scope)

1. **User Authentication:** No user accounts or login system required
2. **Multi-City Searches:** Only one-way and round-trip searches supported
3. **Historical Price Tracking:** No price trend analysis or historical data
4. **Real-Time Notifications:** No price change alerts or push notifications
5. **Advanced Filtering:** No cabin class, airline, or price range filters initially
6. **Bundle Comparison:** No side-by-side comparison feature
7. **Admin Dashboard:** No administrative interface for monitoring or management
8. **Rate Limiting:** No sophisticated rate limiting or anti-blocking measures
9. **Data Refresh:** No automatic background data updates
10. **Favorites System:** No saved flights feature (to be implemented later)

## Design Considerations

### UI/UX Requirements

- Use existing shadcn components where possible, with modifications as needed
- Provide clear visual feedback for scraping progress
- Use intuitive icons and colors for different states (loading, success, error)
- Ensure accessibility compliance with proper ARIA labels and keyboard navigation
- Maintain consistent component sizing to prevent layout shifts (e.g., fixed width date picker that accommodates both single and round-trip date ranges)

### Component Modifications

- Extend existing form components to support IATA code inputs with autocomplete
- Add progress indicators for multi-source scraping
- Create bundle display cards with pricing and booking information
- Use existing date range picker component with integrated round-trip toggle for better UX
- Modify existing UI components to integrate with new flight search functionality
- Ensure new components follow existing design patterns and styling
- Implement airport search functionality with priority-based autocomplete

## Technical Considerations

### Convex Platform Requirements

- **Backend Framework:** The application will be built on Convex platform
- **Database:** Extend existing Convex schema with additional tables and fields as needed
- **Real-time Updates:** Leverage Convex's real-time capabilities for scraping progress updates
- **Actions vs Functions:** Use Convex actions for scraping operations (external API calls) and functions for data queries
- **Error Handling:** Implement proper error handling for Convex actions and functions
- **Rate Limiting:** Follow Convex's rate limiting guidelines for external API calls
- **Development Environment:** Use Convex dev environment for all development and testing
- **Existing Codebase:** Build upon existing schema and UI components, extending rather than replacing

### Database Schema

- Extend existing Convex schema with the required tables for flight data
- Use airport IDs (references to airports table) for flight departure and arrival locations
- Store datetime values as Unix milliseconds for consistency
- Implement proper foreign key relationships between tables using Convex references
- Add indexes for efficient querying by date ranges and airports
- Add popularityScore field to airports table with index for autocomplete ordering
- Follow Convex naming conventions and schema design patterns
- Ensure compatibility with existing schema structure

### Scraping Architecture

- Implement modular scraping system for easy addition of new sources
- Use Convex actions for all scraping operations to handle external API calls
- Implement retry logic for failed scraping attempts within Convex actions
- Store scraping logs in Convex database for debugging and monitoring
- Use Convex's real-time subscriptions to update UI with scraping progress

### Performance Optimization

- Implement efficient Convex queries for bundle price calculation
- Use Convex pagination for large result sets
- Optimize scraping parallelization using Convex actions
- Implement proper cleanup of expired data using Convex scheduled functions
- Optimize airport autocomplete queries using popularity score indexing
- Follow Convex best practices for query optimization and indexing

### Engineering/Testability Note

- Each step of the scraping process (fetching, parsing, token/cookie extraction, entity extraction, DB insertion, etc.) should be implemented in a way that is easily testable. This is critical for robust development and debugging, as scrapers are often a source of subtle bugs.

## Success Metrics

1. **Search Response Time:** 90% of searches complete within 30 seconds
2. **Scraping Success Rate:** 95% success rate for available sources
3. **Data Accuracy:** 100% of displayed prices match actual booking prices
4. **User Experience:** Zero UI blocking during scraping operations
5. **Data Freshness:** All displayed flights have departure dates in the future
6. **Error Recovery:** System continues operation when individual sources fail
7. **Autocomplete Performance:** Popular airports appear in top 3 results 90% of the time

## Open Questions

1. **Scraping Implementation Details:** Specific methods for Skyscanner and Kiwi scraping need to be defined
2. **Convex Schema Design:** How should the database schema be structured for optimal Convex performance?
3. **Convex Actions Strategy:** What's the best approach for handling long-running scraping operations in Convex actions?
4. **Real-time Updates:** How should scraping progress be communicated to the frontend using Convex subscriptions?
5. **Data Retention Policy:** Should there be a maximum age for stored flight data?
6. **Scraping Frequency Limits:** Are there any rate limiting considerations for the target websites?
7. **Error Notification:** How should scraping failures be communicated to users?
8. **Future Source Addition:** What is the process for adding new flight data sources?
9. **Convex Deployment:** How should the application be deployed using Convex's deployment system?
10. **Airport Popularity Data:** What data sources should be used to determine initial airport popularity scores?

## Implementation Priority

### Phase 1 (Core Functionality)

- Search interface with basic filters
- Database schema implementation
- Basic scraping from one source
- Results display with price sorting

### Phase 2 (Multi-Source & Polish)

- Parallel scraping from multiple sources
- Progress indicators and error handling
- Data cleanup and validation
- UI/UX improvements

### Phase 3 (Future Enhancements)

- Favorites system
- Advanced filtering options
- Multi-city support
- Admin dashboard

---

**Document Version:** 1.0  
**Last Updated:** [Current Date]  
**Target Audience:** Junior developers implementing the flight scraping application

# In the database insertion/data processing section:

- To build `departureDateTime`, combine `departureDate` and `departureTime`, and adjust for the timezone offset of the departure airport (timezone is found in the airports table).
- To build `arrivalDateTime`, add the `duration` (in minutes) to the `departureDateTime`.
- The extractor output does NOT include `departureDateTime` or `arrivalDateTime` fields; these are computed during data processing.
