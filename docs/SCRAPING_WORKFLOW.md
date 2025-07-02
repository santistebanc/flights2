# Flight Scraping Workflow Documentation

## Overview

This document describes the complete scraping workflow for both Kiwi and Sky portals on FlightsFinder.com. Both workflows follow a two-phase approach: initial page fetch to extract tokens/cookies, followed by search/polling requests to get flight data.

## Kiwi Portal Scraping Workflow

### Phase 1: Initial Page Fetch

**Endpoint**: `https://www.flightsfinder.com/portal/kiwi`

**URL Format**:

```
https://www.flightsfinder.com/portal/kiwi?type=return&currency=EUR&cabinclass=M&originplace=BER&destinationplace=MAD&outbounddate=10%2F10%2F2025&inbounddate=20%2F10%2F2025&adults=1&children=0&infants=0
```

**Parameters**:

- `type`: Always "return" for round-trip flights
- `currency`: Currency code (e.g., "EUR", "USD")
- `cabinclass`: Cabin class mapping:
  - Economy → "M"
  - PremiumEconomy → "W"
  - First → "F"
  - Business → "C"
- `originplace`: Origin airport code
- `destinationplace`: Destination airport code
- `outbounddate`: URL-encoded date in DD/MM/YYYY format (e.g., "10%2F10%2F2025")
- `inbounddate`: URL-encoded date in DD/MM/YYYY format
- `adults`: Number of adult passengers
- `children`: Number of child passengers
- `infants`: Number of infant passengers

**Date Encoding**: Convert YYYY-MM-DD to DD/MM/YYYY and URL-encode forward slashes as %2F

### Phase 1 Response Processing

1. **Extract Cookie**: Capture the `flightsfinder_session` cookie from the response headers
2. **Extract Token**: Parse the HTML response and find the script tag containing:
   ```javascript
   data: {
       '_token': 'fY5odfvNSCqcctnHPQ42Jq4MqSDe98J8YrE09NaS',
       ...
   }
   ```

### Phase 2: Search Request

**Endpoint**: `https://www.flightsfinder.com/portal/kiwi/search`

**Method**: POST

**Headers**:

```
accept: */*
accept-language: en-GB,en;q=0.5
content-type: application/x-www-form-urlencoded; charset=UTF-8
origin: https://www.flightsfinder.com
priority: u=1, i
referer: [original URL from Phase 1]
sec-ch-ua: "Not)A;Brand";v="8", "Chromium";v="138", "Brave";v="138"
sec-ch-ua-mobile: ?0
sec-ch-ua-platform: "Windows"
sec-fetch-dest: empty
sec-fetch-mode: cors
sec-fetch-site: same-origin
sec-gpc: 1
user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36
x-requested-with: XMLHttpRequest
```

**Cookie**: Use the `flightsfinder_session` cookie from Phase 1

**Body** (form-encoded):

```
_token=[extracted_token]&originplace=BER&destinationplace=MAD&outbounddate=10%2F10%2F2025&inbounddate=20%2F10%2F2025&cabinclass=M&adults=1&children=0&infants=0&currency=EUR&type=return&bags-cabin=0&bags-checked=0
```

### Phase 2 Response Processing

The response is a string split by '|' into 7 parts:

- Part 1: Status indicator
- Part 2: Number of results
- Part 3-6: Additional metadata
- Part 7: HTML content containing flight results

**Data Extraction**: Parse Part 7 (HTML) to extract flight data using the existing KiwiDataExtractor

## Sky Portal Scraping Workflow

### Phase 1: Initial Page Fetch

**Endpoint**: `https://www.flightsfinder.com/portal/sky`

**URL Format**:

```
https://www.flightsfinder.com/portal/sky?originplace=SLP&destinationplace=BER&outbounddate=2025-10-10&inbounddate=2025-10-20&cabinclass=Economy&adults=1&children=0&infants=0&currency=EUR
```

**Key Differences from Kiwi**:

- No `type` parameter required
- `cabinclass` uses full names: "Economy", "PremiumEconomy", "First", "Business"
- `outbounddate` and `inbounddate` use YYYY-MM-DD format (no URL encoding needed)

### Phase 1 Response Processing

1. **Extract Cookie**: Capture the `flightsfinder_session` cookie
2. **Extract Multiple Tokens**: Parse script tag for:
   - `_token`
   - `session`
   - `suuid`
   - `deeplink`

### Phase 2: Polling Requests

**Endpoint**: `https://www.flightsfinder.com/portal/sky/poll`

**Method**: POST

**Headers**: Same as Kiwi search request

