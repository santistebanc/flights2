"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchContext = exports.useSearchContext = void 0;
var react_1 = require("react");
// Search context for sharing filter state between header and main content
var SearchContext = (0, react_1.createContext)(null);
exports.SearchContext = SearchContext;
var useSearchContext = function () {
    var context = (0, react_1.useContext)(SearchContext);
    if (!context) {
        throw new Error("useSearchContext must be used within SearchProvider");
    }
    return context;
};
exports.useSearchContext = useSearchContext;
