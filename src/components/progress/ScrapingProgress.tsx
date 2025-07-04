import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { ScrapingProgress as ScrapingProgressType } from "../../hooks/useFlightSearch";

interface ScrapingProgressProps {
  progress: ScrapingProgressType;
  className?: string;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "idle":
      return <Clock className="h-4 w-4 text-gray-400" />;
    case "phase1":
    case "phase2":
      return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
    case "completed":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "error":
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-400" />;
  }
};

const getStatusColor = (status: string) => {
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

const getStatusText = (status: string) => {
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

const getProgressPercentage = (status: string) => {
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

export const ScrapingProgress: React.FC<ScrapingProgressProps> = ({
  progress,
  className = "",
}) => {
  const sources = [
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

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center text-gray-400 mb-4">
        <h3 className="text-lg font-medium text-gray-300 mb-2">
          Searching for flights...
        </h3>
        <p className="text-sm text-gray-500">
          We're checking multiple sources to find the best deals
        </p>
      </div>

      <div className="space-y-4">
        {sources.map((source) => (
          <Card key={source.id} className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
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
                <Badge
                  variant="outline"
                  className={`${getStatusColor(source.data.status)} text-white`}
                >
                  {getStatusText(source.data.status)}
                </Badge>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <Progress
                  value={getProgressPercentage(source.data.status)}
                  className="h-2"
                />
              </div>

              {/* Additional Details */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  {source.data.status === "completed" &&
                  source.data.recordsProcessed
                    ? `${source.data.recordsProcessed} records found`
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
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Overall Progress Summary */}
      <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-300">
            Overall Progress
          </span>
          <span className="text-xs text-gray-500">
            {sources.filter((s) => s.data.status === "completed").length} of{" "}
            {sources.length} sources complete
          </span>
        </div>
        <Progress
          value={
            (sources.filter((s) => s.data.status === "completed").length /
              sources.length) *
            100
          }
          className="h-2"
        />
        <p className="text-xs text-gray-500 mt-2">
          {sources.every((s) => s.data.status === "completed")
            ? "All sources completed successfully"
            : sources.some((s) => s.data.status === "error")
              ? "Some sources encountered errors"
              : "Searching in progress..."}
        </p>
      </div>
    </div>
  );
};
