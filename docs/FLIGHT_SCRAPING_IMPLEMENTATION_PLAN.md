# Flight Scraping Implementation Plan

## Development Guidelines

### Debugging in Convex Environments

When working with Convex, debugging can be challenging due to runtime environment limitations. Follow these guidelines for effective debugging:

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

## Phase 1: Core Infrastructure ✅

### 1.1 Database Schema Design ✅

- **Flights Table**: Store flight data with uniqueId, flightNumber, fromId/toId (airport references), departure/arrival timestamps
- **Airports Table**: Store airport data with IATA codes, timezone info for time adjustments
- **Bundles Table**: Store flight bundles using Convex flight IDs for outbound/inbound flights
- **BookingOptions Table**: Store booking options with targetId (bundle reference), price as number, extractedAt timestamp
- **Airlines Table**: Store airline information

### 1.2 Unique ID Generation Strategy ✅

- **Flight uniqueId**: `flightNumber + "_" + fromIataCode + "_" + toIataCode + "_" + departureTimestamp`
- **Bundle uniqueId**: `"bundle_" + sorted(outboundFlightUniqueIds).join("_") + "_" + sorted(inboundFlightUniqueIds).join("_")`
- **BookingOption uniqueId**: `targetBundleUniqueId + "_" + agency + "_" + price + "_" + currency`

### 1.3 Data Flow Architecture ✅

- **Scraping Phase**: Collect data in arrays with duplicate prevention
- **Processing Phase**: Map relationships using real Convex IDs
- **Storage Phase**: Bulk insert in correct order (flights → bundles → bookingOptions)

## Phase 2: Scraping Infrastructure ✅

### 2.1 Multi-Source Scraper Framework ✅

- **Modular Design**: Separate scrapers for different sources (Kiwi, Sky, etc.)
- **Common Interface**: Standardized data extraction methods
- **Error Handling**: Graceful degradation and retry logic
- **Rate Limiting**: Polite crawling with configurable delays

### 2.2 Data Collection Strategy ✅

```typescript
interface ScrapingCollection {
  flights: FlightScraped[];
  bundles: BundleScraped[];
  bookingOptions: BookingOptionScraped[];
}
```

### 2.3 Duplicate Prevention Logic ✅

- **Flights**: If flight with same uniqueId exists, ignore new one (keep existing)
- **Bundles**: If bundle with same uniqueId exists, ignore new one (keep existing)
- **BookingOptions**: If booking with same uniqueId exists, replace old one with new one

### 2.4 Data Extraction Components ✅

- **Flight Extractor**: Extract flight numbers, routes, times
- **Airport Resolver**: Convert IATA codes to Convex airport IDs
- **Bundle Builder**: Group related flights into bundles
- **Booking Extractor**: Extract pricing and booking information
- **Timezone Handler**: Adjust times based on airport timezones

### 2.5 Scraping Sources ✅

- **Kiwi.com**: Primary source for flight data
- **Sky**: Secondary source for validation
- **Additional Sources**: Expandable framework for more sources

## Phase 3: Data Processing & Storage ✅

### 3.1 Scraping Phase ✅

```typescript
interface FlightScraped {
  uniqueId: string;
  flightNumber: string;
  fromId: string; // Departure airport IATA code (will be converted to Convex ID)
  toId: string; // Arrival airport IATA code (will be converted to Convex ID)
  departure: number; // Unix timestamp
  arrival: number; // Unix timestamp
  airline?: string;
}

interface BundleScraped {
  uniqueId: string;
  outboundFlightUniqueIds: string[];
  inboundFlightUniqueIds: string[];
}

// IMPORTANT: Bundle Index Requirements
// Bundles need a composite index that orders them by:
// 1. fromId (airport ID of first outbound flight departure)
// 2. toId (airport ID of last outbound flight arrival)
// 3. outboundDate (departure date of first outbound flight)
// 4. inboundDate (departure date of first inbound flight)
// 5. price (lowest bookingOption price for this bundle)

interface BookingOptionScraped {
  uniqueId: string;
  targetBundleUniqueId: string;
  agency: string;
  price: number;
  link: string;
  currency: string;
  extractedAt: number;
}
```

### 3.2 Processing Phase ✅

1. **Airport Resolution**: Convert IATA codes to Convex airport IDs
2. **Flight Processing**: Adjust times using airport timezone data
3. **ID Mapping**: Map uniqueIds to Convex IDs after insertion

### 3.3 Storage Phase ✅

