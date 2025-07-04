"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Progress = void 0;
var React = require("react");
var Progress = React.forwardRef(function (_a, ref) {
    var _b = _a.className, className = _b === void 0 ? "" : _b, _c = _a.value, value = _c === void 0 ? 0 : _c, style = _a.style, props = __rest(_a, ["className", "value", "style"]);
    return (<div ref={ref} className={"relative h-4 w-full overflow-hidden rounded-full bg-gray-700 ".concat(className)} style={style} {...props}>
      <div className="h-full bg-yellow-500 transition-all duration-300 ease-out" style={{
            width: "".concat(Math.max(0, Math.min(100, value)), "%"),
            backgroundColor: (style === null || style === void 0 ? void 0 : style['--progress-background']) || '#eab308'
        }}/>
    </div>);
});
exports.Progress = Progress;
Progress.displayName = "Progress";
