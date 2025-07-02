# Development Guidelines

## Core Principles

### Research-First Approach
- **Always research existing solutions** before implementing any feature
- Search npm, GitHub, and community forums for existing libraries
- Evaluate maintenance status, TypeScript support, and community feedback
- Document research findings and decision rationale

### Debug-First Strategy
- **Generate debug files** for all operations (HTML, JSON, logs)
- Use debug files to analyze issues before implementing fixes
- Build comprehensive debugging tools before they're needed
- Include real-time monitoring for long-running operations

### Test-Driven Development
- **Write tests before implementing features**
- Test immediately after each change
- Test in the actual target environment (Convex, browser)
- Treat test failures as immediate blockers

### Documentation Standards
- **JSDoc for all functions**: @param, @returns, @example, @throws
- Document all interfaces, types, and data structures
- Include error handling and performance notes
- Provide working examples for all APIs

## Code Quality Standards

### TypeScript Best Practices
- Use explicit type annotations, avoid `any`
- Use proper type annotations for callback functions: `(element: any) => {}`
- Wrap operations in try-catch blocks with proper error context
- Return safe defaults when operations fail

### Environment Compatibility
- **Prefer native JavaScript methods** over Node.js built-in modules
- Test immediately in Convex environment (has specific restrictions)
- Use ES module syntax consistently
- Keep dependencies minimal and lightweight

### Error Handling
- Use specific error types (NetworkError, ParsingError, etc.)
- Include context in error messages (URL, duration, parameters)
- Implement retry logic with exponential backoff
- Provide safe defaults on failures

## Scraping-Specific Guidelines

### Rate Limiting & Politeness
- **Always implement rate limiting** from the start
- Respect website terms of service
- Use polite crawling practices
- Implement exponential backoff for retries

### HTML Parsing
- **Analyze HTML structure** before implementing parsing
- Use multiple element finding strategies
- Implement graceful degradation for missing elements
- Use pattern-based token detection

### Data Validation
- Validate all extracted data against expected formats
- Implement data quality checks
- Handle partial failures gracefully
- Maintain data integrity and consistency

### Network Operations
- Use AbortController with proper cleanup
- Implement timeout management
- Handle connection errors gracefully
- Monitor for rate limiting and blocking

## Testing Strategy

### Test Categories
- **Unit Tests**: Individual function testing
- **Integration Tests**: Component interaction testing
- **End-to-End Tests**: Full workflow testing
- **Performance Tests**: Load and stress testing

### Test Environment
- **Test against real websites** for validation
- Clear test data before each test run
- Test both happy path and error scenarios
- Document environment-specific issues

### Test Data Management
- Clear flights, bundles, and bookingOptions before tests
- Test both one-way and round-trip flights
- Validate bundle structure and flight directions
- Check timezone handling

## Debugging Guidelines

### When Issues Occur
1. **Check debug reports** first
2. **Analyze error patterns** for recurring issues
3. **Validate prerequisites** and dependencies
4. **Test incrementally** to isolate problems
5. **Research online** for similar issues
6. **Document solutions** for future reference

### Debug File Analysis
- Save HTML responses immediately after fetches
- Analyze network requests and responses
- Verify element selectors in HTML
- Check for rate limiting and timeouts

### Error Recovery
- Implement circuit breakers for failing operations
- Use graceful degradation when possible
- Provide meaningful error messages
- Log sufficient context for debugging

## Performance Guidelines

### Memory Management
- Monitor memory usage during development
- Implement proper cleanup for resources
- Use streaming for large data sets
- Avoid memory leaks in long-running operations

### Network Efficiency
- Implement connection pooling
- Use appropriate timeouts
- Cache responses when possible
- Optimize request frequency

### Database Operations
- Use batch operations for multiple records
- Implement proper indexing
- Monitor query performance
- Use transactions for data consistency

## Security & Compliance

### Input Validation
- Validate all inputs and parameters
- Sanitize data from external sources
- Implement proper access controls
- Check for known vulnerabilities

### Data Protection
- Implement proper data retention policies
- Encrypt sensitive data
- Follow GDPR and privacy regulations
- Audit data access and usage

### Rate Limiting
- Respect website rate limits
- Implement polite crawling practices
- Monitor for blocking and restrictions
- Have fallback strategies