**Cookie**: Use the `flightsfinder_session` cookie from Phase 1

**Body** (form-encoded):

```
_token=[extracted_token]&session=[extracted_session]&suuid=[extracted_suuid]&noc=[current_timestamp]&deeplink=[extracted_deeplink]&s=www&adults=1&children=0&infants=0&currency=EUR
```

**Note**: The `noc` parameter should be the current timestamp when making the request (e.g., `1751392409446`).

**Polling Logic**:

1. Send initial poll request
2. Parse response (7 parts split by '|')
3. Check Part 1:
   - If "N": More results available, poll again after 100ms delay
   - If "Y": All results received, stop polling
4. Part 2: Total expected results count
5. Part 7: HTML content with flight results

**Polling Interval**: 100ms between requests (configurable)

### Response Processing

Same 7-part structure as Kiwi, but with polling control logic.

## Data Extraction and Storage

### HTML Parsing

Both portals return HTML in Part 7 of the response that needs to be parsed for:

- Flight numbers
- Airlines
- Departure/arrival times
- Prices
- Booking options
- Bundle information

### Database Storage

Use existing data extractors:

- `KiwiDataExtractor` for Kiwi portal
- `SkyDataExtractor` for Sky portal (to be implemented)

Store data in the same database tables:

- `flights`
- `bundles`
- `bookingOptions`

### Error Handling

- Network timeouts
- Invalid tokens/cookies
- Malformed responses
- Rate limiting
- Missing data in HTML

## Implementation Requirements

### Kiwi Scraper Updates Needed

1. Fix URL generation with correct date encoding
2. Implement token extraction from script tags
3. Add proper cookie handling
4. Update search request with correct headers and body format
5. Parse 7-part response structure

### Sky Scraper Implementation Needed

1. Create `SkyScraper` class
2. Implement initial page fetch with correct URL format
3. Extract multiple tokens from script tags
4. Implement polling mechanism with 100ms intervals
5. Create `SkyDataExtractor` for HTML parsing
6. Handle polling control logic (Y/N responses)

### Common Infrastructure

1. Cookie management system
2. Token extraction utilities
3. Response parsing utilities (7-part split)
4. Rate limiting and retry logic
5. Error handling and logging

## Implementation Learnings & Best Practices

### Critical Session Management Insights

#### Token Extraction Strategy

- **ALWAYS extract tokens from the initial page** - never assume tokens will be generated during polling
- **Validate all required tokens** before proceeding to polling phase
- **Use multiple extraction strategies** - JavaScript variables, form fields, meta tags
- **Handle loading pages correctly** - even loading pages should contain tokens

#### Cookie Flow Management

- **Initial page cookie** → Use for first polling request only
- **Each polling response** → Extract cookies and use for next polling request
- **Never reuse initial cookies** for subsequent polling requests
- **Merge cookies properly** - combine new cookies with existing ones

#### Debug-First Development Approach

```javascript
// Always create debug scripts to understand real website behavior
const debugScript = async () => {
  // Step 1: Fetch initial page and save HTML
  const initialResponse = await fetch(initialUrl);
  const initialHtml = await initialResponse.text();
  fs.writeFileSync("debug_initial.html", initialHtml);

  // Step 2: Extract and log tokens/cookies
  console.log("Tokens found:", extractTokens(initialHtml));
  console.log("Cookies found:", extractCookies(initialResponse.headers));

  // Step 3: Test polling with proper cookie flow
  // ... implement step-by-step polling with cookie tracking
};
```

### Common Pitfalls & Solutions

#### 419 "Page Expired" Errors

- **Cause**: Missing or invalid CSRF tokens, expired session cookies
- **Solution**: Ensure tokens are extracted from initial page, not generated during polling
- **Prevention**: Validate token presence before starting polling

#### Missing Tokens in Loading Pages

- **Cause**: Assuming loading pages don't contain tokens
- **Solution**: Always attempt token extraction regardless of page type
- **Prevention**: Use comprehensive token extraction strategies

#### Cookie Management Issues

- **Cause**: Not updating cookies between polling requests
- **Solution**: Extract cookies from each response and use for next request
- **Prevention**: Implement proper cookie flow tracking

#### Response Structure Misunderstanding

- **Cause**: Not understanding the 7-part response format
- **Solution**: Parse responses correctly: `status|count|metadata|html`
- **Prevention**: Study website documentation and response patterns

### Testing Strategy

1. Test URL generation for both portals
2. Test token/cookie extraction
3. Test search/polling requests
4. Test HTML parsing with real responses
5. Test database storage
6. Test error scenarios and recovery
