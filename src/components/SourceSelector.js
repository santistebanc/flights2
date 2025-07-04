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
exports.SourceSelector = SourceSelector;
var SearchContext_1 = require("../SearchContext");
var switch_1 = require("./ui/switch");
var label_1 = require("./ui/label");
var card_1 = require("./ui/card");
function SourceSelector() {
    var _a;
    var _b = (0, SearchContext_1.useSearchContext)(), searchParams = _b.searchParams, setSearchParams = _b.setSearchParams;
    // Defensive: fallback to empty array if sources is undefined
    var sources = (_a = searchParams.sources) !== null && _a !== void 0 ? _a : [];
    var handleSourceToggle = function (sourceId, enabled) {
        setSearchParams(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), { sources: ((_a = prev.sources) !== null && _a !== void 0 ? _a : []).map(function (source) {
                    return source.id === sourceId ? __assign(__assign({}, source), { enabled: enabled }) : source;
                }) }));
        });
    };
    var enabledSourcesCount = sources.filter(function (s) { return s.enabled; }).length;
    return (<card_1.Card className="bg-gray-800 border-gray-700">
      <card_1.CardHeader className="pb-3">
        <card_1.CardTitle className="text-sm font-medium text-white">
          Data Sources ({enabledSourcesCount}/{sources.length})
        </card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-3">
        {sources.map(function (source) { return (<div key={source.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <switch_1.Switch id={"source-".concat(source.id)} checked={source.enabled} onCheckedChange={function (enabled) { return handleSourceToggle(source.id, enabled); }} className="data-[state=checked]:bg-yellow-500"/>
              <label_1.Label htmlFor={"source-".concat(source.id)} className="text-sm text-gray-300 cursor-pointer">
                {source.name}
              </label_1.Label>
            </div>
            <div className="flex items-center space-x-2">
              <div className={"w-2 h-2 rounded-full ".concat(source.enabled ? 'bg-green-400' : 'bg-gray-500')}/>
              <span className="text-xs text-gray-400">
                {source.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>); })}
        <div className="text-xs text-gray-500 pt-2 border-t border-gray-700">
          Select which sources to search for flights. More sources may provide more results but take longer to search.
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
