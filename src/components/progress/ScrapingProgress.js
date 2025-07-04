"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrapingProgress = void 0;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var progress_1 = require("@/components/ui/progress");
var lucide_react_1 = require("lucide-react");
var getStatusIcon = function (status) {
    switch (status) {
        case "idle":
            return <lucide_react_1.Clock className="h-4 w-4 text-gray-400"/>;
        case "phase1":
        case "phase2":
            return <lucide_react_1.Loader2 className="h-4 w-4 text-blue-500 animate-spin"/>;
        case "completed":
            return <lucide_react_1.CheckCircle className="h-4 w-4 text-green-500"/>;
        case "error":
            return <lucide_react_1.XCircle className="h-4 w-4 text-red-500"/>;
        default:
            return <lucide_react_1.Clock className="h-4 w-4 text-gray-400"/>;
    }
};
var getStatusColor = function (status) {
    switch (status) {
        case "idle":
            return "bg-gray-500";
        case "phase1":
        case "phase2":
            return "bg-blue-500";
        case "completed":
            return "bg-green-500";
        case "error":
            return "bg-red-500";
        default:
            return "bg-gray-500";
    }
};
var getStatusText = function (status) {
    switch (status) {
        case "idle":
            return "Waiting";
        case "phase1":
            return "Phase 1";
        case "phase2":
            return "Phase 2";
        case "completed":
            return "Completed";
        case "error":
            return "Error";
        default:
            return "Unknown";
    }
};
var getProgressPercentage = function (status) {
    switch (status) {
        case "idle":
            return 0;
        case "phase1":
            return 25;
        case "phase2":
            return 75;
        case "completed":
            return 100;
        case "error":
            return 0;
        default:
            return 0;
    }
};
var ScrapingProgress = function (_a) {
    var progress = _a.progress, _b = _a.className, className = _b === void 0 ? "" : _b;
    var sources = [
        {
            id: "kiwi",
            name: "Kiwi",
            data: progress.kiwi,
        },
        {
            id: "skyscanner",
            name: "Skyscanner",
            data: progress.skyscanner,
        },
    ];
    return (<div className={"space-y-4 ".concat(className)}>
      <div className="text-center text-gray-400 mb-4">
        <h3 className="text-lg font-medium text-gray-300 mb-2">
          Searching for flights...
        </h3>
        <p className="text-sm text-gray-500">
          We're checking multiple sources to find the best deals
        </p>
      </div>

      <div className="space-y-4">
        {sources.map(function (source) { return (<card_1.Card key={source.id} className="bg-gray-800 border-gray-700">
            <card_1.CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(source.data.status)}
                  <div>
                    <h4 className="text-sm font-medium text-gray-300">
                      {source.name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {source.data.message || "Initializing..."}
                    </p>
                  </div>
                </div>
                <badge_1.Badge variant="outline" className={"".concat(getStatusColor(source.data.status), " text-white")}>
                  {getStatusText(source.data.status)}
                </badge_1.Badge>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <progress_1.Progress value={getProgressPercentage(source.data.status)} className="h-2"/>
              </div>

              {/* Additional Details */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  {source.data.status === "completed" &&
                source.data.recordsProcessed
                ? "".concat(source.data.recordsProcessed, " records found")
                : source.data.status === "error"
                    ? "Search failed"
                    : "Processing..."}
                </span>
                <span>
                  {source.data.status === "phase1" && "Initializing search..."}
                  {source.data.status === "phase2" && "Fetching results..."}
                  {source.data.status === "completed" && "Search complete"}
                  {source.data.status === "error" && "Failed"}
                </span>
              </div>
            </card_1.CardContent>
          </card_1.Card>); })}
      </div>

      {/* Overall Progress Summary */}
      <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-300">
            Overall Progress
          </span>
          <span className="text-xs text-gray-500">
            {sources.filter(function (s) { return s.data.status === "completed"; }).length} of{" "}
            {sources.length} sources complete
          </span>
        </div>
        <progress_1.Progress value={(sources.filter(function (s) { return s.data.status === "completed"; }).length /
            sources.length) *
            100} className="h-2"/>
        <p className="text-xs text-gray-500 mt-2">
          {sources.every(function (s) { return s.data.status === "completed"; })
            ? "All sources completed successfully"
            : sources.some(function (s) { return s.data.status === "error"; })
                ? "Some sources encountered errors"
                : "Searching in progress..."}
        </p>
      </div>
    </div>);
};
exports.ScrapingProgress = ScrapingProgress;
