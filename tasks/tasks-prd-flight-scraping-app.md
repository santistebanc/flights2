# Task List: Flight Scraping Application

<!-- Task list updated to reflect actual codebase progress as of 2024-06-09 -->

Based on PRD: `prd-flight-scraping-app.md`

## Relevant Files

### Convex Schema and Backend

- `convex/schema.ts` - Extend existing schema with flight data tables
- `convex/flights.ts` - Convex functions for flight data queries
- `convex/bundles.ts` - Convex functions for bundle data queries
- `convex/bookingOptions.ts` - Convex functions for booking options queries
- `convex/airports.ts` - Convex functions for airport search and queries
- `convex/scrapingActions.ts` - Convex actions for web scraping operations
- `convex/scrapingLogs.ts` - Convex functions for scraping monitoring
- `convex/dataCleanup.ts` - Scheduled functions for data cleanup

### Frontend Components

- `components/flight-search/FlightSearchForm.tsx` - Main search form component that combines all flight search fields
- `components/flight-search/IataInput.tsx` - IATA code input component with autocomplete
- `components/flight-search/AirportAutocomplete.tsx` - Airport search autocomplete component
- `components/flight-search/SearchButton.tsx` - Reusable search button component with comprehensive loading states
- `components/flight-results/BundleCard.tsx` - Individual bundle display card
- `components/flight-results/ResultsList.tsx` - Results list with sorting
- `components/flight-results/BookingOptions.tsx` - Booking options display
- `components/progress/ScrapingProgress.tsx` - Real-time progress indicators
- `components/ui/NoResultsMessage.tsx` - No results found message

### Utilities and Hooks

- `lib/flight-utils.ts` - Flight data utilities and calculations
- `lib/scraping-utils.ts` - Scraping helper functions
- `hooks/useFlightSearch.ts` - Custom hook for flight search logic
- `hooks/useScrapingProgress.ts` - Custom hook for progress tracking
- `hooks/useLocalStorage.ts` - Custom hook for localStorage management of search preferences

### Types and Interfaces

- `types/flight.ts` - TypeScript types for flight data
- `types/scraping.ts` - TypeScript types for scraping operations
- `types/bundle.ts` - TypeScript types for bundle data

### Test Files

- `components/flight-results/BundleCard.test.tsx` - Tests for bundle display
- `convex/flights.test.ts` - Tests for flight queries
- `convex/scrapingActions.test.ts` - Tests for scraping actions
- `lib/flight-utils.test.ts` - Tests for flight utilities

## Tasks

- [ ] 1.0 Extend Existing Convex Schema for Flight Data

  - [x] 1.1 Review existing Convex schema structure and identify integration points
  - [x] 1.2 Add flights table with fields: flightNumber, departureAirportId, arrivalAirportId, departureDateTime, arrivalDateTime
  - [x] 1.3 Add bundles table with fields: uniqueId, outboundFlightIds (array), inboundFlightIds (array)
  - [x] 1.4 Add bookingOptions table with fields: targetId, agency, price, currency, linkToBook, extractedAt
  - [x] 1.5 Add scrapingLogs table for monitoring and debugging purposes
  - [x] 1.6 Implement proper Convex references and relationships between tables
  - [x] 1.7 Add indexes for efficient querying by date ranges and airports
  - [x] 1.8 Test schema compatibility with existing data and queries

- [x] 2.0 Enhance Search Interface with Flight-Specific Components

  - [x] 2.1 Create IATA code input components with validation (3-character airport codes)
  - [x] 2.1.1 Add autocomplete functionality to IATA inputs with priority-based search
  - [x] 2.1.2 Integrate IataInput components into existing Filters component
  - [x] 2.1.3 Add auto-scroll functionality to autocomplete dropdown
  - [x] 2.1.4 Remove forced capitalization from IATA inputs
  - [x] 2.1.5 Add validation to IataInput component (show red border for invalid IATA codes)
  - [x] 2.1.6 Add form validation to disable search button when any inputs are invalid
  - [x] 2.1.7 Implement IATA input history with localStorage persistence and priority-based autocomplete
  - [x] 2.1.8 Redo airport inputs with shadcn-compatible autocomplete structure
  - [x] 2.2 Integrate round-trip toggle into existing date range picker for better UX
  - [x] 2.2.1 Implement fixed width date picker to prevent layout shifts
  - [x] 2.3 Integrate existing date range picker with flight search logic
  - [x] 2.4 Create search form component that combines all flight search fields
  - [x] 2.5 Implement localStorage integration for saving search preferences
  - [x] 2.6 Add form validation for required fields (departure/arrival airports, dates)
  - [x] 2.7 Create search button component with loading states
  - [x] 2.8 Integrate FlightSearchForm component into main app UI
  - [cancelled] 2.9 Add accessibility features (ARIA labels, keyboard navigation)
  - [x] 2.10 Create airport search functionality with Convex queries

