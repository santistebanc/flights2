# Flight Scraping Logic & Session Management

## Overview

This document defines the **exact** scraping logic and session management requirements for the Kiwi and Sky scrapers. These requirements are **MANDATORY** and must be followed precisely to ensure successful scraping.

## Kiwi Scraper Flow (STRICT REQUIREMENTS)

### 1. Initial Page Request

- **URL**: Fetch the initial search page (e.g., `/flights/from-to/`)
- **Cookie Extraction**: Extract **ONLY** the session cookie from the response headers
- **Token Extraction**: **DO NOT** extract any tokens from the initial page
- **Purpose**: Establish session and get initial session cookie

### 2. Token Extraction Strategy

- **Location**: Tokens are generated during the polling process, not on the initial page
- **Source**: Extract tokens from the `CFFLive` JavaScript object in polling responses
- **Token Names**: Look for specific tokens like `_token`, `csrf_token`, etc.
- **Timing**: Extract tokens from each polling response before making the next request

### 3. Cookie Management

- **Initial Cookie**: Use **ONLY** the session cookie from the initial response
- **Cookie Updates**: **NEVER** update cookies from polling responses
- **Session Continuity**: Maintain the same session cookie throughout the entire scraping session
- **No Cookie Evolution**: The initial session cookie remains constant

### 4. Request Construction

- **Token Inclusion**: Include extracted tokens in request body/form data
- **Cookie Headers**: Include session cookie in request headers
- **Header Consistency**: Use identical headers across all requests (User-Agent, Accept, etc.)
- **Content-Type**: Ensure proper content type for form submissions

## Sky Scraper Flow (STRICT REQUIREMENTS)

### 1. Initial Page Request

- **URL**: Fetch the initial search page
- **Cookie Extraction**: Extract session cookie from response headers
- **Token Extraction**: Extract tokens from the **last** `<script>` tag in the HTML
- **Purpose**: Establish session and get initial tokens and cookies

### 2. Token Extraction Strategy

- **Location**: Extract tokens from the **last script tag only**
- **Pattern**: Look for specific token patterns in JavaScript code
- **No Fallbacks**: **DO NOT** use fallback token extraction strategies
- **Validation**: Ensure all required tokens are present before proceeding

### 3. Polling with Cookie Updates

- **Current Cookies**: Use current cookies for each polling request
- **Response Cookies**: After each poll response, extract new cookies from response headers
- **Cookie Update**: Update cookies for the next poll request with cookies from current response
- **Flow Pattern**: `current cookies → request → response cookies → next request`

### 4. Session State Management

- **Cookie Tracking**: Track cookies across all polling requests
- **State Updates**: Update session state after each response
- **Error Handling**: Handle 419 errors by ensuring proper token/cookie state
- **Session Continuity**: Maintain session state throughout the polling process

## Implementation Requirements

### Strict Token Extraction

- **No Fallbacks**: Use only the specified token extraction methods
- **JavaScript Parsing**: Extract tokens from specific JavaScript objects/patterns
- **Validation**: Ensure all required tokens are present before making requests
- **Error Handling**: Fail gracefully if required tokens are missing

### Cookie Flow Implementation

#### Kiwi Implementation

```typescript
// Extract session cookie from initial response
let sessionCookie = extractSessionCookie(initialResponse);

// Use same session cookie for all subsequent requests
for (let poll = 0; poll < maxPolls; poll++) {
  const tokens = extractTokensFromCFFLive(pollResponse);
  const response = await makeRequest(tokens, sessionCookie); // Same cookie
}
```

#### Sky Implementation

```typescript
// Extract initial cookies and tokens
let currentCookies = extractCookiesFromResponse(initialResponse);
let tokens = extractTokensFromLastScript(initialResponse);

// Update cookies after each poll response
for (let poll = 0; poll < maxPolls; poll++) {
  const response = await makePollRequest(currentCookies, tokens);
  currentCookies = extractCookiesFromResponse(response); // Update for next request
  tokens = extractTokensFromLastScript(response); // Update tokens if needed
}
```

### Request Headers Consistency

- **User-Agent**: Use consistent user agent across all requests
- **Accept**: Include proper accept headers
- **Content-Type**: Ensure correct content type for form submissions
- **Referer**: Maintain referer headers for authenticity
- **Cookie**: Include session cookies in all requests

### Error Handling

- **419 Errors**: Handle "Page Expired" errors by ensuring proper token/cookie state
- **Token Validation**: Retry with fresh tokens when needed
- **Cookie Validation**: Ensure cookies are present and valid
- **Graceful Degradation**: Handle missing tokens/cookies without crashing

## Debug-First Development

### Debug Scripts

- **HTML Analysis**: Save response HTML to debug files for analysis
- **Header Inspection**: Log and analyze all response headers
- **Token Validation**: Verify token extraction with multiple strategies
- **Cookie Tracking**: Track cookie changes across requests
- **Real Website Testing**: Always test against actual websites, not assumptions

### Response Structure Analysis

- **7-Part Structure**: Understand the exact format of responses
- **Error Pattern Recognition**: Identify common error patterns (419, missing tokens, etc.)
- **Token Location**: Document exact locations of tokens in responses
- **Cookie Headers**: Analyze Set-Cookie header patterns

### Testing Requirements

- **Real Endpoints**: Test against actual website endpoints
- **Response Analysis**: Save and analyze real response data
- **Pattern Documentation**: Document exact request/response patterns
- **Error Reproduction**: Reproduce and document error conditions

## Common Pitfalls to Avoid

### Kiwi Scraper

- ❌ **Don't** extract tokens from initial page
- ❌ **Don't** update cookies from polling responses
- ❌ **Don't** use fallback token extraction methods
- ✅ **Do** extract tokens from `CFFLive` object in polling responses
- ✅ **Do** maintain initial session cookie throughout

### Sky Scraper

- ❌ **Don't** use fallback token extraction strategies
- ❌ **Don't** ignore cookie updates from poll responses
- ❌ **Don't** extract tokens from multiple script tags
- ✅ **Do** extract tokens from last script tag only
- ✅ **Do** update cookies after each poll response

### General

- ❌ **Don't** assume token/cookie behavior without testing
- ❌ **Don't** ignore 419 errors or session expiration
- ❌ **Don't** use inconsistent headers across requests
- ✅ **Do** create debug scripts to analyze real behavior
- ✅ **Do** test against actual websites
- ✅ **Do** document exact patterns and requirements

## Validation Checklist

Before implementing any scraping logic, ensure:

- [ ] Debug scripts created to analyze real website behavior
- [ ] Token extraction methods match documented requirements
- [ ] Cookie flow implementation follows scraper-specific rules
- [ ] Request headers are consistent across all requests
- [ ] Error handling covers 419 errors and session expiration
- [ ] Testing performed against actual website endpoints
- [ ] Response patterns documented and understood
- [ ] No fallback strategies used unless explicitly required

## Conclusion

These requirements are **mandatory** and must be followed exactly. Any deviation from these specifications will result in scraping failures. Always test against real websites and create debug scripts to validate behavior before implementing changes.
