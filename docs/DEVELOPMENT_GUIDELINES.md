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
- Provide safe defaults on failures

## Scraping-Specific Guidelines

### HTML Parsing

- **Analyze HTML structure** before implementing parsing

### Data Validation

- Validate all extracted data against expected formats
- Implement data quality checks
- Handle partial failures gracefully
- Maintain data integrity and consistency

### Network Operations

- Use AbortController with proper cleanup
- Implement timeout management
- Handle connection errors gracefully

## Testing Strategy

### Test Environment

- Clear test data before each test run
- Test both happy path and error scenarios

### Test Data Management

- Clear flights, bundles, and bookingOptions before tests that read or write from those tables
- Test both one-way and round-trip flights
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

### Error Recovery

- Implement circuit breakers for failing operations
- Provide meaningful error messages
- Log sufficient context for debugging

## Performance Guidelines

### Memory Management

- Implement proper cleanup for resources
- Avoid memory leaks in long-running operations

### Database Operations

- Use batch operations for multiple records
- Implement proper indexing

## Security & Compliance

### Input Validation

- Validate all inputs and parameters
- Sanitize data from external sources

## Autonomous Development

### Decision Making

- **Identify critical decisions** that require user input
- Make autonomous decisions when possible
- Document decision rationale
- Escalate with full context when needed

### Workflow Process

1. **Feature research** before implementation
2. **Immediate testing** after each change

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
- **Clear separation** between business uniqueIds and database Convex IDs
- **Use appropriate data types**: `number` for timestamps, `string` for IDs
- **Index strategy**: Create indexes for fields used in queries and lookups

### Type Safety & Development

- **Explicit type annotations** are crucial in Convex functions
- **Handle circular references** with proper type annotations
- **Import management**: Always import `internal` from generated API
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

### Performance & Scalability

- **Bulk operations** are significantly more efficient than individual inserts
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

## Error Handling & Resilience

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

## ID Management

### Unique ID Generation

```typescript
// Flight uniqueId pattern
const flightUniqueId = `${flightNumber}_${fromIataCode}_${toIataCode}_${departureTimestamp}`;

// Bundle uniqueId pattern
const bundleUniqueId = `bundle_${sorted(outboundUniqueIds).join("_")}_${sorted(inboundUniqueIds).join("_")}`;

// BookingOption uniqueId pattern
const bookingUniqueId = `${targetBundleUniqueId}_${agency}_${price}_${currency}`;
```

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

## Documentation Standards

- JSDoc: @param, @returns, @example, @throws
- Include error handling and performance notes
- Provide working examples for all APIs
- Update docs when code changes

## Code Organization

### Code Patterns

- **Single responsibility**: Each function has one clear purpose
- **Modular design**: Reusable components and utilities
- **Consistent naming**: Clear, descriptive function and variable names
- **Documentation**: JSDoc comments for all public functions
