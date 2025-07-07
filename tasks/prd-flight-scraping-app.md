# Product Requirements Document: Flight Scraping Application

## Introduction/Overview

This document outlines the requirements for extending the existing React/Tailwind/shadcn frontend application into a full-stack flight scraping application. The system scrapes flight data from multiple sources (Skyscanner and Kiwi) based on user-defined search criteria, stores the results in a database, and displays matching flight bundles to users. The application supports both one-way and round-trip searches with real-time scraping progress tracking.

**Important Note:** This implementation builds upon an existing Convex schema and UI components. The development extends and modifies the current codebase rather than starting from scratch.

**Problem Statement:** Users need a centralized platform to search and compare flight prices across multiple travel websites without manually visiting each site.

**Goal:** Create a seamless flight search experience that aggregates data from multiple sources, provides real-time scraping progress, and displays results in an organized, price-sorted format.

## Goals

1. **Multi-Source Flight Aggregation:** Successfully scrape and aggregate flight data from Skyscanner and Kiwi in parallel
2. **Real-Time User Experience:** Provide immediate feedback on scraping progress without blocking the user interface
3. **Flexible Search Capabilities:** Support both one-way and round-trip searches with comprehensive filtering options
4. **Efficient Data Management:** Store and retrieve flight data efficiently with automatic cleanup of expired entries
5. **Responsive Performance:** Deliver search results within 30 seconds when possible
6. **Graceful Error Handling:** Continue operation even when individual scraping sources fail
7. **Theme Support:** Provide both light and dark theme modes with user preference persistence

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
10. **As a traveler**, I want to switch between light and dark themes so that I can use the app comfortably in different lighting conditions

## Functional Requirements

### Search Interface

1. **✅ IMPLEMENTED** - The system provides a search form with the following fields:

   - Departure airport (IATA code input with autocomplete)
   - Arrival airport (IATA code input with autocomplete)
   - Round-trip toggle (integrated with date range picker)
   - Date range picker (existing component that handles both outbound and inbound dates)
   - Search button

2. **✅ IMPLEMENTED** - The system saves search preferences to URL parameters for sharing and browser navigation

3. **✅ IMPLEMENTED** - The system validates that required fields are filled before allowing search

4. **✅ IMPLEMENTED** - The system provides autocomplete functionality for airport inputs with search priority:

   - IATA code exact match (highest priority)
   - Recently used airports (from localStorage history, second priority)
   - Popular airports (based on popularity score, third priority)
   - IATA code search (starts with)
   - Airport name
   - City name
   - Country name (lowest priority)

5. **✅ IMPLEMENTED** - The system saves selected airport IATA codes to localStorage history for future autocomplete suggestions

6. **✅ IMPLEMENTED** - The system limits airport history to the 10 most recently used airports per input field

7. **✅ IMPLEMENTED** - The system orders autocomplete results by popularity score (descending) within each match type category

### Theme System

8. **✅ IMPLEMENTED** - The system provides both light and dark theme modes:
   - Dark theme as default with yellow accent colors
   - Light theme with consistent color scheme
   - Theme toggle button in the header
   - Theme preference stored in localStorage
   - System preference detection for initial theme selection
   - All components are theme-aware using CSS variables

### Scraping Engine

9. **✅ IMPLEMENTED** - The system scrapes flight data from Skyscanner and Kiwi simultaneously in parallel

10. **✅ IMPLEMENTED** - The system displays real-time progress indicators for each scraping source

11. **✅ IMPLEMENTED** - The system continues scraping from available sources even if one source fails

12. **✅ IMPLEMENTED** - The system logs scraping failures to the database for monitoring purposes

13. **✅ IMPLEMENTED** - The system implements specific scraping methods for each source

### Kiwi Scraping Process

**✅ IMPLEMENTED** - The scraping for Kiwi is performed in an actor that receives the following parameters (FlightSearchParams):

- departureAirport: string (IATA code)
- arrivalAirport: string (IATA code)
- departureDate: Date
- returnDate?: Date
- isRoundTrip: boolean

The process consists of two phases:

#### Phase 1: Initial Fetch

