# Flight Scraping Project - Implementation Summary

## Current Status

### ✅ Completed Phases

#### Phase 1: Core Infrastructure ✅

- **Database Schema**: Complete with all tables (flights, airports, airlines, bundles, bookingOptions)
- **Unique ID Strategy**: Implemented for all entity types
- **Data Flow Architecture**: Three-phase approach (Scraping → Processing → Storage)
- **Type Definitions**: Complete TypeScript interfaces for all entities

#### Phase 2: Scraping Infrastructure ✅

- **Multi-Source Framework**: Modular scraper architecture
- **Data Collection Strategy**: Array-based collection with duplicate prevention
- **Error Handling**: Graceful degradation and retry logic
- **Rate Limiting**: Polite crawling implementation

#### Phase 3: Data Processing & Storage ✅

- **Bulk Insertion Mutations**: Complete implementation for all entity types
- **Processing Pipeline**: Individual bulk insertion mutations handle the complete flow
- **ID Mapping**: Proper mapping from uniqueIds to Convex IDs
- **Duplicate Prevention**: Different strategies for each entity type
- **Ordered Insertion**: Flights → Bundles → BookingOptions sequence

#### Phase 4: Multi-Source Architecture ✅

- **MultiSourceScraper**: Parallel processing framework implemented
- **Kiwi and Sky Integration**: Both scrapers working with proper configuration
- **TypeScript Stability**: All compilation errors resolved, development environment stable
- **Configuration Management**: Centralized source configuration system
- **Error Handling**: Comprehensive error handling across all scrapers

#### Phase 5: Web Scraping Best Practices ✅

- **Session Management**: Correct token extraction and cookie flow implemented
- **Sky Scraper Polling**: Fixed polling method with proper session state management
- **Debug-First Development**: Comprehensive debugging approach established
- **Documentation**: Complete web scraping best practices guide created
- **Error Recovery**: Proper handling of 419 errors and session expiration

### 🔄 In Progress

- **Phase 6**: Database Integration (Live Data Storage) - Ready for live scraper integration

### 📋 Pending Phases

- **Phase 7**: Advanced UI Features (Source selection, progress tracking, real-time updates)
- **Phase 8**: Caching System (7-day cache, validation, cleanup)
- **Phase 9**: Data Quality & Validation (Quality checks, integrity monitoring)
- **Phase 10**: Performance Optimization (Memory management, network efficiency)

## Critical Scraping Logic & Session Management

### Exact Token and Cookie Flow Requirements

#### Kiwi Scraper Flow

1. **Initial Page Request**:

   - Fetch the initial search page (e.g., `/flights/from-to/`)
   - Extract ONLY the session cookie from the response headers
   - Do NOT extract any tokens from the initial page

2. **Token Extraction**:

   - Tokens are generated during the polling process, not on the initial page
   - Extract tokens from the `CFFLive` JavaScript object in polling responses
   - Use specific token names: `_token`, `csrf_token`, etc.

3. **Cookie Management**:

   - Use ONLY the session cookie from the initial response for all subsequent requests
   - Do NOT update cookies from polling responses
   - Maintain the same session cookie throughout the entire scraping session

4. **Request Construction**:
   - Include extracted tokens in request body/form data
   - Include session cookie in request headers
   - Use consistent headers (User-Agent, Accept, etc.)

#### Sky Scraper Flow

1. **Initial Page Request**:

   - Fetch the initial search page
   - Extract session cookie from response headers
   - Extract tokens from the last `<script>` tag in the HTML

2. **Token Extraction**:

   - Extract tokens from the last script tag only
   - Look for specific token patterns in JavaScript code
   - Do NOT use fallback token extraction strategies

3. **Polling with Cookie Updates**:

   - For each polling request, use current cookies
   - After each poll response, extract new cookies from response headers
   - Update cookies for the next poll request with cookies from current response
   - Maintain this cookie flow: current cookies → request → response cookies → next request

4. **Session State Management**:
   - Track cookies across all polling requests
   - Update session state after each response
   - Handle 419 errors by ensuring proper token/cookie state

