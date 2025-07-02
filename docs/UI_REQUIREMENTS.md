# Flight Scraping Project - UI Requirements & Implementation

## Overview

This document outlines the detailed UI requirements for the flight scraping frontend, including layout specifications, component interactions, and data flow integration.

## Sticky Header Design

### Top Row Layout

The header contains a single row with the following elements arranged horizontally:

1. **From Airport Input** (Autocomplete)

   - Uses existing autocomplete component
   - Placeholder: "From"
   - Validation: Required field
   - Styling: Red border when empty and search is attempted

2. **To Airport Input** (Autocomplete)

   - Uses existing autocomplete component
   - Placeholder: "To"
   - Validation: Required field
   - Styling: Red border when empty and search is attempted

3. **Date Range Picker**

   - Uses existing DateRangePicker component
   - **Auto-filtering**: Updates local filters automatically (no update button)
   - **Filter Application**: Filters only applied when search button is clicked
   - Round-trip toggle integrated within picker
   - Validation: Outbound date required, inbound date required for round-trips

4. **Search Button**

   - Triggers scraping actions AND applies filters
   - Disabled when required fields are empty
   - Loading state during scraping
   - Styling: Yellow background when enabled, gray when disabled

5. **Settings Button**
   - Icon: Classic gear/settings icon
   - Triggers popup for source selection
   - Positioned at the end of the row

### Bottom Row Layout

Under the top row, display:

1. **Results Count** (Left side)

   - Shows number of results after filtering
   - Format: "X result(s) found"
   - Updates in real-time as data changes

2. **Scraping Progress Indicators** (Right side)
   - Uses existing MultiSourceProgress component
   - Shows progress for each enabled source
   - Real-time updates during scraping
   - Only visible when scraping is active

## Settings Popup

### Trigger

- Settings button (gear icon) in top row
- Click to open popup

### Content

- **Source Selection**: Toggle switches for each source
  - Kiwi.com
  - Sky (or other sources)
- **Save/Cancel Buttons**: Apply or discard changes
- **Styling**: Consistent with app theme

### Behavior

- Modal popup overlay
- Click outside to close
- Escape key to close
- Save updates search parameters

## Main Content Area

### Layout

- **Full Height**: Timeline covers entire remaining viewport height
- **Vertical Scrolling**: At window level, not in child divs
- **No Internal Scroll**: Timeline component should not have its own scroll container

### Timeline Component

- Uses existing Timeline component with modifications
- Adapts to new bundle data structure
- Maintains existing UI/UX design
- Full-width display

## Extended Bundle Data Structure

### Frontend Data Shape

```typescript
interface ExtendedBundle {
  // Bundle metadata
  uniqueId: string;

  // Combined flights (outbound + inbound)
  flights: Array<{
    flightNumber: string;
    from: {
      iataCode: string;
      icaoCode?: string;
      name: string;
      city: string;
      country?: string;
      timezone?: string;
    };
    to: {
      iataCode: string;
      icaoCode?: string;
      name: string;
      city: string;
      country?: string;
      timezone?: string;
    };
    departure: number; // Unix timestamp
    arrival: number; // Unix timestamp
    airline: {
      iataCode?: string;
      icaoCode?: string;
      name: string;
      country?: string;
    };
  }>;

  // Booking options for this bundle
  bookingOptions: Array<{
    agency: string;
    price: number;
    link: string;
    currency: string;
  }>;
}
```

### Data Flow

1. **Query**: Fetch bundles with extended flight and booking data
2. **Filter**: Apply search criteria (from, to, dates)
3. **Display**: Pass filtered data to Timeline component

## Component Integration

### Existing Components to Modify

1. **CompactFilters.tsx**

   - Add settings button
   - Implement auto-filtering for date picker
   - Update search button behavior

2. **Timeline.tsx**

   - Adapt to new bundle data structure
   - Ensure full-height display
   - Remove internal scroll containers

3. **MultiSourceProgress.tsx**
   - Integrate with scraping progress
   - Real-time updates
   - Position in header bottom row

### New Components to Create

1. **SettingsPopup.tsx**

   - Source selection interface
   - Modal popup behavior
   - Save/cancel functionality

2. **ExtendedBundleQuery.tsx** (or similar)
   - Query logic for extended bundle data
   - Filtering implementation
   - Performance optimization

## User Experience Flow

### Search Process

1. **Setup**: User selects airports and dates

   - Date picker updates local filters automatically
   - No immediate search triggered

2. **Search**: User clicks search button

   - Filters applied to existing data
   - Scraping triggered for enabled sources
   - Progress indicators show real-time status

3. **Results**: Timeline displays filtered bundles
   - Full-height display with window-level scrolling
   - Real-time updates as scraping completes

### Error Handling

- **Validation**: Clear indication of required fields
- **Network Errors**: User-friendly error messages
- **No Results**: Helpful guidance for adjusting search
- **Scraping Failures**: Individual source error indicators

## Styling & Theme

### Consistency

- Maintain existing dark theme (gray-900 background)
- Use existing color scheme (yellow accents, gray components)
- Consistent spacing and typography

### Responsive Design

- Header elements stack appropriately on smaller screens
- Timeline maintains usability across screen sizes
- Settings popup adapts to viewport

### Accessibility

- Proper ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader compatibility
- Focus management for popups

## Performance Considerations

### Optimization

- **Virtual Scrolling**: For large result sets in Timeline
- **Query Caching**: For frequently accessed data
- **Lazy Loading**: For bundle details
- **Debounced Updates**: For real-time progress indicators

### Memory Management

- **Efficient Data Structures**: Minimize memory footprint
- **Cleanup**: Proper cleanup of subscriptions and listeners
- **Garbage Collection**: Avoid memory leaks in long-running sessions

## Implementation Priority

### Phase 1: Core Layout

1. Update CompactFilters with settings button
2. Implement auto-filtering date picker
3. Create SettingsPopup component
4. Update header layout structure

### Phase 2: Data Integration

1. Create extended bundle queries
2. Update Timeline component for new data structure
3. Implement filtering logic
4. Add progress indicator integration

### Phase 3: Polish & Optimization

1. Performance optimization
2. Error handling improvements
3. Accessibility enhancements
4. Responsive design refinements

## Testing Requirements

### Component Testing

- Unit tests for new components
- Integration tests for data flow
- Visual regression tests for UI consistency

### User Testing

- Search flow validation
- Error scenario testing
- Performance testing with large datasets
- Accessibility testing

### Browser Testing

- Cross-browser compatibility
- Mobile responsiveness
- Performance across different devices
