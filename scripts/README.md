# Scripts

This directory contains utility scripts for the flight search application.

## clear-flight-data.js

Clears all flight-related data from the database, including:

- All booking options
- All bundles
- All flights

### Usage

**Method 1: Using npm script (recommended)**

```bash
npm run clear-flight-data
```

**Method 2: Direct execution**

```bash
node scripts/clear-flight-data.js
```

**Method 3: With explicit environment variable**

```bash
VITE_CONVEX_URL=https://your-convex-url.convex.cloud node scripts/clear-flight-data.js
```

### Environment Variables

The script automatically loads environment variables from `.env.local` file in the project root. It looks for:

- `VITE_CONVEX_URL` (primary)
- `CONVEX_URL` (fallback)

### Output

The script provides detailed output including:

- Connection status
- Number of items deleted from each table
- Success/error messages

### Example Output

```
🗑️  Clearing flight data...
📡 Connecting to: https://coordinated-seahorse-724.convex.cloud
✅ Success!
📊 Deleted counts:
   - Booking Options: 264
   - Bundles: 228
   - Flights: 258
💬 Successfully cleared all flight data. Deleted 264 booking options, 228 bundles, and 258 flights.
```

### Safety

⚠️ **Warning**: This script permanently deletes all flight data from the database. Use with caution, especially in production environments.
