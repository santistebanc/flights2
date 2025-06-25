import { createContext, useContext } from "react";

// Search context for sharing filter state between header and main content
const SearchContext = createContext<{
  searchParams: {
    from: string;
    to: string;
    departureStart: string;
    departureEnd: string;
  };
  setSearchParams: React.Dispatch<React.SetStateAction<{
    from: string;
    to: string;
    departureStart: string;
    departureEnd: string;
  }>>;
} | null>(null);

export const useSearchContext = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearchContext must be used within SearchProvider');
  }
  return context;
};

export { SearchContext }; 