### Implementation Requirements

#### Strict Token Extraction

- **No Fallbacks**: Use only the specified token extraction methods
- **JavaScript Parsing**: Extract tokens from specific JavaScript objects/patterns
- **Validation**: Ensure all required tokens are present before making requests

#### Cookie Flow Implementation

```typescript
// Kiwi: Use initial session cookie only
let sessionCookie = initialResponseCookies.session;

// Sky: Update cookies after each poll response
let currentCookies = initialResponseCookies;
for (let poll = 0; poll < maxPolls; poll++) {
  const response = await makePollRequest(currentCookies);
  currentCookies = extractCookiesFromResponse(response);
}
```

#### Request Headers Consistency

- Use identical headers across all requests
- Include proper User-Agent, Accept, Content-Type
- Maintain referer headers for authenticity

#### Error Handling

- Handle 419 "Page Expired" errors
- Retry with fresh tokens when needed
- Validate token presence before requests

### Debug-First Development

- Create debug scripts to analyze real website behavior
- Save response HTML and headers for analysis
- Test against actual websites, not assumptions
- Document exact request/response patterns

## Recent Achievements (Phase 4 Completion)

### Multi-Source Framework Success

1. **✅ Parallel Processing**: MultiSourceScraper handles multiple sources simultaneously
2. **✅ Source Configuration**: Centralized configuration for Kiwi and Sky scrapers
3. **✅ Type Safety**: All TypeScript errors resolved, stable development environment
4. **✅ Error Resilience**: Comprehensive error handling across all components
5. **✅ Development Environment**: Backend and frontend running successfully

### Technical Improvements

- **Import Path Fixes**: Resolved all autonomousDebugger import issues
- **Function Signatures**: Fixed HTMLParser method calls and type issues
- **Configuration Structure**: Proper nested SourceConfig implementation
- **Database Queries**: Sample data accessible and queries working properly

## Recent Achievements (Phase 5 Completion)

### Web Scraping Best Practices Success

1. **✅ Session Management**: Correct token extraction and cookie flow implemented
2. **✅ Sky Scraper Polling**: Fixed polling method with proper session state management
3. **✅ Debug-First Development**: Comprehensive debugging approach established
4. **✅ Documentation**: Complete web scraping best practices guide created
5. **✅ Error Recovery**: Proper handling of 419 errors and session expiration

### Critical Learnings Implemented

- **Token Extraction Strategy**: Extract ALL required tokens from initial page, never during polling
- **Cookie Flow Management**: Use initial page cookies for first request, then cookies from each response for subsequent requests
- **Session State Tracking**: Maintain session state across multiple requests with proper cookie updates
- **Response Header Analysis**: Always extract and use Set-Cookie headers from responses
- **Multiple Cookie Handling**: Parse multiple Set-Cookie headers and merge them properly
- **Debug-First Approach**: Create comprehensive debug scripts to analyze real website behavior
- **Documentation-Driven Development**: Follow website documentation exactly for request/response patterns
- **Error Recovery**: Handle 419 "Page Expired" errors by ensuring proper token/cookie state
- **Request Headers**: Use consistent headers across all requests (User-Agent, Accept, etc.)
- **Rate Limiting**: Implement polite delays between polling requests (100ms intervals)

### Technical Improvements

- **SkyParser Updates**: Fixed token extraction to work with both loading and results pages
- **SkyScraper Polling**: Implemented correct cookie flow management
- **Cookie Extraction**: Enhanced to handle multiple Set-Cookie headers
- **Error Handling**: Improved validation and error messages for missing tokens
- **Debug Scripts**: Created comprehensive debugging tools for session analysis

## New UI Requirements & Design

### Sticky Header Layout

- **Top Row**: Airport inputs, date range picker, search button, settings button
- **Bottom Row**: Results count and scraping progress indicators
- **Auto-filtering**: Date picker updates filters automatically (not applied until search)
- **Settings Popup**: Source selection (Kiwi, Sky) with toggle controls

### Main Content Area

