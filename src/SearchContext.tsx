import { createContext, useContext } from "react";

// Source configuration type
export interface ScrapingSource {
  id: "kiwi" | "sky";
  enabled: boolean;
  name: string;
}

// Search context for sharing filter state between header and main content
const SearchContext = createContext<{
  searchParams: {
    departureAirport: string;
    arrivalAirport: string;
    departureDate: string;
    returnDate: string;
    isRoundTrip: boolean;
    sources: ScrapingSource[];
  };
  setSearchParams: React.Dispatch<
    React.SetStateAction<{
      departureAirport: string;
      arrivalAirport: string;
      departureDate: string;
      returnDate: string;
      isRoundTrip: boolean;
      sources: ScrapingSource[];
    }>
  >;
} | null>(null);

export const useSearchContext = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearchContext must be used within SearchProvider");
  }
  return context;
};

export { SearchContext };
