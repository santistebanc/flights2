# FlightFinder ✈️

A modern, real-time flight search application that helps users find and compare flight deals across multiple airlines and travel agencies. Built with React, TypeScript, and Convex for seamless real-time updates and data management.

## Features

### 🎯 **Smart Flight Search**
- **One-way & Round Trip**: Toggle between one-way and round trip flights with an intuitive date picker
- **Real-time Results**: Get instant flight results as you search with live updates
- **Future Date Validation**: Automatically prevents selection of past dates
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### 📊 **Advanced Timeline View**
- **Virtual Scrolling**: High-performance rendering of large flight datasets using TanStack Virtual
- **Horizontal Scrolling**: Smooth horizontal navigation through extensive flight data
- **Price Comparison**: View the lowest price deals per offer with clickable price popups
- **Deal Aggregation**: See unique dealer prices with automatic filtering of duplicate offers

### 🎨 **Modern Dark Theme**
- **Dark UI**: Beautiful dark theme with yellow accents for optimal viewing experience
- **Custom Scrollbars**: Styled scrollbars that match the app's design language
- **Smooth Animations**: Polished interactions and transitions throughout the app

### 🔍 **Search & Filtering**
- **Origin & Destination**: Search flights between any airports
- **Date Range Selection**: Flexible date picking with range support
- **Compact Filters**: Streamlined search interface for quick access

## Tech Stack

### Frontend
- **React 19** with TypeScript for type-safe development
- **Vite** for fast development and building
- **Tailwind CSS** for styling with custom dark theme
- **TanStack Virtual** for high-performance virtual scrolling
- **shadcn/ui** components for accessible UI elements

### Backend
- **Convex** for real-time database and backend services
- **Convex Auth** with anonymous authentication
- **Real-time queries** for live flight data updates

### Development Tools
- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for code formatting

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd flights
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to see the application

## Project Structure

```
flights/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── auth/           # Authentication components
│   │   └── CompactFilters.tsx
│   ├── contexts/           # React contexts
│   ├── FlightSearch.tsx    # Main flight search component
│   └── App.tsx            # Root application component
├── convex/                 # Backend code (Convex functions)
│   ├── schema.ts          # Database schema
│   ├── offers.ts          # Flight offers queries
│   └── http.ts            # HTTP endpoints
└── public/                # Static assets
```

## Key Components

### DateRangePicker
- Custom date picker with round trip toggle
- Future date validation
- Dark theme styling
- Single date and range selection modes

### Timeline
- Virtual scrolling for performance
- Horizontal scrolling support
- Price column with deal popups
- Real-time data updates

### CompactFilters
- Streamlined search interface
- Origin/destination inputs
- Date range selection
- Search button

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Convex Backend
The backend is powered by Convex with:
- Real-time database queries
- HTTP endpoints for external API integration
- Anonymous authentication
- Automatic deployment

## Deployment

This app is designed to be deployed on Convex with automatic hosting. The frontend can be deployed to any static hosting service like Vercel, Netlify, or GitHub Pages.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

---

Built with ❤️ using [Convex](https://convex.dev) and [React](https://reactjs.org/)
