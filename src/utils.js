"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cn = cn;
exports.toPlainDateString = toPlainDateString;
exports.getTodayAsString = getTodayAsString;
var clsx_1 = require("clsx");
var tailwind_merge_1 = require("tailwind-merge");
function cn() {
    var inputs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        inputs[_i] = arguments[_i];
    }
    return (0, tailwind_merge_1.twMerge)((0, clsx_1.clsx)(inputs));
}
function toPlainDateString(date) {
    if (!date)
        return "";
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, "0");
    var day = String(date.getDate()).padStart(2, "0");
    return "".concat(year, "-").concat(month, "-").concat(day);
}
function getTodayAsString() {
    var today = new Date();
    return toPlainDateString(today);
}