- **Timeline Component**: Full-height display with vertical scrolling at window level
- **Bundle Data Structure**: Extended bundles with flight and booking option details
- **Responsive Design**: Maintains existing theme and styling

### Data Flow Integration

- **Bundle Queries**: Fetch bundles with extended flight and booking option data
- **Real-time Updates**: Progress indicators for scraping sources
- **Filter Application**: Search button triggers scraping and applies filters

## Key Learnings & Best Practices

### Schema Design & Migration

- **Schema Validation**: Always test schema changes with existing data before deployment
- **Migration Strategy**: Use migration scripts for field name changes or data structure updates
- **Backward Compatibility**: Consider compatibility when evolving schemas
- **ID Separation**: Clear distinction between business uniqueIds and database Convex IDs

### Type Safety & Development

- **Explicit Types**: Crucial in Convex functions to avoid type inference issues
- **Circular References**: Handle with proper type annotations and imports
- **Import Management**: Always import `internal` from generated API
- **Type Limitations**: Add explicit types for complex objects and return values
- **Import Path Resolution**: Use correct relative paths for cross-directory imports

### Performance & Scalability

- **Bulk Operations**: Significantly more efficient than individual inserts
- **Array Collection**: Improves performance during scraping phase
- **Memory-Based Duplicates**: Handle duplicate prevention in memory before database operations
- **ID Mapping**: Essential for maintaining relationships between entities

### Error Handling & Resilience

- **Graceful Degradation**: Prevents entire pipeline failures
- **Missing Data**: Plan for handling missing airports, flights, etc.
- **Comprehensive Logging**: Essential for debugging and monitoring
- **Retry Logic**: Implement for transient failures

### Data Flow Architecture

- **Three-Phase Approach**: Clear separation of concerns (Scraping → Processing → Storage)
- **Duplicate Strategies**: Different approaches for different entity types
- **Ordered Insertion**: Maintains referential integrity
- **Batch Processing**: Improves overall system performance

### Multi-Source Development

- **Parallel Processing**: Handle multiple sources simultaneously for better performance
- **Source Isolation**: Each scraper operates independently to prevent cascading failures
- **Configuration Management**: Centralized configuration for easy source management
- **Type Safety**: Proper TypeScript interfaces prevent runtime errors

### Web Scraping & Session Management

- **Token Extraction Strategy**: Extract all required tokens from initial page, not during polling
- **Cookie Flow Management**: Use initial page cookies for first request, then cookies from each response for subsequent requests
- **Session State Tracking**: Maintain session state across multiple requests with proper cookie updates
- **Response Header Analysis**: Always extract and use Set-Cookie headers from responses
- **Multiple Cookie Handling**: Parse multiple Set-Cookie headers and merge them properly
- **Debug-First Approach**: Create comprehensive debug scripts to analyze real website behavior
- **Documentation-Driven Development**: Follow website documentation exactly for request/response patterns
- **Error Recovery**: Handle 419 "Page Expired" errors by ensuring proper token/cookie state
- **Request Headers**: Use consistent headers across all requests (User-Agent, Accept, etc.)
- **Rate Limiting**: Implement polite delays between polling requests (100ms intervals)

### Session Management Best Practices

```typescript
// Correct cookie flow implementation
let currentCookies = {};

// Initialize with cookies from initial page
if (initialPageCookie) {
  currentCookies.flightsfinder_session = initialPageCookie;
}

// For each polling request
for (let attempt = 0; attempt < maxAttempts; attempt++) {
  // Use current cookies for this request
  const response = await makeRequest(currentCookies);

  // Update cookies for next request with cookies from this response
  if (response.cookies) {
    currentCookies = { ...currentCookies, ...response.cookies };
  }
}
```

### Debugging in Convex Environments

When working with Convex, debugging can be challenging because the runtime environment has limitations on Node.js APIs and file system access. Here's how to handle debugging effectively:

#### Convex Environment Limitations

- **No File System Access**: Convex functions cannot write files directly
- **No Node.js APIs**: Many Node.js built-ins are not available in Convex
- **Limited Debugging Tools**: Traditional debugging methods may not work

