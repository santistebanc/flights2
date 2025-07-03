# Flight Scraping Application

## 🚨 MANDATORY: Task Completion Protocol

**CRITICAL**: This project follows a strict task completion protocol that MUST be followed for every task:

### Task Completion Steps (MANDATORY):

1. **Mark task complete** in `tasks/tasks-prd-flight-scraping-app.md`
2. **Document all files changed** with descriptions
3. **Run validation** (`npm test` or `npx tsc --noEmit`)
4. **Stage and commit** with proper conventional commit format
5. **Wait for user approval** before next task

### PRD Change Management:

- Check if changes are in PRD (`tasks/prd-flight-scraping-app.md`)
- If not, prompt user to update PRD first
- Update task list accordingly

**See `.cursor/rules/project-management.mdc` for full protocol details.**

---

## Project Overview

A full-stack flight scraping application built with React, TypeScript, and Convex. The system scrapes flight data from multiple sources (Skyscanner and Kiwi) based on user-defined search criteria, stores the results in a database, and displays matching flight bundles to users.

## Features

- **Multi-Source Flight Aggregation**: Scrape and aggregate flight data from Skyscanner and Kiwi in parallel
- **Real-Time User Experience**: Provide immediate feedback on scraping progress without blocking the user interface
- **Flexible Search Capabilities**: Support both one-way and round-trip searches with comprehensive filtering options
- **Efficient Data Management**: Store and retrieve flight data efficiently with automatic cleanup of expired entries
- **Responsive Performance**: Deliver search results within 30 seconds when possible
- **Graceful Error Handling**: Continue operation even when individual scraping sources fail

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Convex (database, real-time updates, serverless functions)
- **Scraping**: Multi-source web scraping with rate limiting and error handling
- **State Management**: React Context + localStorage for persistence

## Quick Start

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Start development servers**:

   ```bash
   npm run dev
   ```

3. **Open the application**:
   - Frontend: http://localhost:5173
   - Convex Dashboard: https://dashboard.convex.dev

## Project Structure

```
├── convex/                 # Convex backend (database, functions, actions)
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── hooks/             # Custom React hooks
│   └── utils/             # Utility functions
├── tasks/                  # Project documentation
│   ├── prd-flight-scraping-app.md
│   └── tasks-prd-flight-scraping-app.md
└── .cursor/rules/         # Cursor IDE rules and protocols
```

## Development Guidelines

- **One-way & Round Trip**: Toggle between one-way and round trip flights with an intuitive date picker
- **IATA Code Input**: Smart autocomplete for airport codes with validation and history
- **Real-time Progress**: Live progress indicators for multi-source scraping operations
- **Responsive Design**: Mobile-first design that works on all devices
- **Accessibility**: Full keyboard navigation and screen reader support

## Key Components

### DateRangePicker

- Custom date picker with round trip toggle
- Fixed width to prevent layout shifts
- Integrated validation and error handling

### IataInput

- IATA code input with autocomplete
- Priority-based search (exact match, history, popularity)
- Real-time validation against airport database

### FlightSearchForm

- Combined search interface with all flight search fields
- LocalStorage integration for search preferences
- Comprehensive form validation

## Database Schema

The application uses Convex with the following main tables:

- **airports**: Airport information with IATA codes and popularity scores
- **flights**: Individual flight records with departure/arrival details
- **bundles**: Flight bundles combining outbound and inbound flights
- **bookingOptions**: Pricing and booking information for each bundle
- **scrapingLogs**: Monitoring and debugging information for scraping operations

## Contributing

1. Follow the task completion protocol for all changes
2. Check the PRD before implementing new features
3. Update task list as work progresses
4. Ensure all changes are properly documented and committed

## License

This project is private and proprietary.
