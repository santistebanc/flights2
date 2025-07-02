# Phase Implementation Plan

## Phase 4: Token & Cookie Extraction (Current Priority)

### 4.1 Fix Current TypeScript Errors
**Status**: 🔧 In Progress
**Files**: `convex/crawler/kiwiScraper.ts`, `convex/crawler/helpers/kiwiDataExtractor.ts`

**Tasks**:
- [ ] Fix import path for `KiwiDataExtractor`
- [ ] Remove `id` fields from data extractors (use Convex `_id` instead)
- [ ] Fix schema validation errors

### 4.2 Implement Token Extraction Utilities
**Status**: ❌ Not Started
**Files**: `convex/crawler/helpers/tokenExtractor.ts`

**Tasks**:
- [ ] Create `TokenExtractor` utility class
- [ ] Implement script tag parsing for `_token` extraction
- [ ] Add support for multiple token extraction (Sky portal)
- [ ] Handle different token formats and locations

**Implementation**:
```typescript
class TokenExtractor {
  static extractKiwiToken(html: string): string | null
  static extractSkyTokens(html: string): {
    _token: string;
    session: string;
    suuid: string;
    deeplink: string;
  } | null
}
```

### 4.3 Implement Cookie Extraction
**Status**: ❌ Not Started
**Files**: `convex/crawler/helpers/cookieManager.ts`

**Tasks**:
- [ ] Create `CookieManager` utility class
- [ ] Extract `flightsfinder_session` cookie from response headers
- [ ] Handle cookie persistence across requests
- [ ] Add cookie validation

**Implementation**:
```typescript
class CookieManager {
  static extractSessionCookie(response: Response): string | null
  static validateCookie(cookie: string): boolean
  static formatCookieHeader(cookie: string): string
}
```

### 4.4 Test Token & Cookie Extraction
**Status**: ❌ Not Started
**Files**: `scripts/test-token-extraction.ts`

**Tasks**:
- [ ] Test Kiwi token extraction with real page
- [ ] Test Sky multiple token extraction
- [ ] Test cookie extraction and validation
- [ ] Test error scenarios

## Phase 5: Search API Integration

### 5.1 Fix URL Generation (Kiwi Portal)
**Status**: ✅ Partially Complete
**Files**: `convex/crawler/kiwiScraper.ts`

**Tasks**:
- [x] Fix date encoding (DD/MM/YYYY with URL encoding)
- [x] Add `type=return` parameter
- [x] Fix parameter order
- [ ] Test with real endpoints

### 5.2 Implement Kiwi Two-Phase Scraping
**Status**: ❌ Not Started
**Files**: `convex/crawler/kiwiScraper.ts`

**Tasks**:
- [ ] Implement Phase 1: Initial page fetch
- [ ] Extract token and cookie from Phase 1 response
- [ ] Implement Phase 2: Search request with proper headers
- [ ] Add 7-part response parsing
- [ ] Handle search request errors

**Implementation**:
```typescript
class KiwiScraper {
  async scrape(searchParams: ScrapingRequest): Promise<ScrapingResult> {
    // Phase 1: Get initial page
    const { token, cookie } = await this.getInitialPage(searchParams);
    
    // Phase 2: Make search request
    const searchResponse = await this.makeSearchRequest(searchParams, token, cookie);
    
    // Parse 7-part response
    const parts = searchResponse.split('|');
    const html = parts[6]; // Part 7 (0-indexed)
    
    // Extract data
    return this.extractData(html);
  }
}
```

### 5.3 Create Sky Portal Scraper
**Status**: ❌ Not Started
**Files**: `convex/crawler/skyScraper.ts`

**Tasks**:
- [ ] Create `SkyScraper` class
- [ ] Implement correct URL format (YYYY-MM-DD dates)
- [ ] Implement Phase 1: Initial page fetch
- [ ] Extract multiple tokens from script tags
- [ ] Implement polling mechanism
- [ ] Handle polling control logic (Y/N responses)

**Implementation**:
```typescript
class SkyScraper {
  async scrape(searchParams: ScrapingRequest): Promise<ScrapingResult> {
    // Phase 1: Get initial page
    const { tokens, cookie } = await this.getInitialPage(searchParams);
    
    // Phase 2: Polling requests
    let allResults = '';
    let isComplete = false;
    
    while (!isComplete) {
      const response = await this.makePollRequest(searchParams, tokens, cookie);
      const parts = response.split('|');
      
      isComplete = parts[0] === 'Y';
      allResults += parts[6]; // Part 7 (0-indexed)
      
      if (!isComplete) {
        await this.delay(100); // 100ms polling interval
      }
    }
    
    return this.extractData(allResults);
  }
  
  private async makePollRequest(searchParams: ScrapingRequest, tokens: SkyTokens, cookie: string): Promise<string> {
    const timestamp = Date.now(); // Current timestamp for 'noc' parameter
    const body = `_token=${tokens._token}&session=${tokens.session}&suuid=${tokens.suuid}&noc=${timestamp}&deeplink=${tokens.deeplink}&s=www&adults=${searchParams.adults}&children=${searchParams.children}&infants=${searchParams.infants}&currency=${searchParams.currency}`;
    
    // Make POST request with proper headers and body
    return await this.makeRequest('/portal/sky/poll', body, cookie);
  }
}
```

### 5.4 Implement Response Parsing Utilities
**Status**: ❌ Not Started
**Files**: `convex/crawler/helpers/responseParser.ts`

**Tasks**:
- [ ] Create `ResponseParser` utility class
- [ ] Implement 7-part response splitting
- [ ] Add HTML extraction from Part 7
- [ ] Handle malformed responses
- [ ] Add response validation

