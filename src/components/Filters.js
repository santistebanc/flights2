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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Filters = Filters;
var SearchContext_1 = require("../SearchContext");
var button_1 = require("./ui/button");
var date_range_picker_1 = require("./ui/date-range-picker");
var IataInput_1 = require("./flight-search/IataInput");
var react_1 = require("react");
var utils_1 = require("@/utils");
var useFlightSearchValidation_1 = require("../hooks/useFlightSearchValidation");
function Filters() {
    var _this = this;
    var _a = (0, SearchContext_1.useSearchContext)(), searchParams = _a.searchParams, setSearchParams = _a.setSearchParams;
    // Local state for filters
    var _b = (0, react_1.useState)(__assign(__assign({}, searchParams), { from: searchParams.from || "", to: searchParams.to || "", outboundDate: searchParams.outboundDate || (0, utils_1.getTodayAsString)(), inboundDate: searchParams.inboundDate || "" })), localFilters = _b[0], setLocalFilters = _b[1];
    // Use comprehensive validation hook
    var validation = (0, useFlightSearchValidation_1.useFlightSearchValidation)({
        from: localFilters.from,
        to: localFilters.to,
        outboundDate: localFilters.outboundDate,
        inboundDate: localFilters.inboundDate,
        isRoundTrip: localFilters.isRoundTrip,
    });
    var isSearchDisabled = !validation.isValid;
    var handleDateRangeUpdate = (0, react_1.useCallback)(function (values) {
        var updatedFilters = __assign(__assign({}, localFilters), { outboundDate: (0, utils_1.toPlainDateString)(values.range.from), inboundDate: values.isRoundTrip && values.range.to
                ? (0, utils_1.toPlainDateString)(values.range.to)
                : "", isRoundTrip: values.isRoundTrip });
        // Update local state
        setLocalFilters(updatedFilters);
        // Immediately save to localStorage
        setSearchParams(updatedFilters);
    }, [localFilters, setSearchParams]);
    return (<div className="px-4 py-3 border-t border-gray-700/50" style={{ position: "relative" }}>
      <div className="mx-auto">
        {/* Top Row: Airport inputs, date picker, search button */}
        <div className="flex gap-3 items-center mb-3">
          {/* IataInput components */}
          <div className="flex-1">
            <IataInput_1.IataInput placeholder="From" value={localFilters.from} onChange={function (value) {
            return setLocalFilters(function (prev) { return (__assign(__assign({}, prev), { from: value })); });
        }} required otherAirportValue={localFilters.to} error={validation.errors.from}/>
          </div>
          <div className="flex-1">
            <IataInput_1.IataInput placeholder="To" value={localFilters.to} onChange={function (value) {
            return setLocalFilters(function (prev) { return (__assign(__assign({}, prev), { to: value })); });
        }} required otherAirportValue={localFilters.from} error={validation.errors.to}/>
          </div>
          {/* DateRangePicker */}
          <div className="flex-1">
            <date_range_picker_1.DateRangePicker dateFrom={localFilters.outboundDate} dateTo={localFilters.inboundDate} isRoundTrip={localFilters.isRoundTrip} onUpdate={handleDateRangeUpdate}/>
          </div>
          <button_1.Button className={"flex-shrink-0 ".concat(isSearchDisabled
            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
            : "bg-yellow-400 text-black hover:bg-yellow-500")} onClick={function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                setSearchParams(localFilters);
                return [2 /*return*/];
            });
        }); }} disabled={isSearchDisabled} title={isSearchDisabled
            ? Object.values(validation.errors).filter(Boolean).join(", ") ||
                "Please fill in all required fields"
            : "Search for flights"}>
            Search
          </button_1.Button>
        </div>

        {/* Bottom Row: Results count and progress indicators */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-400">
            {/* Results count will be updated by parent component */}
            Ready to search
          </div>
          {validation.errors.general && (<div className="text-sm text-red-400">
              {validation.errors.general}
            </div>)}
        </div>
      </div>
    </div>);
}