## Autonomous Development

### Decision Making
- **Identify critical decisions** that require user input
- Make autonomous decisions when possible
- Document decision rationale
- Escalate with full context when needed

### Workflow Process
1. **Morning test run** to ensure system health
2. **Feature research** before implementation
3. **Immediate testing** after each change
4. **End-of-day validation** with full test suite
5. **Weekly regression** testing

### Documentation Tracking
- Document all phase changes and completions
- Track performance metrics and quality indicators
- Record lessons learned and improvements
- Keep documentation current and accurate

## Cleanup & Maintenance

### After Issue Resolution
- **Remove debug files** and test artifacts
- Update .gitignore for new temporary files
- Document the resolution process
- Archive important debug data if needed

### Regular Maintenance
- Review and clean up outdated documentation
- Update dependencies and security patches
- Monitor system performance and errors
- Archive old logs and debug files

### Code Organization
- Use modular design with single responsibility
- Organize code into logical directories
- Maintain clean import/export structure
- Refactor regularly for maintainability

## Convex Development Best Practices

### Schema Design & Migration
- **Always test schema changes with existing data** before deployment
- **Clear database before schema changes** to avoid validation errors
- **Use migration scripts** for field name changes or data structure updates
- **Consider backward compatibility** when evolving schemas
- **Clear separation** between business uniqueIds and database Convex IDs
- **Use appropriate data types**: `number` for timestamps, `string` for IDs
- **Index strategy**: Create indexes for fields used in queries and lookups

### Type Safety & Development
- **Explicit type annotations** are crucial in Convex functions
- **Handle circular references** with proper type annotations
- **Import management**: Always import `internal` from generated API
- **Type inference limitations**: Add explicit types for complex objects
- **Separate business types** from database types
- **Use generic types** for reusable patterns

### Common Type Issues & Solutions
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

### Function Guidelines
- ALWAYS use the new function syntax for Convex functions
- Include argument and return validators for all Convex functions
- Use `internalQuery`, `internalMutation`, and `internalAction` for private functions
- Use `query`, `mutation`, and `action` for public functions
- Handle circular references with type annotations on return values

### Performance & Scalability
- **Bulk operations** are significantly more efficient than individual inserts
- **Array-based collection** during scraping improves performance
- **Duplicate prevention** should be handled in memory before database operations
- **ID mapping** is essential for maintaining relationships between entities
- **Process data in batches** for large datasets
- **Use indexes** for frequently queried fields

### Performance Patterns
```typescript
// ❌ Inefficient - individual inserts
for (const flight of flights) {
  await ctx.db.insert("flights", flight);
}

// ✅ Efficient - bulk insert
const flightIds = await ctx.db.insert("flights", flights);
```

## Scraping Best Practices
- Rate limiting and polite crawling
- Retry logic with exponential backoff
- Multiple element finding strategies
- Graceful degradation for missing elements
- Centralized configuration and structured logging

## Error Handling & Resilience

### Graceful Degradation
- **Prevent entire pipeline failures** with proper error handling
- **Missing data handling** (e.g., airports not found) should be planned
- **Comprehensive logging** is essential for debugging and monitoring
- **Retry logic** should be implemented for transient failures

### Error Patterns
```typescript
// ✅ Good error handling
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

### Validation Strategy
- **Validate input data** before processing
- **Check for required fields** at each step
- **Handle edge cases** (empty arrays, null values)
- **Provide meaningful error messages**

## Data Flow Architecture

### Three-Phase Approach
1. **Scraping Phase**: Collect data in arrays with duplicate prevention
2. **Processing Phase**: Map relationships using real Convex IDs
3. **Storage Phase**: Bulk insert in correct order with proper error handling

### Duplicate Prevention Strategies
```typescript
// Different strategies for different entity types
const duplicateStrategies = {
  flights: "ignore",      // Keep existing, ignore new
  bundles: "ignore",      // Keep existing, ignore new
  bookingOptions: "replace" // Replace old with new
};
```

### Ordered Insertion
- **Maintain referential integrity** with proper insertion order
- **Flights → Bundles → BookingOptions** sequence
- **ID mapping** between phases
- **Error rollback** if any phase fails

## ID Management

### Unique ID Generation
```typescript
// Flight uniqueId pattern
const flightUniqueId = `${flightNumber}_${fromIataCode}_${toIataCode}_${departureTimestamp}`;