#### Recommended Debugging Strategy

1. **Separate Debug Scripts**: Create standalone Node.js scripts outside of Convex for debugging

   ```typescript
   // debug-sky-scraper.js (standalone script)
   import { SkyScraper } from "./convex/crawler/skyScraper";

   async function debugSkyScraper() {
     const scraper = new SkyScraper();
     const result = await scraper.scrapeFlightData(searchParams);

     // Write debug files using Node.js fs
     const fs = require("fs");
     fs.writeFileSync("debug-output.json", JSON.stringify(result, null, 2));
   }
   ```

2. **Convex Actions for Node.js Operations**: Use Convex actions with "use node" directive for operations that require Node.js APIs

   ```typescript
   // convex/debugActions.ts
   "use node";

   import { action } from "./_generated/server";
   import { v } from "convex/values";
   import fs from "fs";

   export const saveDebugFile = action({
     args: { filename: v.string(), content: v.string() },
     returns: v.null(),
     handler: async (ctx, args) => {
       fs.writeFileSync(`debug/${args.filename}`, args.content);
       return null;
     },
   });
   ```

3. **Avoid Debug Code in Production**: Remove debug action calls from production code to avoid deployment issues

   ```typescript
   // ❌ Don't do this in production Convex functions
   await ctx.runAction(api.debugActions.saveDebugFile, {
     filename: "debug.html",
     content: html,
   });

   // ✅ Instead, use logging and external debug scripts
   autonomousDebugger.log("Debug info", "debug", { htmlLength: html.length });
   ```

4. **Use Logging for Runtime Debugging**: Leverage Convex's logging capabilities for runtime debugging
   ```typescript
   // Use autonomousDebugger for structured logging
   autonomousDebugger.log("Operation completed", "info", {
     operation: "scraping",
     result: "success",
     dataLength: data.length,
   });
   ```

#### Debugging Workflow

1. **Development Phase**: Use external debug scripts to analyze website behavior
2. **Testing Phase**: Use Convex actions for Node.js operations when needed
3. **Production Phase**: Remove debug action calls and rely on logging
4. **Troubleshooting**: Use external scripts to reproduce issues outside of Convex

#### Common Issues and Solutions

- **TypeScript Errors**: Debug action references may cause TypeScript errors - these can be safely ignored if debug functionality is removed
- **Deployment Failures**: Node.js API usage in Convex functions causes deployment failures - use actions with "use node" directive
- **File Writing**: Cannot write files directly from Convex functions - use external scripts or Convex actions
- **Context Issues**: `ctx` parameter may cause type issues - handle gracefully or remove debug calls

### Debugging Web Scrapers

- **HTML Analysis**: Save response HTML to debug files for analysis
- **Header Inspection**: Log and analyze all response headers
- **Token Validation**: Verify token extraction with multiple strategies
- **Cookie Tracking**: Track cookie changes across requests
- **Real Website Testing**: Always test against actual websites, not assumptions
- **Response Structure Analysis**: Understand the exact format of responses (7-part structure)
- **Error Pattern Recognition**: Identify common error patterns (419, missing tokens, etc.)

## Technical Implementation Details

### Database Schema

```typescript
// Core tables with proper indexing
flights: { uniqueId, flightNumber, fromId, toId, departure, arrival }
airports: { iataCode, name, city, timezone, ... }
bundles: { uniqueId, outboundFlightIds, inboundFlightIds }
bookingOptions: { uniqueId, targetId, agency, price, link, currency, extractedAt }
```

### Extended Bundle Data Structure

```typescript
// For frontend display (not stored in database)
ExtendedBundle: {
  flights: [{
    flightNumber: string,
    from: Airport,
    to: Airport,
    departure: number,
    arrival: number,
    airline: Airline
  }],
  bookingOptions: [{
    agency: string,
    price: number,
    link: string,
    currency: string
  }]
}
```

### Multi-Source Architecture

