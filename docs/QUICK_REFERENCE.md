# Quick Reference Guide

## Common Tasks

### Adding a New Scraping Source
1. Add source config to `convex/crawler/config.ts`
2. Create scraper class in `convex/crawler/`
3. Update `MultiSourceScraper` to include new source
4. Test with debug files

### Debugging Scraping Issues
1. Check debug HTML files in `/debug/`
2. Analyze network requests and responses
3. Verify element selectors in HTML
4. Check rate limiting and timeouts

### Testing Scraping
1. Clear flights/bundles/bookingOptions before test
2. Test both one-way and round-trip
3. Validate bundle structure and flight directions
4. Check timezone handling

### Adding New Database Fields
1. Update schema in `convex/schema.ts`
2. Add migration if needed
3. Update type definitions in `convex/crawler/types.ts`
4. Update UI components

## Key Files
- `convex/crawler/multiSourceScraper.ts` - Main orchestrator
- `convex/crawler/config.ts` - Source configuration
- `convex/crawler/types.ts` - Type definitions
- `convex/schema.ts` - Database schema

## Common Commands
```bash
# Test scraping
npm run test:scraping

# Clear test data
npm run clear:test-data

# Generate debug files
npm run debug:scraping
``` 