// Bundle uniqueId pattern
const bundleUniqueId = `bundle_${sorted(outboundIds).join("_")}_${sorted(inboundIds).join("_")}`;

// BookingOption uniqueId pattern
const bookingUniqueId = `${targetBundleUniqueId}_${agency}_${price}_${currency}`;
```

### ID Mapping Strategy
- **Map uniqueIds to Convex IDs** after insertion
- **Use efficient lookup strategies** for ID resolution
- **Handle missing IDs** gracefully
- **Cache ID mappings** for performance

## Environment & Testing
- Test in Convex environment immediately
- Validate against real website responses
- Clear test data before each test run
- Document environment-specific issues

## Testing Strategy

### Test Types
- **Unit tests**: UniqueId generation, duplicate prevention
- **Integration tests**: Array collection and bulk insertion
- **End-to-end tests**: Complete scraping workflows
- **Performance tests**: Bulk operations efficiency
- **Schema migration tests**: Data structure changes

### Testing Best Practices
- **Test with real data** when possible
- **Mock external dependencies** for unit tests
- **Test error scenarios** and edge cases
- **Performance benchmarking** for critical operations
- **Schema validation tests** for data integrity

## Debugging & Monitoring

### Logging Strategy
- **Structured logging** with consistent format
- **Log levels**: DEBUG, INFO, WARN, ERROR
- **Context information**: Include relevant IDs and parameters
- **Performance metrics**: Log operation durations

### Debug Patterns
```typescript
// ✅ Good debugging
console.log(`Processing ${flights.length} flights`);
console.log(`Found ${existingFlights.length} existing flights`);
console.log(`Will insert ${newFlights.length} new flights`);

// ❌ Poor debugging
console.log("Processing flights");
```

### Monitoring Considerations
- **Track operation success rates**
- **Monitor performance metrics**
- **Alert on critical failures**
- **Track data quality metrics**

## Documentation Standards
- JSDoc: @param, @returns, @example, @throws
- Include error handling and performance notes
- Provide working examples for all APIs
- Update docs when code changes

## Code Organization

### File Structure
```
convex/
├── schema.ts              # Database schema
├── types.ts               # Type definitions
├── mutations/
│   ├── bulkInsertFlights.ts
│   ├── bulkInsertBundles.ts
│   └── bulkInsertBookingOptions.ts
├── queries/
│   └── getFlights.ts
└── utils/
    ├── uniqueId.ts        # ID generation utilities
    └── validation.ts      # Validation helpers
```

### Code Patterns
- **Single responsibility**: Each function has one clear purpose
- **Modular design**: Reusable components and utilities
- **Consistent naming**: Clear, descriptive function and variable names
- **Documentation**: JSDoc comments for all public functions

## Security Considerations

### Data Validation
- **Sanitize input data** before processing
- **Validate data types** and formats
- **Check for malicious content** in scraped data
- **Rate limiting** for external API calls

### Error Information
- **Don't expose sensitive information** in error messages
- **Log errors securely** without exposing internal details
- **Handle authentication errors** gracefully
- **Validate permissions** before operations

## Performance Optimization

### Database Optimization
- **Use indexes** for frequently queried fields
- **Bulk operations** instead of individual operations
- **Efficient queries** with proper filtering
- **Connection pooling** for external APIs

### Memory Optimization
- **Stream processing** for large datasets
- **Garbage collection** awareness
- **Memory monitoring** during operations
- **Efficient data structures** for lookups

## Future Considerations

### Scalability
- **Horizontal scaling** strategies
- **Database sharding** for large datasets
- **Caching strategies** for frequently accessed data
- **Load balancing** for multiple scrapers

### Maintenance
- **Regular schema reviews** and optimizations
- **Performance monitoring** and tuning
- **Code refactoring** for maintainability
- **Documentation updates** as code evolves

### Monitoring & Alerting
- **Real-time monitoring** of scraping operations
- **Alert on failures** and performance issues
- **Data quality metrics** tracking
- **Usage analytics** and reporting 