- [x] 3.0 Implement Multi-Source Scraping Engine

  - [x] 3.1 Create base scraping interface/abstract class for different sources
  - [x] 3.2 Implement Skyscanner scraper using Convex actions
  - [x] 3.3 Implement Kiwi scraper using Convex actions
  - [x] 3.4 Create scraping coordinator to handle parallel scraping operations
  - [x] 3.5 Implement retry logic for failed scraping attempts
  - [x] 3.6 Add rate limiting and polite crawling practices (not needed at the moment)
  - [x] 3.7 Create data transformation layer: implement robust, source-specific HTML parsing and extraction logic for each scraper, covering both phases (session/token extraction for Phase 1, entity extraction for Phase 2)
    - [x] 3.7.1 Implement and test modular HTML extraction functions for each scraper and phase (using sample HTML snippets)
    - [x] 3.7.2 Fix Kiwi Phase 2 flight extraction with robust regex-based parsing
    - [x] 3.7.3 Fix Skyscanner Phase 2 flight extraction with robust regex-based parsing
  - [x] 3.8 Implement duplicate handling logic (keep flights/bundles, replace bookingOptions; see deduplication in 3.10/3.11)
  - [x] 3.9 Add scraping error logging and monitoring
  - [x] 3.10 Implement Kiwi Scraping Process
    - [x] 3.10.1 Set up Kiwi scraping actor to receive FlightSearchParams
    - [x] 3.10.2 Implement phase 1: fetch HTML from flightsfinder.com/portal/kiwi with correct query params
    - [x] 3.10.3 Extract cookie and \_token from HTML response
    - [x] 3.10.4 Implement phase 2: POST to /portal/kiwi/search with correct headers, cookie, and token
    - [x] 3.10.5 Parse response, split by '|', extract result HTML (7th part)
    - [x] 3.10.6 Scrape HTML for flights, bundles, and booking options
    - [x] 3.10.7 For each flight, lookup airport DB ids by IATA code (Convex query)
    - [x] 3.10.8 Generate uniqueIds for deduplication (flights, bundles, booking options)
    - [x] 3.10.9 Bulk insert flights, then bundles (mapping uniqueIds to DB ids), then booking options (mapping targetUniqueId to bundle DB id)
    - ✅ IMPLEMENTED: Created flights.ts, bundles.ts, bookingOptions.ts with bulk insertion functions
    - ✅ IMPLEMENTED: Created data_processing.ts to orchestrate database insertion process
    - ✅ IMPLEMENTED: Updated scraping actions to actually insert data into database
    - [x] 3.10.10 Log success and handle errors at each step
    - [x] 3.10.11 Ensure each step (fetching, parsing, extraction, DB insertion) is modular and testable
  - [x] 3.11 Implement Skyscanner Scraping Process
    - [x] 3.11.1 Set up Skyscanner scraping actor to receive FlightSearchParams
    - [x] 3.11.2 Implement phase 1: fetch HTML from flightsfinder.com/portal/sky with correct query params
    - [x] 3.11.3 Extract cookie, \_token, session, suuid, and deeplink from HTML response
    - [x] 3.11.4 Implement phase 2: polling POSTs to /portal/sky/poll with correct headers, cookie, and extracted values
    - [x] 3.11.5 Parse each poll response, split by '|', extract result HTML (7th part)
    - [x] 3.11.6 Scrape HTML for flights, bundles, and booking options
    - [x] 3.11.7 For each flight, lookup airport DB ids by IATA code (Convex query)
    - [x] 3.11.8 Generate uniqueIds for deduplication (flights, bundles, booking options)
    - [x] 3.11.9 Bulk insert flights, then bundles (mapping uniqueIds to DB ids), then booking options (mapping targetUniqueId to bundle DB id)
    - ✅ IMPLEMENTED: Created flights.ts, bundles.ts, bookingOptions.ts with bulk insertion functions
    - ✅ IMPLEMENTED: Created data_processing.ts to orchestrate database insertion process
    - ✅ IMPLEMENTED: Updated scraping actions to actually insert data into database
    - [x] 3.11.10 Log success and handle errors at each step
    - [x] 3.11.11 Implement polling loop: repeat until first part of response is 'Y', always use latest cookie
    - [x] 3.11.12 Ensure each step (fetching, parsing, extraction, DB insertion) is modular and testable

