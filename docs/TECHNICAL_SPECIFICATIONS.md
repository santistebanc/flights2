# Technical Specifications

## System Architecture

### Multi-Source Scraping Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   User Interface │    │  MultiSourceScraper │    │   Database     │
│                 │    │                  │    │                 │
│ • Source Selector│◄──►│ • Parallel Execution│◄──►│ • Flights      │
│ • Progress Track │    │ • Progress Tracking│    │ • Bundles      │
│ • Results Display│    │ • Error Handling  │    │ • BookingOpts  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
            ┌───────▼──────┐    ┌───────▼──────┐
            │ Kiwi Scraper │    │Sky │
            │              │    │   Scraper    │
            │ • Single Req │    │ • Polling    │
            │ • Token Ext  │    │ • Session    │
            │ • HTML Parse │    │ • Multi-Req  │
            └──────────────┘    └──────────────┘
```

### Data Flow Architecture

#### Phase 1: Scraping & Collection

During scraping, data is collected in three separate arrays with duplicate prevention:

```typescript
interface ScrapingCollection {
  flights: FlightScraped[];
  bundles: BundleScraped[];
  bookingOptions: BookingOptionScraped[];
}
```

#### Phase 2: Duplicate Prevention Logic

- **Flights**: If flight with same uniqueId exists, ignore new one (keep existing)
- **Bundles**: If bundle with same uniqueId exists, ignore new one (keep existing)
- **BookingOptions**: If booking with same uniqueId exists, replace old one with new one

#### Phase 3: Database Storage

1. **Bulk Insert Flights**: Insert all flights and get real Convex IDs
2. **Map Bundle References**: Update bundles to use real flight IDs
3. **Bulk Insert Bundles**: Insert all bundles and get real Convex IDs
4. **Map Booking References**: Update bookingOptions to use real bundle IDs
5. **Bulk Insert BookingOptions**: Insert all booking options

## Source Implementations

### Kiwi.com Scraper

- **URL**: `https://flightsfinder.com/portal/kiwi`
- **Architecture**: Single request with token-based authentication
- **Process**:
  1. Fetch initial page for token/cookie extraction
  2. Make search API call with extracted credentials
  3. Parse pipe-delimited response
  4. Extract flight data from HTML response

### Sky Scraper

- **URL**: `https://www.flightsfinder.com/portal/sky`
- **Architecture**: Polling-based with session management
- **Process**:
  1. Fetch initial page for session data extraction
  2. Extract session tokens (\_token, session, suuid, deeplink)
  3. Poll for results with configurable intervals
  4. Parse responses until completion
  5. Extract flight data from final HTML

## Database Schema

### Core Entities

```typescript
// Flights
interface Flight {
  _id: Id<"flights">;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  airline: string;
  flightNumber: string;
  price: number;
  currency: string;
  source: string;
  createdAt: number;
}

// Bundles
interface Bundle {
  _id: Id<"bundles">;
  flights: Id<"flights">[];
  totalPrice: number;
  currency: string;
  source: string;
  createdAt: number;
}

// Booking Options
interface BookingOption {
  _id: Id<"bookingOptions">;
  bundleId: Id<"bundles">;
  provider: string;
  url: string;
  price: number;
  currency: string;
  createdAt: number;
}
```

### Indexes

- `flights.origin_destination_date` - Search optimization
- `flights.source_createdAt` - Source-specific queries
- `bundles.source_createdAt` - Bundle management
- `bookingOptions.bundleId` - Bundle relationship

## Caching System

### Cache Structure

```typescript
interface CacheEntry {
  key: string; // Search parameters hash
  data: any; // Cached results
  timestamp: number; // Creation time
  expiresAt: number; // Expiration time (7 days)
  source: string; // Source identifier
}
```

### Cache Operations

- **Check**: Validate cache before scraping
- **Store**: Save results with 7-day expiration
- **Update**: Refresh existing cache entries
- **Cleanup**: Remove expired entries

## Error Handling

### Error Categories

