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
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var DateInput = react_1.default.forwardRef(function (_a, ref) {
    var value = _a.value, onChange = _a.onChange;
    var _b = react_1.default.useState(function () {
        var d = value ? new Date(value) : new Date();
        return {
            day: d.getDate(),
            month: d.getMonth() + 1, // JavaScript months are 0-indexed
            year: d.getFullYear(),
        };
    }), date = _b[0], setDate = _b[1];
    var monthRef = (0, react_1.useRef)(null);
    var dayRef = (0, react_1.useRef)(null);
    var yearRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(function () {
        var d = value ? new Date(value) : new Date();
        setDate({
            day: d.getDate(),
            month: d.getMonth() + 1,
            year: d.getFullYear(),
        });
    }, [value]);
    var validateDate = function (field, value) {
        var _a;
        if ((field === "day" && (value < 1 || value > 31)) ||
            (field === "month" && (value < 1 || value > 12)) ||
            (field === "year" && (value < 1000 || value > 9999))) {
            return false;
        }
        // Validate the day of the month
        var newDate = __assign(__assign({}, date), (_a = {}, _a[field] = value, _a));
        var d = new Date(newDate.year, newDate.month - 1, newDate.day);
        return (d.getFullYear() === newDate.year &&
            d.getMonth() + 1 === newDate.month &&
            d.getDate() === newDate.day);
    };
    var handleInputChange = function (field) { return function (e) {
        var _a;
        var newValue = e.target.value ? Number(e.target.value) : "";
        var isValid = typeof newValue === "number" && validateDate(field, newValue);
        // If the new value is valid, update the date
        var newDate = __assign(__assign({}, date), (_a = {}, _a[field] = newValue, _a));
        setDate(newDate);
        // Do NOT call onChange here
    }; };
    var initialDate = (0, react_1.useRef)(date);
    var handleBlur = function (field) {
        return function (e) {
            var _a, _b;
            if (!e.target.value) {
                setDate(initialDate.current);
                return;
            }
            var newValue = Number(e.target.value);
            var isValid = validateDate(field, newValue);
            if (!isValid) {
                setDate(initialDate.current);
            }
            else {
                // If the new value is valid, update the initial value
                var newDate = __assign(__assign({}, date), (_a = {}, _a[field] = newValue, _a));
                var newDateObj = new Date(newDate.year, newDate.month - 1, newDate.day);
                var today = new Date();
                today.setHours(0, 0, 0, 0);
                if (newDateObj < today) {
                    // If it's in the past, use today's date instead
                    var todayParts = {
                        day: today.getDate(),
                        month: today.getMonth() + 1,
                        year: today.getFullYear(),
                    };
                    setDate(todayParts);
                    onChange(today);
                    initialDate.current = todayParts;
                }
                else {
                    setDate(newDate);
                    onChange(newDateObj);
                    initialDate.current = __assign(__assign({}, date), (_b = {}, _b[field] = newValue, _b));
                }
            }
        };
    };
    var handleKeyDown = function (field) {
        return function (e) {
            var _a, _b, _c, _d;
            // Allow command (or control) combinations
            if (e.metaKey || e.ctrlKey) {
                return;
            }
            // Prevent non-numeric characters, excluding allowed keys
            if (!/^[0-9]$/.test(e.key) &&
                ![
                    "ArrowUp",
                    "ArrowDown",
                    "ArrowLeft",
                    "ArrowRight",
                    "Delete",
                    "Tab",
                    "Backspace",
                    "Enter",
                ].includes(e.key)) {
                e.preventDefault();
                return;
            }
            if (e.key === "ArrowUp") {
                e.preventDefault();
                var newDate = __assign({}, date);
                if (field === "day") {
                    if (date[field] === new Date(date.year, date.month, 0).getDate()) {
                        newDate = __assign(__assign({}, newDate), { day: 1, month: (date.month % 12) + 1 });
                        if (newDate.month === 1)
                            newDate.year += 1;
                    }
                    else {
                        newDate.day += 1;
                    }
                }
                if (field === "month") {
                    if (date[field] === 12) {
                        newDate = __assign(__assign({}, newDate), { month: 1, year: date.year + 1 });
                    }
                    else {
                        newDate.month += 1;
                    }
                }
                if (field === "year") {
                    newDate.year += 1;
                }
                var newDateObj = new Date(newDate.year, newDate.month - 1, newDate.day);
                var today = new Date();
                today.setHours(0, 0, 0, 0);
                if (newDateObj >= today) {
                    setDate(newDate);
                    onChange(newDateObj);
                }
            }
            else if (e.key === "ArrowDown") {
                e.preventDefault();
                var newDate = __assign({}, date);
                if (field === "day") {
                    if (date[field] === 1) {
                        newDate.month -= 1;
                        if (newDate.month === 0) {
                            newDate.month = 12;
                            newDate.year -= 1;
                        }
                        newDate.day = new Date(newDate.year, newDate.month, 0).getDate();
                    }
                    else {
                        newDate.day -= 1;
                    }
                }
                if (field === "month") {
                    if (date[field] === 1) {
                        newDate = __assign(__assign({}, newDate), { month: 12, year: date.year - 1 });
                    }
                    else {
                        newDate.month -= 1;
                    }
                }
                if (field === "year") {
                    newDate.year -= 1;
                }
                var newDateObj = new Date(newDate.year, newDate.month - 1, newDate.day);
                var today = new Date();
                today.setHours(0, 0, 0, 0);
                if (newDateObj >= today) {
                    setDate(newDate);
                    onChange(newDateObj);
                }
            }
            if (e.key === "ArrowRight") {
                if (e.currentTarget.selectionStart === e.currentTarget.value.length ||
                    (e.currentTarget.selectionStart === 0 &&
                        e.currentTarget.selectionEnd === e.currentTarget.value.length)) {
                    e.preventDefault();
                    if (field === "month")
                        (_a = dayRef.current) === null || _a === void 0 ? void 0 : _a.focus();
                    if (field === "day")
                        (_b = yearRef.current) === null || _b === void 0 ? void 0 : _b.focus();
                }
            }
            else if (e.key === "ArrowLeft") {
                if (e.currentTarget.selectionStart === 0 ||
                    (e.currentTarget.selectionStart === 0 &&
                        e.currentTarget.selectionEnd === e.currentTarget.value.length)) {
                    e.preventDefault();
                    if (field === "day")
                        (_c = monthRef.current) === null || _c === void 0 ? void 0 : _c.focus();
                    if (field === "year")
                        (_d = dayRef.current) === null || _d === void 0 ? void 0 : _d.focus();
                }
            }
        };
    };
    // Expose the day input ref to parent
    (0, react_1.useImperativeHandle)(ref, function () { return dayRef.current; });
    return (<div className="flex border border-gray-600 rounded-md bg-gray-700 items-center text-sm px-2 py-1 text-white shadow-sm transition-colors focus-within:border-yellow-400 focus-within:ring-1 focus-within:ring-yellow-400">
        <input type="text" ref={dayRef} max={31} maxLength={2} value={date.day.toString()} onChange={handleInputChange("day")} onKeyDown={handleKeyDown("day")} onFocus={function (e) {
            if (window.innerWidth > 1024) {
                e.target.select();
            }
        }} onBlur={handleBlur("day")} className="p-0 outline-none w-7 border-none text-center bg-transparent text-white placeholder:text-gray-400" placeholder="D"/>
        <span className="opacity-40 -mx-px text-gray-400">/</span>
        <input type="text" ref={monthRef} max={12} maxLength={2} value={date.month.toString()} onChange={handleInputChange("month")} onKeyDown={handleKeyDown("month")} onFocus={function (e) {
            if (window.innerWidth > 1024) {
                e.target.select();
            }
        }} onBlur={handleBlur("month")} className="p-0 outline-none w-6 border-none text-center bg-transparent text-white placeholder:text-gray-400" placeholder="M"/>
        <span className="opacity-40 -mx-px text-gray-400">/</span>
        <input type="text" ref={yearRef} max={9999} maxLength={4} value={date.year.toString()} onChange={handleInputChange("year")} onKeyDown={handleKeyDown("year")} onFocus={function (e) {
            if (window.innerWidth > 1024) {
                e.target.select();
            }
        }} onBlur={handleBlur("year")} className="p-0 outline-none w-12 border-none text-center bg-transparent text-white placeholder:text-gray-400" placeholder="YYYY"/>
      </div>);
});
exports.default = DateInput;