**✅ IMPLEMENTED** - Make a fetch call to: `https://www.flightsfinder.com/portal/kiwi` with the following query parameters:

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
- **✅ IMPLEMENTED** - Save the cookie returned in the response for use in phase 2.
- **✅ IMPLEMENTED** - In the HTML response, locate the <script> tag at the bottom of <body> and extract the value of the `_token` property (e.g., '\_token': 'iXTVMnr7mtz704XEsNmO4rsyltbn9HLTz459z9BQ').

#### Phase 2: Polling and Results Fetch

**✅ IMPLEMENTED** - Make a POST request to `https://www.flightsfinder.com/portal/kiwi/search` with:

- The cookie from phase 1
- The extracted token as '\_token' in the POST body
- All other parameters as in phase 1 (originplace, destinationplace, outbounddate, inbounddate, cabinclass, adults, children, infants, currency, type, bags-cabin: 0, bags-checked: 0)
- Use the same headers as the browser (see user example)
- **✅ IMPLEMENTED** - The response will be a string split by '|' into 7 parts:
  - The second part is the number of results
  - The seventh part is the actual results in HTML
- **✅ IMPLEMENTED** - Scrape the seventh part HTML to extract lists of:
  - ScrapedFlight
  - ScrapedBundle
  - ScrapedBookingOption

#### Entity Shapes

**✅ IMPLEMENTED** - **ScrapedFlight**

- flightNumber: string
- departureAirportIataCode: string (IATA code)
- arrivalAirportIataCode: string (IATA code)
- departureTime: string (HH:MM format, extracted from HTML)
- duration: number (duration in minutes, calculated from HTML departure/arrival times)
- connectionDurationFromPreviousFlight?: number // duration in minutes, parsed from connection string (e.g. "9h 55") after each flight in the HTML. Only present for flights after the first in a sequence.
- **✅ IMPLEMENTED** - **ScrapedBundle**
  - departureDate: string (YYYY-MM-DD format, extracted from HTML content like "Sat, 11 Oct 2025")
  - returnDate: string (YYYY-MM-DD format, extracted from HTML content like "Sat, 11 Oct 2025")
  - outboundFlights: array of ScrapedFlight objects
  - inboundFlights: array of ScrapedFlight objects
  - bookingOptions: array of ScrapedBookingOption objects
- **✅ IMPLEMENTED** - **ScrapedBookingOption**
  - agency: string
  - price: number
  - linkToBook: string
  - currency: string
  - extractedAt: Unix timestamp in ms

#### Database Insertion Order

**✅ IMPLEMENTED**

1. Insert scrapedFlights to flights table (bulk insert)
2. Insert scrapedBundles to bundles table (map outbound/inbound flights to DB ids from flights)
3. Insert scrapedBookingOptions to bookingOptions table (map to DB id from bundles)

#### Error Handling

**✅ IMPLEMENTED** - Log success and handle errors at each step.
**✅ IMPLEMENTED** - Ensure deduplication by using flight number, airports, and dates for flights.
**✅ IMPLEMENTED** - Handle 419 responses by always using the latest cookie from the previous poll response.

### Skyscanner Scraping Process

**✅ IMPLEMENTED** - The scraping for Skyscanner is performed in an actor that receives the following parameters (FlightSearchParams):

- departureAirport: string (IATA code)
- arrivalAirport: string (IATA code)
- departureDate: Date
- returnDate?: Date
- isRoundTrip: boolean

The process consists of two phases:

#### Phase 1: Initial Fetch

**✅ IMPLEMENTED** - Make a fetch call to: `https://www.flightsfinder.com/portal/sky` with the following query parameters:

- originplace: departureAirport (IATA code)
- destinationplace: arrivalAirport (IATA code)
- outbounddate: departureDate formatted as `YYYY-MM-DD`
- inbounddate: returnDate formatted as `YYYY-MM-DD` (if round trip)
- cabinclass: 'Economy'
- adults: 1
- children: 0
- infants: 0
- currency: 'EUR'
- **✅ IMPLEMENTED** - Save the cookie returned in the response for use in phase 2.
- **✅ IMPLEMENTED** - In the HTML response, locate the <script> tag at the bottom of <body> and extract the following values:
  - \_token
  - session
  - suuid
  - deeplink

#### Phase 2: Polling for Results