**Implementation**:
```typescript
class ResponseParser {
  static parseSevenPartResponse(response: string): {
    status: string;
    resultCount: number;
    html: string;
    metadata: string[];
  }
  
  static validateResponse(response: string): boolean
  static extractHtmlFromPart7(response: string): string
}
```

### 5.5 Test Search API Integration
**Status**: ❌ Not Started
**Files**: `scripts/test-search-api.ts`

**Tasks**:
- [ ] Test Kiwi two-phase scraping
- [ ] Test Sky polling mechanism
- [ ] Test response parsing
- [ ] Test error handling
- [ ] Validate extracted data

## Phase 6: Data Extraction

### 6.1 Fix KiwiDataExtractor
**Status**: ✅ Partially Complete
**Files**: `convex/crawler/helpers/kiwiDataExtractor.ts`

**Tasks**:
- [x] Remove `id` fields (use Convex `_id`)
- [ ] Test with real HTML responses
- [ ] Add error handling for missing data
- [ ] Optimize parsing performance

### 6.2 Create SkyDataExtractor
**Status**: ❌ Not Started
**Files**: `convex/crawler/helpers/skyDataExtractor.ts`

**Tasks**:
- [ ] Create `SkyDataExtractor` class
- [ ] Analyze Sky HTML structure
- [ ] Implement flight data extraction
- [ ] Implement bundle data extraction
- [ ] Implement booking option extraction
- [ ] Handle Sky-specific data formats

**Implementation**:
```typescript
class SkyDataExtractor {
  extractFlights(html: string): Flight[]
  extractBundles(html: string): Bundle[]
  extractBookingOptions(html: string): BookingOption[]
  
  // Sky-specific methods
  private extractFlightNumbers(element: HTMLElement): string[]
  private extractSkySpecificData(element: HTMLElement): any
}
```

### 6.3 Test Data Extraction
**Status**: ❌ Not Started
**Files**: `scripts/test-data-extraction.ts`

**Tasks**:
- [ ] Test Kiwi data extraction with real responses
- [ ] Test Sky data extraction with real responses
- [ ] Validate extracted data against schema
- [ ] Test error scenarios
- [ ] Performance testing

### 6.4 Database Storage Integration
**Status**: ✅ Partially Complete
**Files**: `convex/crawler/helpers/databaseManager.ts`

**Tasks**:
- [x] Basic database storage methods
- [ ] Add deduplication logic
- [ ] Add batch insertion for performance
- [ ] Add transaction support
- [ ] Add data validation before storage

## Phase 7: Multi-Source Integration

### 7.1 Update MultiSourceScraper
**Status**: ❌ Not Started
**Files**: `convex/crawler/multiSourceScraper.ts`

**Tasks**:
- [ ] Integrate updated Kiwi scraper
- [ ] Integrate new Sky scraper
- [ ] Implement parallel processing
- [ ] Add progress tracking
- [ ] Add error handling and recovery

### 7.2 Implement Progress Tracking
**Status**: ❌ Not Started
**Files**: `convex/crawler/helpers/progressTracker.ts`

**Tasks**:
- [ ] Create progress tracking system
- [ ] Track individual source progress
- [ ] Track overall scraping progress
- [ ] Add progress persistence
- [ ] Add progress notifications

### 7.3 Add Caching System
**Status**: ❌ Not Started
**Files**: `convex/crawler/helpers/cacheManager.ts`

**Tasks**:
- [ ] Implement 7-day cache for search parameters
- [ ] Add cache invalidation
- [ ] Add cache size management
- [ ] Add cache statistics

## Phase 8: Testing & Validation

### 8.1 Comprehensive Testing
**Status**: ❌ Not Started
**Files**: `scripts/test-complete-workflow.ts`

**Tasks**:
- [ ] End-to-end testing for both portals
- [ ] Performance testing
- [ ] Error scenario testing
- [ ] Load testing
- [ ] Data validation testing

### 8.2 Production Readiness
**Status**: ❌ Not Started

**Tasks**:
- [ ] Add comprehensive logging
- [ ] Add monitoring and alerting
- [ ] Add rate limiting
- [ ] Add security measures
- [ ] Add deployment configuration

## Implementation Timeline

### Week 1: Phase 4 Completion
- Fix TypeScript errors
- Implement token extraction
- Implement cookie handling
- Test with real endpoints

### Week 2: Phase 5 Completion
- Complete Kiwi two-phase scraping
- Create Sky scraper
- Implement response parsing
- Test search API integration

### Week 3: Phase 6 Completion
- Fix and test Kiwi data extraction
- Create and test Sky data extraction
- Complete database integration
- Performance optimization

### Week 4: Phase 7-8 Completion
- Multi-source integration
- Progress tracking
- Comprehensive testing
- Production readiness

## Success Criteria

### Phase 4 Success
- [ ] All TypeScript errors resolved
- [ ] Token extraction works for both portals
- [ ] Cookie handling works correctly
- [ ] Tests pass with real endpoints

### Phase 5 Success
- [ ] Kiwi two-phase scraping works end-to-end
- [ ] Sky polling mechanism works correctly
- [ ] Response parsing handles all scenarios
- [ ] Search API integration tested and validated

### Phase 6 Success
- [ ] Data extraction works for both portals
- [ ] Extracted data matches schema
- [ ] Database storage works correctly
- [ ] Performance meets requirements

### Overall Success
- [ ] Both portals can be scraped successfully
- [ ] Data is extracted and stored correctly
- [ ] System handles errors gracefully
- [ ] Performance is acceptable for production use 