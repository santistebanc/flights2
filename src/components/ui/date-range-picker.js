/* eslint-disable max-lines */
"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateRangePicker = void 0;
var react_1 = require("react");
var button_1 = require("./button");
var popover_1 = require("./popover");
var calendar_1 = require("./calendar");
var date_input_1 = require("./date-input");
var label_1 = require("./label");
var switch_1 = require("./switch");
var react_icons_1 = require("@radix-ui/react-icons");
var formatDate = function (date, locale) {
    if (locale === void 0) { locale = "en-us"; }
    // Always day first, then month, then year
    var day = date.getDate();
    var year = date.getFullYear();
    // Use locale for month name
    var month = date.toLocaleString(locale, { month: "short" });
    return "".concat(day, " ").concat(month, " ").concat(year);
};
var getDateAdjustedForTimezone = function (dateInput) {
    if (typeof dateInput === "string") {
        // Split the date string to get year, month, and day parts
        var parts = dateInput.split("-").map(function (part) { return parseInt(part, 10); });
        // Create a new Date object using the local timezone
        // Note: Month is 0-indexed, so subtract 1 from the month part
        var date = new Date(parts[0], parts[1] - 1, parts[2]);
        return date;
    }
    else {
        // If dateInput is already a Date object, return it directly
        return dateInput;
    }
};
// Helper function to get the start of today (midnight)
var getStartOfToday = function () {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};
// Helper function to check if a date is in the past (before today)
var isDateInPast = function (date) {
    var startOfToday = getStartOfToday();
    return date < startOfToday;
};
/** The DateRangePicker component allows a user to select a range of dates */
var DateRangePicker = function (_a) {
    var dateFrom = _a.dateFrom, dateTo = _a.dateTo, onUpdate = _a.onUpdate, isRoundTrip = _a.isRoundTrip;
    var _b = (0, react_1.useState)(false), isOpen = _b[0], setIsOpen = _b[1];
    // Ensure dates are not in the past
    var getValidDate = function (date) {
        // Treat empty strings as undefined to default to today
        var validDate = date && date !== "" ? date : undefined;
        var adjustedDate = validDate
            ? getDateAdjustedForTimezone(validDate)
            : getStartOfToday();
        return isDateInPast(adjustedDate) ? getStartOfToday() : adjustedDate;
    };
    // Convert props to internal range format
    var range = {
        from: getValidDate(dateFrom),
        to: isRoundTrip && dateTo ? getValidDate(dateTo) : undefined,
    };
    var _c = (0, react_1.useState)(typeof window !== "undefined" ? window.innerWidth < 960 : false), isSmallScreen = _c[0], setIsSmallScreen = _c[1];
    (0, react_1.useEffect)(function () {
        var handleResize = function () {
            setIsSmallScreen(window.innerWidth < 960);
        };
        window.addEventListener("resize", handleResize);
        // Clean up event listener on unmount
        return function () {
            window.removeEventListener("resize", handleResize);
        };
    }, []);
    // Add refs for manual date inputs
    var fromInputRef = (0, react_1.useRef)(null);
    var toInputRef = (0, react_1.useRef)(null);
    // Helper to blur focused date input if it's one of ours
    var handlePopoverMouseDown = function () {
        var active = document.activeElement;
        if (fromInputRef.current && active === fromInputRef.current) {
            fromInputRef.current.blur();
        }
        else if (toInputRef.current && active === toInputRef.current) {
            toInputRef.current.blur();
        }
    };
    // Function to handle date changes with validation
    var handleDateChange = function (date, isFromDate) {
        var startOfToday = getStartOfToday();
        // If the date is in the past, use today instead
        var validDate = isDateInPast(date) ? startOfToday : date;
        if (isFromDate) {
            var toDate = range.to == null || validDate > range.to ? validDate : range.to;
            onUpdate === null || onUpdate === void 0 ? void 0 : onUpdate({
                range: { from: validDate, to: toDate },
                isRoundTrip: isRoundTrip,
            });
        }
        else {
            var fromDate = validDate < range.from ? validDate : range.from;
            onUpdate === null || onUpdate === void 0 ? void 0 : onUpdate({
                range: { from: fromDate, to: validDate },
                isRoundTrip: isRoundTrip,
            });
        }
    };
    return (<popover_1.Popover modal={true} open={isOpen} onOpenChange={function (open) {
            setIsOpen(open);
        }}>
      <popover_1.PopoverTrigger asChild>
        <button_1.Button variant="outline" className="border-gray-600 bg-gray-700 text-white hover:bg-gray-600 hover:border-gray-500 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 min-w-[280px]">
          <div className="text-right flex-1">
            <div className="py-1">
              <div className="whitespace-nowrap">{"".concat(formatDate(range.from)).concat(isRoundTrip && range.to != null
            ? " - " + formatDate(range.to)
            : "")}</div>
            </div>
          </div>
          <div className="pl-1 opacity-60 -mr-2 scale-125 text-gray-400 flex-shrink-0">
            {isOpen ? (<react_icons_1.ChevronUpIcon width={24}/>) : (<react_icons_1.ChevronDownIcon width={24}/>)}
          </div>
        </button_1.Button>
      </popover_1.PopoverTrigger>
      <popover_1.PopoverContent className="w-auto bg-gray-800 border-gray-600 text-white shadow-lg" onMouseDown={handlePopoverMouseDown}>
        <div className="flex py-2">
          <div className="flex">
            <div className="flex flex-col">
              <div className="flex flex-col lg:flex-row gap-2 px-3 justify-start items-center lg:items-start pb-4 lg:pb-0">
                <div className="flex items-center space-x-2 py-1">
                  <switch_1.Switch checked={isRoundTrip} onCheckedChange={function (checked) {
            if (checked) {
                // When switching to round trip, set the return date to the same as departure if not already set
                onUpdate === null || onUpdate === void 0 ? void 0 : onUpdate({
                    range: {
                        from: range.from,
                        to: range.to || range.from,
                    },
                    isRoundTrip: checked,
                });
            }
            else {
                // When switching to one-way, clear the return date
                onUpdate === null || onUpdate === void 0 ? void 0 : onUpdate({
                    range: { from: range.from, to: undefined },
                    isRoundTrip: checked,
                });
            }
        }} id="round-trip-mode" className="data-[state=checked]:bg-yellow-400 data-[state=unchecked]:bg-gray-600"/>
                  <label_1.Label htmlFor="round-trip-mode" className="text-gray-300">
                    Round Trip
                  </label_1.Label>
                </div>
                <div className="flex flex-col gap-2 ml-auto">
                  <div className="flex gap-2">
                    <date_input_1.default ref={fromInputRef} value={range.from} onChange={function (date) {
            handleDateChange(date, true);
        }}/>
                    {isRoundTrip && (<>
                        <div className="py-1 text-gray-400">-</div>
                        <date_input_1.default ref={toInputRef} value={range.to} onChange={function (date) {
                handleDateChange(date, false);
            }}/>
                      </>)}
                  </div>
                </div>
              </div>
              <div>
                {isRoundTrip ? (<calendar_1.Calendar mode="range" onSelect={function (value) {
                if ((value === null || value === void 0 ? void 0 : value.from) != null) {
                    var validFrom = isDateInPast(value.from)
                        ? getStartOfToday()
                        : value.from;
                    var validTo = value.to && isDateInPast(value.to)
                        ? getStartOfToday()
                        : value.to;
                    onUpdate === null || onUpdate === void 0 ? void 0 : onUpdate({
                        range: { from: validFrom, to: validTo },
                        isRoundTrip: isRoundTrip,
                    });
                }
            }} selected={range} numberOfMonths={isSmallScreen ? 1 : 2} defaultMonth={new Date(new Date().setMonth(new Date().getMonth() - (isSmallScreen ? 0 : 1)))} className="bg-gray-800 text-white" disabled={function (date) { return isDateInPast(date); }}/>) : (<calendar_1.Calendar mode="single" onSelect={function (value) {
                if (value) {
                    var validDate = isDateInPast(value)
                        ? getStartOfToday()
                        : value;
                    onUpdate === null || onUpdate === void 0 ? void 0 : onUpdate({
                        range: { from: validDate, to: undefined },
                        isRoundTrip: isRoundTrip,
                    });
                }
            }} selected={range.from} numberOfMonths={isSmallScreen ? 1 : 2} defaultMonth={new Date(new Date().setMonth(new Date().getMonth() - (isSmallScreen ? 0 : 1)))} className="bg-gray-800 text-white" disabled={function (date) { return isDateInPast(date); }}/>)}
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 py-2 pr-4 border-t border-gray-600">
          <button_1.Button onClick={function () {
            setIsOpen(false);
        }} className="bg-yellow-400 text-black hover:bg-yellow-500">
            Done
          </button_1.Button>
        </div>
      </popover_1.PopoverContent>
    </popover_1.Popover>);
};
exports.DateRangePicker = DateRangePicker;
exports.DateRangePicker.displayName = "DateRangePicker";
exports.DateRangePicker.filePath =
    "libs/shared/ui-kit/src/lib/date-range-picker/date-range-picker.tsx";