- [ ] 4.0 Create Bundle Display and Results Management System

  - [x] 4.1 Create bundle card component to display flight information
  - [x] 4.2 Implement price calculation logic (minimum across booking options)
  - [x] 4.3 Create results list component with price sorting
  - [x] 4.4 Add booking options display with agency information and links
  - [ ] 4.5 Implement "No results found" state and messaging
  - [ ] 4.6 Create loading states for results display
  - [ ] 4.7 Add pagination for large result sets using Convex pagination
  - [ ] 4.8 Implement bundle filtering and search within results
  - [ ] 4.9 Add responsive design for results display
  - [ ] 4.10 Integrate ResultsList and BundleCard into the main app UI
    - Render search results below the search form
    - Wire up search logic to display results using the new components
    - Ensure loading, error, and empty states are handled
    - Ensure the UI is responsive and visually consistent

- [ ] 5.0 Implement Search-to-Results Integration and State Management

  - [x] 5.1 Create useFlightSearch hook to manage entire search lifecycle
    - Form validation and submission logic
    - Triggering scraping operations for both Kiwi and Skyscanner
    - Real-time progress tracking and updates
    - Results fetching and display management
    - Error handling and user feedback
  - [x] 5.2 Wire up search form submission to trigger scraping operations
    - Connect FlightSearchForm onSubmit to useFlightSearch hook
    - Validate form data before triggering search
    - Prevent multiple simultaneous searches
  - [x] 5.3 Implement real-time scraping progress display
    - Show progress for both Kiwi and Skyscanner simultaneously
    - Display current phase (Phase 1/Phase 2) for each source
    - Show estimated completion time
  - [ ] 5.4 Create comprehensive state management for all search states
    - Initial state (no search performed)
    - Loading state (search in progress with progress indicators)
    - Results state (search completed with results displayed)
    - Error state (search failed with clear error messages)
    - Empty results state (search completed with no results)
  - [ ] 5.5 Implement proper cleanup and state transitions
    - Clear previous search results when new search is initiated
    - Reset progress indicators between searches
    - Handle component unmounting during active searches
  - [ ] 5.6 Add user feedback and error messaging
    - Loading indicators with descriptive text
    - Error messages with actionable suggestions
    - Success confirmations for completed searches
  - [ ] 5.7 Ensure seamless UI integration
    - Prevent layout shifts during state transitions
    - Maintain consistent spacing and alignment
    - Ensure responsive design across all states
  - [ ] 5.8 Implement search history and persistence
    - Save search parameters to localStorage
    - Restore previous search state on page reload
    - Allow users to retry failed searches

- [ ] 6.0 Add Real-time Progress Tracking and Error Handling

  - [ ] 6.1 Create progress tracking system using Convex subscriptions
  - [ ] 6.2 Implement real-time progress indicators for each scraping source
  - [ ] 6.3 Add error state management and user notifications
  - [ ] 6.4 Create graceful degradation when sources are unavailable
  - [ ] 6.5 Implement partial results display when some sources fail
  - [ ] 6.6 Add error logging and monitoring dashboard
  - [ ] 6.7 Create retry mechanisms for failed operations
  - [ ] 6.8 Implement proper error boundaries and fallback UI

- [ ] 7.0 Implement Data Cleanup and Validation Logic

  - [ ] 7.1 Create scheduled function to delete expired bundles (past flight dates)
  - [ ] 7.2 Implement data validation for scraped flight information
  - [ ] 7.3 Add data integrity checks and repair mechanisms
  - [ ] 7.4 Create monitoring for data quality and consistency
  - [ ] 7.5 Implement cleanup of orphaned data (unreferenced flights/bundles)
  - [ ] 7.6 Add data retention policies and automatic cleanup
  - [ ] 7.7 Create data health monitoring and alerting
  - [ ] 7.8 Implement backup and recovery procedures for critical data

- [ ] FUTURE: Audit and complete airports database (low priority)
  - Review current airports table for missing major/relevant airports (e.g., LAX)
  - Import or update records as needed to ensure comprehensive coverage
  - Consider using a reputable, up-to-date airport dataset for bulk import
  - Test autocomplete and search for major global airports

### Notes

- All development should be done in the Convex dev environment
- Build upon existing Convex schema and UI components rather than starting from scratch
- Use Convex actions for scraping operations and functions for data queries
- Follow Convex best practices for schema design and real-time updates
- Implement proper error handling for both actions and functions
- Extend existing shadcn components where possible, maintaining design consistency
- Ensure compatibility with existing codebase structure and patterns
- Testing infrastructure needs to be set up (Jest + React Testing Library) for component testing