**✅ IMPLEMENTED** - Enter a polling loop:

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
- **✅ IMPLEMENTED** - The response will be a string split by '|' into 7 parts:
  - The first part is 'Y' or 'N'. If 'N', more results are available and you must poll again. If 'Y', all results have been received and polling can stop.
  - The second part is the number of total results to be expected
  - The seventh part is the actual results in HTML
- **✅ IMPLEMENTED** - Scrape the seventh part HTML to extract lists of:
  - ScrapedFlight
  - ScrapedBundle
  - ScrapedBookingOption
- **✅ IMPLEMENTED** - After each poll, update the cookie for the next request
- **✅ IMPLEMENTED** - Wait 100ms between polls
- **✅ IMPLEMENTED** - Once all results are received ('Y'), exit the polling loop and log success.

### Data Storage

14. **✅ IMPLEMENTED** - The system stores flight data in three main tables:

- **flights**: uniqueId, flightNumber, departureAirportId, arrivalAirportId, departureDateTime, arrivalDateTime
- **bundles**: uniqueId, searchId, outboundFlightIds (array), inboundFlightIds (array, optional for one-way)
- **bookingOptions**: uniqueId, targetId (bundle reference), agency, price, currency, linkToBook, extractedAt

15. **✅ IMPLEMENTED** - The system extends the airports table with a popularity score field:

    - **airports**: Add popularityScore field (integer, 0-1000) for ranking airports by popularity
    - Popularity scores should be based on airport size, passenger traffic, and route importance
    - Major hubs (JFK, LAX, LHR, CDG, etc.): 900-1000
    - Large international airports: 700-899
    - Medium regional airports: 400-699
    - Small domestic airports: 100-399
    - Very small airports: 0-99

16. **✅ IMPLEMENTED** - The system includes additional database tables:

    - **scrapeSessions**: Tracks scraping progress for real-time updates
    - **airlines**: Airline reference data
    - Search ID functionality for efficient bundle lookup

17. **✅ IMPLEMENTED** - The system handles duplicates based on uniqueId as follows:
    - **flights**: If duplicate uniqueId exists, keep the original flight
    - **bundles**: If duplicate uniqueId exists, keep the original bundle
    - **bookingOptions**: If duplicate uniqueId exists, replace the original with the new booking option
    - No duplicates should exist in any table

### Results Display

18. **✅ IMPLEMENTED** - The system displays bundles sorted by lowest available price

19. **✅ IMPLEMENTED** - The system calculates bundle price as the minimum price across all associated booking options

20. **✅ IMPLEMENTED** - The system shows "No flights match your search criteria" when no results are found

21. **✅ IMPLEMENTED** - The system displays booking options with agency information and booking links for each bundle

22. **✅ IMPLEMENTED** - The system provides additional sorting options:
    - Price (ascending)
    - Departure time
    - Flight duration

### UI Integration and Search-to-Results Flow

23. **✅ IMPLEMENTED** - The system integrates the search form with results display in a unified user experience

24. **✅ IMPLEMENTED** - The system implements a search hook that manages the entire search lifecycle:

    - Form validation and submission
    - Triggering scraping operations for both Kiwi and Skyscanner
    - Real-time progress tracking and updates
    - Results fetching and display
    - Error handling and user feedback

25. **✅ IMPLEMENTED** - The system wires up the search form to trigger scraping operations when submitted

26. **✅ IMPLEMENTED** - The system displays real-time scraping progress for both sources simultaneously

27. **✅ IMPLEMENTED** - The system handles all search states:

    - Initial state (no search performed)
    - Loading state (search in progress)
    - Results state (search completed with results)
    - Error state (search failed)
    - Empty results state (search completed with no results)

28. **✅ IMPLEMENTED** - The system implements proper state management to prevent multiple simultaneous searches

29. **✅ IMPLEMENTED** - The system provides clear user feedback for each state with appropriate loading indicators and error messages

30. **✅ IMPLEMENTED** - The system ensures the search form and results list work together seamlessly without layout shifts

31. **✅ IMPLEMENTED** - The system implements proper cleanup of previous search results when a new search is initiated

32. **✅ IMPLEMENTED** - The system uses URL-based routing for search parameters, allowing:
    - Shareable search URLs
    - Browser navigation (back/forward)
    - Bookmark support
    - Direct linking to searches

