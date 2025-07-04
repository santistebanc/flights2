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
exports.Badge = void 0;
var React = require("react");
var Badge = React.forwardRef(function (_a, ref) {
    var _b = _a.variant, variant = _b === void 0 ? 'default' : _b, _c = _a.className, className = _c === void 0 ? "" : _c, children = _a.children, props = __rest(_a, ["variant", "className", "children"]);
    var baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
    var variantClasses = {
        default: "bg-yellow-500 text-gray-900",
        outline: "border border-gray-600 text-gray-300"
    };
    return (<div ref={ref} className={"".concat(baseClasses, " ").concat(variantClasses[variant], " ").concat(className)} {...props}>
        {children}
      </div>);
});
exports.Badge = Badge;
Badge.displayName = "Badge";