1. **Bulk Insert Flights**: Insert all flights, return ID mapping
2. **Update Bundle References**: Replace uniqueIds with Convex IDs
3. **Bulk Insert Bundles**: Insert all bundles, return ID mapping
4. **Update Booking References**: Replace bundle uniqueIds with Convex IDs
5. **Bulk Insert BookingOptions**: Insert all booking options

### 3.4 Bulk Insertion Mutations ✅

```typescript
// bulkInsertFlights
args: {
  flights: Array<{
    uniqueId: string;
    flightNumber: string;
    fromId: Id<"airports">;
    toId: Id<"airports">;
    departure: number;
    arrival: number;
  }>;
}
returns: Record<string, Id<"flights">>; // uniqueId -> Convex ID mapping

// bulkInsertBundles
args: {
  bundles: Array<{
    uniqueId: string;
    outboundFlightUniqueIds: string[];
    inboundFlightUniqueIds: string[];
  }>;
}
returns: Record<string, Id<"bundles">>; // uniqueId -> Convex ID mapping

// bulkInsertBookingOptions
args: {
  bookingOptions: Array<{
    uniqueId: string;
    targetUniqueId: string;
    agency: string;
    price: number;
    link: string;
    currency: string;
    extractedAt: number;
  }>;
}
returns: Id < "bookingOptions" > []; // Array of inserted IDs

// Individual bulk mutations provide modular pipeline orchestration
```

## Phase 4: API & Frontend Integration

### 4.1 Sticky Header UI Implementation

- **Top Row Layout**: Airport inputs, date range picker, search button, settings button
  - Airport autocomplete inputs (existing implementation)
  - Date range picker with auto-filtering (no update button required)
  - Search button that triggers scraping and applies filters
  - Settings button with gear icon for source selection
- **Bottom Row Layout**: Results count and scraping progress indicators
  - Results count display on the left
  - Multi-source progress indicators on the right
- **Settings Popup**: Source selection (Kiwi, Sky) with toggle controls
  - Popup triggered by settings button
  - Toggle switches for each source
  - Save/cancel functionality

### 4.2 Main Content Area & Timeline

- **Full-Height Timeline**: Vertical scrolling at window level (not in child divs)
- **Extended Bundle Data Structure**: Query bundles with flight and booking details

```typescript
interface ExtendedBundle {
  flights: [
    {
      flightNumber: string;
      from: Airport;
      to: Airport;
      departure: number;
      arrival: number;
      airline: Airline;
    },
  ];
  bookingOptions: [
    {
      agency: string;
      price: number;
      link: string;
      currency: string;
    },
  ];
}
```

- **Timeline Component Updates**: Adapt to new data structure while maintaining UI
- **Responsive Design**: Maintain existing theme and styling

### 4.3 Query Optimization & Performance

- **Bundle Queries**: Optimize queries for extended bundle data
  - Join flights, airports, airlines, and booking options
  - Efficient filtering by search criteria
  - Performance optimization for large datasets
- **Index Strategy**: Optimize indexes for common query patterns
  - `by_uniqueId` indexes for fast lookups
  - `by_targetUniqueId` for booking option queries
  - Search indexes on airport fields for autocomplete
- **Query Caching**: Implement intelligent caching for frequently accessed data
- **Pagination**: Add proper pagination for large result sets
- **Performance Monitoring**: Add query performance tracking

### 4.4 Real-time Updates & Subscriptions

- **Scraping Progress**: Real-time updates for scraping source progress
- **Subscription Management**: Implement efficient subscription-based updates
- **Change Detection**: Track data changes and notify relevant clients
- **Optimistic Updates**: Implement optimistic UI updates for better UX
- **Connection Management**: Handle connection drops and reconnections gracefully

### 4.5 Frontend Integration & UX

- **Auto-Filtering**: Date picker updates filters automatically (not applied until search)
- **Search Integration**: Search button triggers scraping and applies filters
- **Progress Indicators**: Real-time scraping progress display
- **Data Structure Compatibility**: Ensure frontend components work with new data structure
- **Timezone Display**: Implement proper timezone handling and display
- **Price Formatting**: Add comprehensive price formatting and currency handling
- **Loading States**: Implement proper loading states for bulk operations
- **Error Handling**: Add user-friendly error messages and recovery options

### 4.6 Data Quality & Validation

- **Input Validation**: Add comprehensive validation for all user inputs
- **Data Sanitization**: Sanitize and validate scraped data before storage
- **Confidence Scoring**: Implement confidence scores for scraped data
- **Data Freshness**: Track and display data freshness indicators

## Phase 5: Advanced Features

