import { useState, useEffect } from "react";

interface StoredSearchPreferences {
  departureAirport: string;
  arrivalAirport: string;
  departureDate: string; // ISO string
  returnDate?: string; // ISO string
  isRoundTrip: boolean;
}

const STORAGE_KEY = "flight-search-preferences";

export function useLocalStorage() {
  const [preferences, setPreferences] =
    useState<StoredSearchPreferences | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as StoredSearchPreferences;

        // Validate the stored data
        if (
          typeof parsed === "object" &&
          typeof parsed.departureAirport === "string" &&
          typeof parsed.arrivalAirport === "string" &&
          typeof parsed.departureDate === "string" &&
          typeof parsed.isRoundTrip === "boolean"
        ) {
          setPreferences(parsed);
        }
      }
    } catch (error) {
      console.warn(
        "Failed to load search preferences from localStorage:",
        error
      );
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save preferences to localStorage
  const savePreferences = (newPreferences: StoredSearchPreferences) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences));
      setPreferences(newPreferences);
    } catch (error) {
      console.warn("Failed to save search preferences to localStorage:", error);
    }
  };

  // Clear preferences from localStorage
  const clearPreferences = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setPreferences(null);
    } catch (error) {
      console.warn(
        "Failed to clear search preferences from localStorage:",
        error
      );
    }
  };

  // Convert stored preferences to form state
  const getFormState = () => {
    if (!preferences) return null;

    return {
      departureAirport: preferences.departureAirport,
      arrivalAirport: preferences.arrivalAirport,
      departureDate: new Date(preferences.departureDate),
      returnDate: preferences.returnDate
        ? new Date(preferences.returnDate)
        : undefined,
      isRoundTrip: preferences.isRoundTrip,
    };
  };

  return {
    preferences,
    isLoaded,
    savePreferences,
    clearPreferences,
    getFormState,
  };
}
