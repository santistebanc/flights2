"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAirportHistory = useAirportHistory;
var useLocalStorage_1 = require("../useLocalStorage");
var MAX_HISTORY_ITEMS = 10;
var HISTORY_STORAGE_KEY = "airport-search-history";
function useAirportHistory() {
    var _a = (0, useLocalStorage_1.useLocalStorage)(HISTORY_STORAGE_KEY, []), history = _a[0], setHistory = _a[1];
    // Add airport to history
    var addToHistory = function (airport) {
        setHistory(function (prevHistory) {
            var now = Date.now();
            // Check if airport already exists in history
            var existingIndex = prevHistory.findIndex(function (item) { return item.iataCode === airport.iataCode; });
            if (existingIndex >= 0) {
                // Update existing item
                var updatedHistory = __spreadArray([], prevHistory, true);
                updatedHistory[existingIndex] = __assign(__assign({}, updatedHistory[existingIndex]), { lastUsed: now, useCount: updatedHistory[existingIndex].useCount + 1 });
                // Move to front (most recently used)
                var item = updatedHistory.splice(existingIndex, 1)[0];
                updatedHistory.unshift(item);
                return updatedHistory;
            }
            else {
                // Add new item
                var newItem = __assign(__assign({}, airport), { lastUsed: now, useCount: 1 });
                var updatedHistory = __spreadArray([newItem], prevHistory, true);
                // Keep only the most recent items
                return updatedHistory.slice(0, MAX_HISTORY_ITEMS);
            }
        });
    };
    // Get history items sorted by priority (recently used first, then by use count)
    var getHistoryItems = function () {
        return __spreadArray([], history, true).sort(function (a, b) {
            // First sort by last used (most recent first)
            if (b.lastUsed !== a.lastUsed) {
                return b.lastUsed - a.lastUsed;
            }
            // Then by use count (most used first)
            return b.useCount - a.useCount;
        });
    };
    // Clear history
    var clearHistory = function () {
        setHistory([]);
    };
    // Remove specific airport from history
    var removeFromHistory = function (iataCode) {
        setHistory(function (prevHistory) {
            return prevHistory.filter(function (item) { return item.iataCode !== iataCode; });
        });
    };
    return {
        history: getHistoryItems(),
        addToHistory: addToHistory,
        clearHistory: clearHistory,
        removeFromHistory: removeFromHistory,
    };
}
