"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useLocalStorage = useLocalStorage;
var react_1 = require("react");
function useLocalStorage(key, initialValue) {
    // Get from local storage then parse stored json or return initialValue
    var _a = (0, react_1.useState)(function () {
        if (typeof window === "undefined") {
            return initialValue;
        }
        try {
            var item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        }
        catch (error) {
            console.log("Error reading localStorage key \"".concat(key, "\":"), error);
            return initialValue;
        }
    }), storedValue = _a[0], setStoredValue = _a[1];
    // Return a wrapped version of useState's setter function that persists the new value to localStorage
    var setValue = function (value) {
        try {
            // Allow value to be a function so we have the same API as useState
            var valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            // Save to local storage
            if (typeof window !== "undefined") {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        }
        catch (error) {
            console.log("Error setting localStorage key \"".concat(key, "\":"), error);
        }
    };
    return [storedValue, setValue];
}
