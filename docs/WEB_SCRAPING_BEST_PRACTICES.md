# Web Scraping Best Practices

## Overview

This document outlines the critical best practices learned from implementing the Sky scraper, focusing on session management, token extraction, and debugging strategies.

## Critical Session Management

### Token Extraction Strategy

#### ✅ Correct Approach

```typescript
// Extract ALL required tokens from the initial page
const extractTokensFromInitialPage = (html: string) => {
  const tokens = {
    _token: extractToken(html, /'_token':\s*'([^']+)'/),
    session: extractToken(html, /'session':\s*'([^']+)'/),
    suuid: extractToken(html, /'suuid':\s*'([^']+)'/),
    deeplink: extractToken(html, /'deeplink':\s*'([^']+)'/),
  };

  // Validate all tokens are present
  if (!tokens._token || !tokens.session || !tokens.suuid || !tokens.deeplink) {
    throw new Error("Required tokens not found in initial page");
  }

  return tokens;
};
```

#### ❌ Common Mistakes

- Assuming tokens will be generated during polling
- Not validating all required tokens before proceeding
- Treating loading pages differently (they should still contain tokens)
- Extracting tokens from polling responses instead of initial page

### Cookie Flow Management

#### ✅ Correct Implementation

```typescript
class SessionManager {
  private currentCookies: Record<string, string> = {};

  // Initialize with cookies from initial page
  initializeFromInitialPage(initialPageCookie: string) {
    this.currentCookies.flightsfinder_session = initialPageCookie;
  }

  // Use current cookies for request
  getCurrentCookies(): Record<string, string> {
    return { ...this.currentCookies };
  }

  // Update cookies from response for next request
  updateFromResponse(responseCookies: Record<string, string>) {
    this.currentCookies = { ...this.currentCookies, ...responseCookies };
  }
}

// Usage in polling loop
const sessionManager = new SessionManager();
sessionManager.initializeFromInitialPage(initialPageCookie);

for (let attempt = 0; attempt < maxAttempts; attempt++) {
  const response = await makeRequest(sessionManager.getCurrentCookies());
  sessionManager.updateFromResponse(response.cookies);
}
```

#### ❌ Common Mistakes

- Reusing initial page cookies for all polling requests
- Not extracting cookies from polling responses
- Not updating cookies between requests
- Assuming cookies persist across requests

## Debug-First Development Approach

### Creating Debug Scripts

Always create comprehensive debug scripts to understand real website behavior:

```javascript
const debugScrapingFlow = async () => {
  console.log("🚀 Starting debug session...");

  // Step 1: Fetch initial page
  const initialResponse = await fetch(initialUrl);
  const initialHtml = await initialResponse.text();

  // Save HTML for analysis
  fs.writeFileSync("debug_initial.html", initialHtml);
  console.log("📄 Initial page saved to debug_initial.html");

  // Step 2: Extract and log tokens
  const tokens = extractTokens(initialHtml);
  console.log("🔑 Tokens found:", tokens);

  // Step 3: Extract and log cookies
  const cookies = extractCookies(initialResponse.headers);
  console.log("🍪 Cookies found:", cookies);

  // Step 4: Test polling with cookie tracking
  let currentCookies = cookies;

  for (let i = 0; i < 3; i++) {
    console.log(`\n🔄 Polling attempt ${i + 1}...`);
    console.log("Using cookies:", currentCookies);

    const pollResponse = await makePollingRequest(currentCookies);
    const newCookies = extractCookies(pollResponse.headers);

    console.log("Response status:", pollResponse.status);
    console.log("New cookies:", newCookies);

    currentCookies = { ...currentCookies, ...newCookies };
  }
};
```

### Response Analysis

```javascript
const analyzeResponse = (response) => {
  console.log("📊 Response Analysis:");
  console.log("  Status:", response.status);
  console.log("  Headers:", Object.fromEntries(response.headers.entries()));
  console.log("  Content Length:", response.text().length);

  // Save response for analysis
  fs.writeFileSync(`debug_response_${Date.now()}.html`, response.text());
};
```

## Common Error Patterns & Solutions

### 419 "Page Expired" Errors

#### Cause

- Missing or invalid CSRF tokens
- Expired session cookies
- Incorrect token extraction strategy

#### Solution