### Error Handling

33. **✅ IMPLEMENTED** - The system handles website structure changes gracefully by logging errors and continuing operation

34. **✅ IMPLEMENTED** - The system shows partial results if some scraping sources are unavailable

35. **✅ IMPLEMENTED** - The system provides clear error messages for invalid search parameters

### Data Transformation Layer (HTML Extraction)

**✅ IMPLEMENTED** - For this project, the data transformation layer consists of robust, source-specific HTML parsing and extraction logic. Each scraper (Kiwi, Skyscanner, etc.) implements its own logic to convert raw HTML (from the 7th part of the response) into standardized ScrapedFlight, ScrapedBundle, and ScrapedBookingOption entities.

**✅ IMPLEMENTED** - Each scraper has two phases, and the HTML returned in each phase is different. Phase 1 requires extraction of session/token data; Phase 2 requires extraction of flight/bundle/booking option entities. Separate extraction logic exists for each phase.

**✅ IMPLEMENTED** - This logic is modular and testable, as HTML extraction is a common source of bugs. The extractors work with real data instead of mock data:

- Extract actual flight dates from HTML content (e.g., "Sat, 11 Oct 2025") and convert to YYYY-MM-DD format
- Calculate actual flight durations from departure and arrival times in the HTML
- Parse date patterns in summary sections and other parts of the HTML
- Fall back to search parameters only if no date is found in the HTML
- Handle multi-leg flights where different legs may have different dates
- The extractors receive search parameters as fallback but prioritize actual HTML content

### Search ID Implementation

36. **✅ IMPLEMENTED** - The system includes a searchId field in bundles for efficient search matching:
    - Generated from: `{departureAirportIata}_{departureDateTimeMs}_{arrivalAirportIata}_{returnDateTimeMs}`
    - Indexed for fast lookup
    - Used by getBundlesForSearch for O(log n) performance
    - Backwards compatible with existing bundles without searchId

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

**✅ IMPLEMENTED** - Use existing shadcn components where possible, with modifications as needed
**✅ IMPLEMENTED** - Provide clear visual feedback for scraping progress
**✅ IMPLEMENTED** - Use intuitive icons and colors for different states (loading, success, error)
**✅ IMPLEMENTED** - Ensure accessibility compliance with proper ARIA labels and keyboard navigation
**✅ IMPLEMENTED** - Maintain consistent component sizing to prevent layout shifts (e.g., fixed width date picker that accommodates both single and round-trip date ranges)
**✅ IMPLEMENTED** - Theme support with light/dark modes and user preference persistence

### Component Modifications

**✅ IMPLEMENTED** - Extend existing form components to support IATA code inputs with autocomplete
**✅ IMPLEMENTED** - Add progress indicators for multi-source scraping
**✅ IMPLEMENTED** - Create bundle display cards with pricing and booking information
**✅ IMPLEMENTED** - Use existing date range picker component with integrated round-trip toggle for better UX
**✅ IMPLEMENTED** - Modify existing UI components to integrate with new flight search functionality
**✅ IMPLEMENTED** - Ensure new components follow existing design patterns and styling
**✅ IMPLEMENTED** - Implement airport search functionality with priority-based autocomplete
**✅ IMPLEMENTED** - Add theme toggle component for switching between light and dark modes

## Technical Considerations

### Convex Platform Requirements

**✅ IMPLEMENTED** - **Backend Framework:** The application is built on Convex platform
**✅ IMPLEMENTED** - **Database:** Extended existing Convex schema with additional tables and fields as needed
**✅ IMPLEMENTED** - **Real-time Updates:** Leverages Convex's real-time capabilities for scraping progress updates
**✅ IMPLEMENTED** - **Actions vs Functions:** Uses Convex actions for scraping operations (external API calls) and functions for data queries
**✅ IMPLEMENTED** - **Error Handling:** Implements proper error handling for Convex actions and functions
**✅ IMPLEMENTED** - **Rate Limiting:** Follows Convex's rate limiting guidelines for external API calls
**✅ IMPLEMENTED** - **Development Environment:** Uses Convex dev environment for all development and testing
**✅ IMPLEMENTED** - **Existing Codebase:** Built upon existing schema and UI components, extending rather than replacing