1. **NetworkError**: Connection failures, timeouts
2. **ParsingError**: HTML parsing failures
3. **ValidationError**: Data validation failures
4. **DatabaseError**: Storage operation failures
5. **RateLimitError**: Rate limiting and blocking

### Recovery Strategies

- **Retry Logic**: Exponential backoff for transient errors
- **Circuit Breaker**: Prevent cascading failures
- **Graceful Degradation**: Continue with available sources
- **Fallback Data**: Use cached or default data

## Performance Specifications

### Memory Usage

- **Estimated**: 1-15MB per scraping operation
- **Monitoring**: Real-time memory tracking
- **Optimization**: Stream processing for large datasets

### Network Performance

- **Rate Limiting**: 1 request per 5-10 seconds per source
- **Timeout**: 30 seconds per request
- **Retry**: 3 attempts with exponential backoff

### Database Performance

- **Batch Operations**: Process multiple records together
- **Indexing**: Optimized queries for common patterns
- **Connection Pooling**: Efficient database connections

## Security Specifications

### Input Validation

- **Parameter Validation**: All search parameters validated
- **Type Checking**: Strict TypeScript types
- **Sanitization**: HTML and URL sanitization

### Rate Limiting

- **Per-Source Limits**: Individual limits for each source
- **Global Limits**: Overall system rate limiting
- **Respectful Crawling**: Polite crawling practices

### Data Protection

- **Encryption**: Sensitive data encryption
- **Access Control**: Proper authentication and authorization
- **Audit Logging**: Track all data access and modifications

## Monitoring & Alerting

### Performance Metrics

- **Response Times**: Track scraping performance
- **Success Rates**: Monitor success/failure ratios
- **Error Rates**: Track error patterns and frequencies
- **Resource Usage**: Memory and CPU monitoring

### Alerting

- **Error Thresholds**: Alert on high error rates
- **Performance Degradation**: Alert on slow responses
- **Resource Exhaustion**: Alert on high resource usage
- **Data Quality**: Alert on data validation failures

## Configuration Management

### Source Configuration

```typescript
interface SourceConfig {
  id: string;
  name: string;
  baseUrl: string;
  enabled: boolean;
  rateLimit: number;
  timeout: number;
  retries: number;
  cabinClassMapping: Record<string, string>;
}
```

### Environment Configuration

- **Development**: Debug mode, verbose logging
- **Testing**: Mock data, isolated testing
- **Production**: Optimized performance, minimal logging

## Testing Specifications

### Test Categories

1. **Unit Tests**: Individual component testing
2. **Integration Tests**: Component interaction testing
3. **End-to-End Tests**: Full workflow testing
4. **Performance Tests**: Load and stress testing

### Test Data Management

- **Isolation**: Clear test data before each test
- **Realistic Data**: Use real website responses
- **Edge Cases**: Test boundary conditions
- **Error Scenarios**: Test error handling

### Test Environment

- **Convex Environment**: Test in actual Convex runtime
- **Real Websites**: Test against actual target websites
- **Mock Data**: Use realistic mock data for development
- **Debug Files**: Generate debug files for analysis

## Entity Types

### FlightScraped (Scraping Result)

```typescript
{
  uniqueId: string,        // Generated from: flightNumber + from + to + departure
  flightNumber: string,    // Airline flight number (e.g., "IB1234")
  fromId: string,          // Departure airport IATA code (will be converted to Convex ID)
  toId: string,            // Arrival airport IATA code (will be converted to Convex ID)
  departure: number,       // Unix timestamp (ms) of departure, timezone-adjusted
  arrival: number,         // Unix timestamp (ms) of arrival, timezone-adjusted
  airline?: string,        // Airline name (optional)
}
```

### BundleScraped (Scraping Result)

```typescript
{
  uniqueId: string,                    // Generated from: all outboundFlights + inboundFlights
  outboundFlightUniqueIds: string[],   // Array of flight uniqueIds for outbound
  inboundFlightUniqueIds: string[],    // Array of flight uniqueIds for inbound
}
```