```typescript
// Ensure tokens are extracted from initial page
const validateTokens = (tokens) => {
  const required = ["_token", "session", "suuid", "deeplink"];
  const missing = required.filter((key) => !tokens[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required tokens: ${missing.join(", ")}`);
  }
};

// Validate before starting polling
validateTokens(extractedTokens);
```

### Missing Tokens in Loading Pages

#### Cause

- Assuming loading pages don't contain tokens
- Not using comprehensive token extraction strategies

#### Solution

```typescript
// Always attempt token extraction regardless of page type
const extractTokensComprehensive = (html: string) => {
  const strategies = [
    // JavaScript variables
    { pattern: /'_token':\s*'([^']+)'/, key: "_token" },
    { pattern: /'session':\s*'([^']+)'/, key: "session" },
    // Form fields
    { pattern: /name="_token"\s+value="([^"]+)"/, key: "_token" },
    { pattern: /name="session"\s+value="([^"]+)"/, key: "session" },
    // Meta tags
    { pattern: /<meta name="csrf-token" content="([^"]+)"/, key: "_token" },
  ];

  const tokens = {};
  for (const strategy of strategies) {
    const match = html.match(strategy.pattern);
    if (match) {
      tokens[strategy.key] = match[1];
    }
  }

  return tokens;
};
```

### Cookie Management Issues

#### Cause

- Not updating cookies between polling requests
- Not extracting cookies from response headers

#### Solution

```typescript
const extractCookiesFromHeaders = (headers: Headers) => {
  const cookies: Record<string, string> = {};
  const setCookieHeaders = headers.get("set-cookie");

  if (setCookieHeaders) {
    // Handle multiple Set-Cookie headers
    const cookieStrings = setCookieHeaders.split(",");

    for (const cookieString of cookieStrings) {
      const match = cookieString.match(/([^=]+)=([^;]+)/);
      if (match) {
        cookies[match[1]] = match[2];
      }
    }
  }

  return cookies;
};
```

## Response Structure Understanding

### 7-Part Response Format

Many scraping APIs return responses in a specific format:

```
status|count|metadata1|metadata2|metadata3|metadata4|html
```

#### Parsing Implementation

```typescript
const parsePollingResponse = (response: string) => {
  const parts = response.split("|");

  if (parts.length !== 7) {
    throw new Error(
      `Invalid response format: expected 7 parts, got ${parts.length}`
    );
  }

  return {
    status: parts[0], // "Y" for complete, "N" for more data
    count: parseInt(parts[1]), // Total expected results
    metadata: parts.slice(2, 6), // Additional metadata
    html: parts[6], // HTML content with results
  };
};
```

## Testing Strategy

### Real Website Testing

1. **Always test against actual websites** - never rely on assumptions
2. **Create comprehensive test scenarios** - different search parameters, error conditions
3. **Monitor rate limiting** - implement proper delays and respect robots.txt
4. **Test error recovery** - handle network failures, timeouts, malformed responses

### Validation Checklist

- [ ] Tokens extracted from initial page
- [ ] Cookies properly managed across requests
- [ ] Response structure correctly parsed
- [ ] Error conditions handled gracefully
- [ ] Rate limiting implemented
- [ ] Debug files generated for analysis
- [ ] Real website responses validated

## Performance Considerations

### Rate Limiting

```typescript
const rateLimitedRequest = async (url: string, options: RequestInit) => {
  // Implement polite delays
  await new Promise((resolve) => setTimeout(resolve, 100));

  return fetch(url, options);
};
```

### Memory Management

```typescript
// Clean up debug files after analysis
const cleanupDebugFiles = () => {
  const debugDir = "./debug";
  const files = fs.readdirSync(debugDir);

  for (const file of files) {
    if (file.startsWith("debug_") && file.endsWith(".html")) {
      fs.unlinkSync(path.join(debugDir, file));
    }
  }
};
```

## Documentation Requirements

### Code Documentation

- Document all token extraction strategies
- Explain cookie flow management
- Provide examples of debug scripts
- Document error handling patterns

### Process Documentation

- Track debugging sessions and findings
- Document website behavior changes
- Maintain troubleshooting guides
- Update best practices based on new learnings

## Conclusion

The key to successful web scraping is understanding the website's session management and following the correct patterns for token extraction and cookie flow. Always start with comprehensive debugging to understand the real behavior before implementing solutions.
