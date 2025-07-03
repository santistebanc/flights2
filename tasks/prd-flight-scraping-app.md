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

### Error Handling

17. The system must handle website structure changes gracefully by logging errors and continuing operation

18. The system must show partial results if some scraping sources are unavailable

19. The system must provide clear error messages for invalid search parameters

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
- Implement responsive design for mobile and desktop use
- Provide clear visual feedback for scraping progress
- Use intuitive icons and colors for different states (loading, success, error)
- Ensure accessibility compliance with proper ARIA labels and keyboard navigation

### Component Modifications

- Extend existing form components to support IATA code inputs with autocomplete
- Add progress indicators for multi-source scraping
- Create bundle display cards with pricing and booking information
- Use existing date range picker component (no new implementation needed)
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