### 5.1 Timezone Handling

- **Airport Timezone Data**: Ensure all airports have proper timezone information
- **Time Adjustment Logic**: Implement robust timezone conversion
- **Daylight Saving Time**: Handle DST transitions properly
- **User Timezone Display**: Show times in user's local timezone

### 5.2 Price Analysis & Intelligence

- **Price History Tracking**: Track price changes over time
- **Price Alerts**: Implement price drop notifications
- **Trend Analysis**: Analyze price trends and patterns
- **Price Prediction**: Basic price prediction based on historical data

### 5.3 Data Quality & Reliability

- **Validation Pipeline**: Comprehensive data validation
- **Confidence Metrics**: Score data quality and reliability
- **Source Attribution**: Track data sources for transparency
- **Error Recovery**: Implement automatic error recovery mechanisms

## Key Learnings & Best Practices

### Schema Design & Migration

- **Always test schema changes with existing data** before deployment
- **Use migration scripts** for field name changes or data structure updates
- **Consider backward compatibility** when evolving schemas
- **Clear separation** between business uniqueIds and database Convex IDs

### Type Safety & Development

- **Explicit type annotations** are crucial in Convex functions
- **Handle circular references** with proper type annotations
- **Import management** - always import `internal` from generated API
- **Type inference limitations** - add explicit types for complex objects

### Performance & Scalability

- **Bulk operations** are significantly more efficient than individual inserts
- **Array-based collection** during scraping improves performance
- **Duplicate prevention** should be handled in memory before database operations
- **ID mapping** is essential for maintaining relationships between entities

### Error Handling & Resilience

- **Graceful degradation** prevents entire pipeline failures
- **Missing data handling** (e.g., airports not found) should be planned
- **Comprehensive logging** is essential for debugging and monitoring
- **Retry logic** should be implemented for transient failures

### Data Flow Architecture

- **Three-phase approach** (Scraping → Processing → Storage) provides clear separation
- **Different duplicate strategies** for different entity types
- **Ordered insertion** (flights → bundles → bookingOptions) maintains referential integrity
- **Batch processing** improves overall system performance

## Implementation Notes

### Critical Requirements

1. **Array-Based Collection**: Collect all data in arrays before database insertion
2. **Duplicate Prevention**: Implement different strategies for each entity type
3. **ID Mapping**: Properly map uniqueIds to Convex IDs after insertion
4. **Bulk Operations**: Use bulk insertions for performance
5. **Ordered Insertion**: Insert flights → bundles → bookingOptions in sequence
6. **Type Safety**: Maintain strict TypeScript typing throughout
7. **Error Resilience**: Handle failures gracefully at each step

### Technical Implementation Details

- **Schema Validation**: Always test schema changes with existing data before deployment
- **Type Annotations**: Use explicit types in Convex functions to avoid inference issues
- **Import Management**: Import `internal` from generated API for internal function calls
- **Circular References**: Handle with proper type annotations on return values
- **Bulk Insert Performance**: Significantly faster than individual inserts
- **Memory-Based Duplicates**: Check duplicates in memory before database operations

### Common Pitfalls & Solutions

```typescript
// ❌ Problematic - circular reference
import { api } from "./_generated/api";

// ✅ Solution - use internal import
import { internal } from "./_generated/api";

// ❌ Problematic - type inference issues
const result = await ctx.db.insert("flights", flightData);

// ✅ Solution - explicit typing
const result: Id<"flights"> = await ctx.db.insert("flights", flightData);
```

### Testing Strategy

- **Unit tests** for uniqueId generation and duplicate prevention
- **Integration tests** for array collection and bulk insertion
- **End-to-end tests** for complete scraping workflows
- **Performance tests** for bulk operations
- **Schema migration tests** for data structure changes
- **Real website testing** for scrapers

### Performance Considerations

- **Bulk insertions** minimize database round trips
- **Efficient duplicate checking** in memory before database operations
- **Airport ID caching** for faster processing
- **Optimized ID mapping** lookups
- **Connection pooling** for external API calls
- **Memory management** for large datasets

### Error Handling Patterns

```typescript
// ✅ Good error handling with graceful degradation
try {
  const airport = await ctx.db
    .query("airports")
    .withIndex("by_iataCode", (q) => q.eq("iataCode", iataCode))
    .first();

  if (!airport) {
    console.warn(`Airport not found: ${iataCode}`);
    return null; // Graceful degradation
  }

  return airport._id;
} catch (error) {
  console.error(`Error finding airport ${iataCode}:`, error);
  return null;
}
```
