"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useLocalStorage = useLocalStorage;
var react_1 = require("react");
var STORAGE_KEY = "flight-search-preferences";
function useLocalStorage() {
    var _a = (0, react_1.useState)(null), preferences = _a[0], setPreferences = _a[1];
    var _b = (0, react_1.useState)(false), isLoaded = _b[0], setIsLoaded = _b[1];
    // Load preferences from localStorage on mount
    (0, react_1.useEffect)(function () {
        try {
            var stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                var parsed = JSON.parse(stored);
                // Validate the stored data
                if (typeof parsed === "object" &&
                    typeof parsed.departureAirport === "string" &&
                    typeof parsed.arrivalAirport === "string" &&
                    typeof parsed.departureDate === "string" &&
                    typeof parsed.isRoundTrip === "boolean") {
                    setPreferences(parsed);
                }
            }
        }
        catch (error) {
            console.warn("Failed to load search preferences from localStorage:", error);
        }
        finally {
            setIsLoaded(true);
        }
    }, []);
    // Save preferences to localStorage
    var savePreferences = function (newPreferences) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences));
            setPreferences(newPreferences);
        }
        catch (error) {
            console.warn("Failed to save search preferences to localStorage:", error);
        }
    };
    // Clear preferences from localStorage
    var clearPreferences = function () {
        try {
            localStorage.removeItem(STORAGE_KEY);
            setPreferences(null);
        }
        catch (error) {
            console.warn("Failed to clear search preferences from localStorage:", error);
        }
    };
    // Convert stored preferences to form state
    var getFormState = function () {
        if (!preferences)
            return null;
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
        preferences: preferences,
        isLoaded: isLoaded,
        savePreferences: savePreferences,
        clearPreferences: clearPreferences,
        getFormState: getFormState,
    };
}
