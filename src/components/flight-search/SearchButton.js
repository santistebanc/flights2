"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchButton = SearchButton;
var react_1 = require("react");
var button_1 = require("../ui/button");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("../../utils");
function SearchButton(_a) {
    var _b = _a.isLoading, isLoading = _b === void 0 ? false : _b, _c = _a.disabled, disabled = _c === void 0 ? false : _c, _d = _a.loadingText, loadingText = _d === void 0 ? "Searching..." : _d, _e = _a.children, children = _e === void 0 ? "Search Flights" : _e, _f = _a.type, type = _f === void 0 ? "submit" : _f, onClick = _a.onClick, className = _a.className, _g = _a.size, size = _g === void 0 ? "lg" : _g, _h = _a.variant, variant = _h === void 0 ? "default" : _h;
    var isDisabled = disabled || isLoading;
    return (<button_1.Button type={type} disabled={isDisabled} onClick={onClick} size={size} variant={variant} className={(0, utils_1.cn)(
        // Base styles
        "flex items-center gap-2 font-semibold transition-all duration-200", 
        // Size-specific styles
        size === "lg" && "px-8 py-3 text-lg", size === "default" && "px-6 py-2 text-base", size === "sm" && "px-4 py-1.5 text-sm", 
        // Default variant styles (yellow theme)
        variant === "default" && [
            "bg-yellow-400 text-black",
            "hover:bg-yellow-500",
            "focus:bg-yellow-500",
            "disabled:bg-gray-600 disabled:text-gray-400",
            "focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-800",
        ], 
        // Loading state styles
        isLoading && "cursor-not-allowed", 
        // Custom className
        className)} aria-label={isLoading ? loadingText : "Search for flights"} aria-busy={isLoading}>
      {isLoading ? (<>
          <lucide_react_1.Loader2 className="h-5 w-5 animate-spin" aria-hidden="true"/>
          <span>{loadingText}</span>
        </>) : (<>
          <lucide_react_1.Search className="h-5 w-5" aria-hidden="true"/>
          <span>{children}</span>
        </>)}
    </button_1.Button>);
}