```typescript
// MultiSourceScraper handles parallel processing
MultiSourceScraper: {
  scrapeFromMultipleSources(): Promise<MultiSourceScrapingResponse>
  scrapeFromSource(): Promise<FlightData>
  mergeFlightData(): FlightData
}

// Source configuration
ScrapingSource: {
  id: "kiwi" | "sky"
  enabled: boolean
  name: string
  baseUrl: string
  config: SourceConfig
}
```

### Bulk Operations

- **bulkInsertFlights**: Handles flight insertion with ID mapping
- **bulkInsertBundles**: Processes bundles with flight ID resolution
- **bulkInsertBookingOptions**: Inserts booking options with bundle ID mapping
- **Individual bulk mutations**: Modular pipeline orchestration

### Data Flow

1. **Scraping**: Collect data in arrays with duplicate prevention
2. **Processing**: Map relationships using real Convex IDs
3. **Storage**: Bulk insert in correct order with proper error handling
4. **Frontend**: Query extended bundles for Timeline display

## Next Steps

### Immediate Priorities (Phase 6: Database Integration)

1. **Connect Scrapers to Database**:

   - Create mutations to store flight data from scrapers
   - Implement unique ID generation for flights, bundles, and booking options
   - Add data validation before storage

2. **Implement Data Deduplication**:

   - Use existing helper functions for unique ID generation
   - Prevent duplicate flights and bundles
   - Handle booking option updates

3. **Real-time Data Flow**:

   - Connect scraping results to database storage
   - Update UI to show real-time scraping progress
   - Implement proper error handling for database operations

4. **Test End-to-End Flow**:

   - Validate complete scraping → storage → display pipeline
   - Test with multiple sources and data types
   - Ensure data integrity and consistency

### Future Enhancements (Phase 7+)

1. **Advanced UI Features**: Source selector, progress tracking, real-time updates
2. **Caching System**: 7-day cache, validation, cleanup
3. **Data Quality**: Validation pipeline and confidence scoring
4. **Performance Optimization**: Memory management, network efficiency
5. **Timezone Handling**: Robust timezone conversion and display
6. **Price Intelligence**: Price tracking, alerts, and trend analysis

## Testing Strategy

### Current Testing Status

- **Unit Tests**: Need implementation for uniqueId generation and duplicate prevention
- **Integration Tests**: Need implementation for array collection and bulk insertion
- **End-to-End Tests**: Need implementation for complete scraping workflows
- **Performance Tests**: Need implementation for bulk operations

### Testing Priorities

1. **Schema Migration Tests**: Ensure data structure changes work correctly
2. **Real Website Testing**: Validate scrapers against actual websites
3. **Error Scenario Testing**: Test failure modes and recovery
4. **Performance Benchmarking**: Measure bulk operation efficiency
5. **UI Component Testing**: Test new frontend components and interactions
6. **Multi-Source Testing**: Test parallel processing and source isolation

## Performance Considerations

### Optimizations Implemented

- **Bulk Insertions**: Minimize database round trips
- **Efficient Duplicate Checking**: In-memory operations before database
- **Airport ID Caching**: Faster processing of airport lookups
- **Optimized ID Mapping**: Efficient lookup strategies
- **Parallel Processing**: Multi-source scraping for better performance

### Future Optimizations

- **Connection Pooling**: For external API calls
- **Database Indexing**: Optimize query performance
- **Memory Management**: Efficient handling of large datasets
- **Caching Strategy**: Reduce redundant API calls

## Documentation Status

### ✅ Complete

- **Implementation Plan**: Comprehensive plan with all phases
- **Schema Documentation**: Complete table and field documentation
- **Type Definitions**: Full TypeScript interface documentation
- **Mutation Documentation**: All bulk operations documented

### 📋 Pending

- **API Documentation**: Query and mutation usage examples
- **Frontend Integration Guide**: Component integration documentation
- **UI Component Documentation**: New component specifications
- **Deployment Guide**: Production deployment instructions
- **Troubleshooting Guide**: Common issues and solutions

### 2.5 Scraping Sources ✅

- **Kiwi.com**: Primary source for flight data
- **Sky**: Secondary source for validation
- **Additional Sources**: Expandable framework for more sources
