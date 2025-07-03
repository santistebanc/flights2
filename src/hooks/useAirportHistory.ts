import { useLocalStorage } from "../useLocalStorage";

interface AirportHistoryItem {
  iataCode: string;
  name: string;
  city: string;
  country?: string;
  lastUsed: number; // timestamp
  useCount: number;
}

const MAX_HISTORY_ITEMS = 10;
const HISTORY_STORAGE_KEY = "airport-search-history";

export function useAirportHistory() {
  const [history, setHistory] = useLocalStorage<AirportHistoryItem[]>(
    HISTORY_STORAGE_KEY,
    []
  );

  // Add airport to history
  const addToHistory = (airport: {
    iataCode: string;
    name: string;
    city: string;
    country?: string;
  }) => {
    setHistory((prevHistory) => {
      const now = Date.now();

      // Check if airport already exists in history
      const existingIndex = prevHistory.findIndex(
        (item) => item.iataCode === airport.iataCode
      );

      if (existingIndex >= 0) {
        // Update existing item
        const updatedHistory = [...prevHistory];
        updatedHistory[existingIndex] = {
          ...updatedHistory[existingIndex],
          lastUsed: now,
          useCount: updatedHistory[existingIndex].useCount + 1,
        };

        // Move to front (most recently used)
        const item = updatedHistory.splice(existingIndex, 1)[0];
        updatedHistory.unshift(item);

        return updatedHistory;
      } else {
        // Add new item
        const newItem: AirportHistoryItem = {
          ...airport,
          lastUsed: now,
          useCount: 1,
        };

        const updatedHistory = [newItem, ...prevHistory];

        // Keep only the most recent items
        return updatedHistory.slice(0, MAX_HISTORY_ITEMS);
      }
    });
  };

  // Get history items sorted by priority (recently used first, then by use count)
  const getHistoryItems = () => {
    return [...history].sort((a, b) => {
      // First sort by last used (most recent first)
      if (b.lastUsed !== a.lastUsed) {
        return b.lastUsed - a.lastUsed;
      }
      // Then by use count (most used first)
      return b.useCount - a.useCount;
    });
  };

  // Clear history
  const clearHistory = () => {
    setHistory([]);
  };

  // Remove specific airport from history
  const removeFromHistory = (iataCode: string) => {
    setHistory((prevHistory) =>
      prevHistory.filter((item) => item.iataCode !== iataCode)
    );
  };

  return {
    history: getHistoryItems(),
    addToHistory,
    clearHistory,
    removeFromHistory,
  };
}