### Database Schema

**✅ IMPLEMENTED** - Extended existing Convex schema with the required tables for flight data
**✅ IMPLEMENTED** - Uses airport IDs (references to airports table) for flight departure and arrival locations
**✅ IMPLEMENTED** - Stores datetime values as Unix milliseconds for consistency
**✅ IMPLEMENTED** - Implements proper foreign key relationships between tables using Convex references
**✅ IMPLEMENTED** - Adds indexes for efficient querying by date ranges and airports
**✅ IMPLEMENTED** - Adds popularityScore field to airports table with index for autocomplete ordering
**✅ IMPLEMENTED** - Follows Convex naming conventions and schema design patterns
**✅ IMPLEMENTED** - Ensures compatibility with existing schema structure
**✅ IMPLEMENTED** - Includes searchId field in bundles for efficient search matching

### Scraping Architecture

**✅ IMPLEMENTED** - Implements modular scraping system for easy addition of new sources
**✅ IMPLEMENTED** - Uses Convex actions for all scraping operations to handle external API calls
**✅ IMPLEMENTED** - Implements retry logic for failed scraping attempts within Convex actions
**✅ IMPLEMENTED** - Stores scraping logs in Convex database for debugging and monitoring
**✅ IMPLEMENTED** - Uses Convex's real-time subscriptions to update UI with scraping progress
**✅ IMPLEMENTED** - Implements streaming approach for processing large result sets

### Performance Optimization

**✅ IMPLEMENTED** - Implements efficient Convex queries for bundle price calculation
**✅ IMPLEMENTED** - Uses Convex pagination for large result sets
**✅ IMPLEMENTED** - Optimizes scraping parallelization using Convex actions
**✅ IMPLEMENTED** - Optimizes airport autocomplete queries using popularity score indexing
**✅ IMPLEMENTED** - Follows Convex best practices for query optimization and indexing
**✅ IMPLEMENTED** - Implements searchId-based bundle lookup for O(log n) performance

### Engineering/Testability Note

**✅ IMPLEMENTED** - Each step of the scraping process (fetching, parsing, token/cookie extraction, entity extraction, DB insertion, etc.) is implemented in a way that is easily testable. This is critical for robust development and debugging, as scrapers are often a source of subtle bugs.

## Success Metrics

1. **Search Response Time:** 90% of searches complete within 30 seconds
2. **Scraping Success Rate:** 95% success rate for available sources
3. **Data Accuracy:** 100% of displayed prices match actual booking prices
4. **User Experience:** Zero UI blocking during scraping operations

## Recent Additions and Improvements

### Theme System

**✅ IMPLEMENTED** - Comprehensive light/dark theme support:

- CSS variables for consistent theming across all components
- Theme toggle in header
- System preference detection
- localStorage persistence
- Yellow accent color scheme in dark mode

### Enhanced Search Experience

**✅ IMPLEMENTED** - URL-based search parameters for:

- Shareable search links
- Browser navigation support
- Bookmark functionality
- Direct search access

### Real-time Progress Tracking

**✅ IMPLEMENTED** - Detailed scraping progress display:

- Individual source status tracking
- Progress indicators for each phase
- Error state handling
- Session-based progress monitoring

### Optimized Data Access

**✅ IMPLEMENTED** - SearchId implementation for efficient bundle lookup:

- Indexed searchId field
- O(log n) search performance
- Backwards compatibility
- Automatic searchId generation

### Enhanced UI Components

**✅ IMPLEMENTED** - Improved user interface:

- Compact results display
- Sorting options (price, time, duration)
- Theme-aware components
- Responsive design
- Booking options popup
- Airport autocomplete with history

---

**Document Version:** 1.0  
**Last Updated:** [Current Date]  
**Target Audience:** Junior developers implementing the flight scraping application

# In the database insertion/data processing section:

- To build `departureDateTime`, combine `departureDate` and `departureTime`, and adjust for the timezone offset of the departure airport (timezone is found in the airports table).
- To build `arrivalDateTime`, add the `duration` (in minutes) to the `departureDateTime`.
- The extractor output does NOT include `departureDateTime` or `arrivalDateTime` fields; these are computed during data processing.