**IMPORTANT: Bundle Index Requirements**

Bundles need a composite index that orders them by:

1. **fromId** (airport ID of first outbound flight departure)
2. **toId** (airport ID of last outbound flight arrival)
3. **outboundDate** (departure date of first outbound flight)
4. **inboundDate** (departure date of first inbound flight)
5. **price** (lowest bookingOption price for this bundle)

This index enables efficient filtering and sorting of bundles by route, dates, and price.

### BookingOptionScraped (Scraping Result)

```typescript
{
  uniqueId: string,        // Generated from: targetUniqueId + agency + price + currency
  targetBundleUniqueId: string,  // uniqueId of the bundle this booking belongs to
  agency: string,          // Agency name extracted from scraper
  price: number,           // Price as number (no currency denomination)
  link: string,            // Booking link URL
  currency: string,        // Currency denomination (e.g., "EUR", "USD")
  extractedAt: number,     // Unix timestamp (ms) when data was scraped
}
```

### Airport

```typescript
{
  iataCode: string,        // 3-letter IATA airport code
  icaoCode?: string,       // 4-letter ICAO airport code (optional)
  name: string,            // Full airport name
  city: string,            // City name
  country?: string,        // Country name (optional)
  timezone?: string,       // Timezone identifier (optional)
}
```

### Airline

```typescript
{
  iataCode?: string,       // 2-letter IATA airline code (optional)
  icaoCode?: string,       // 3-letter ICAO airline code (optional)
  name: string,            // Airline name
  country?: string,        // Country of registration (optional)
  scrapedAt: string,       // ISO timestamp when data was scraped
}
```

## Unique ID Generation

### Flight uniqueId

Generated by concatenating: `flightNumber + "_" + fromId + "_" + toId + "_" + departureTimestamp`

### Bundle uniqueId

Generated by concatenating: `"bundle_" + sorted(outboundFlightUniqueIds).join("_") + "_" + sorted(inboundFlightUniqueIds).join("_")`

### BookingOption uniqueId

Generated by concatenating: `targetBundleUniqueId + "_" + agency + "_" + price + "_" + currency`

## Data Processing Requirements

### Scraping Phase

1. Extract flight details from scraper
2. Generate uniqueIds for all entities
3. Apply duplicate prevention logic:
   - **Flights**: Keep existing, ignore duplicates
   - **Bundles**: Keep existing, ignore duplicates
   - **BookingOptions**: Replace existing with new ones
4. Collect in arrays for bulk processing

### Processing Phase

1. **Airport Resolution**: Convert IATA codes to Convex airport IDs
2. **Flight Processing**: Adjust times using airport timezone data
3. **ID Mapping**: Map uniqueIds to Convex IDs after insertion

### Storage Phase

1. **Bulk Insert Flights**: Insert all flights, return ID mapping
2. **Update Bundle References**: Replace uniqueIds with Convex IDs
3. **Bulk Insert Bundles**: Insert all bundles, return ID mapping
4. **Update Booking References**: Replace bundle uniqueIds with Convex IDs
5. **Bulk Insert BookingOptions**: Insert all booking options

## Bulk Insertion Mutations

### bulkInsertFlights

```typescript
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
```

### bulkInsertBundles

```typescript
args: {
  bundles: Array<{
    uniqueId: string;
    outboundFlights: Id<"flights">[];
    inboundFlights: Id<"flights">[];
  }>;
}
returns: Record<string, Id<"bundles">>; // uniqueId -> Convex ID mapping
```

### bulkInsertBookingOptions

```typescript
args: {
  bookingOptions: Array<{
    uniqueId: string;
    targetId: Id<"bundles">;
    agency: string;
    price: number;
    link: string;
    currency: string;
    extractedAt: number;
  }>;
}
returns: Id < "bookingOptions" > []; // Array of inserted IDs
```

## Timezone Handling

- All flight times must be adjusted to the appropriate airport timezone
- Use timezone data from `airports` table
- Store as Unix timestamps for consistent comparison
- Handle daylight saving time transitions appropriately
