import React from "react";
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
      return <Clock className="h-3 w-3 text-gray-400" />;
    case "phase1":
    case "phase2":
      return <Loader2 className="h-3 w-3 text-blue-500 animate-spin" />;
    case "completed":
      return <CheckCircle className="h-3 w-3 text-green-500" />;
    case "error":
      return <XCircle className="h-3 w-3 text-red-500" />;
    default:
      return <Clock className="h-3 w-3 text-gray-400" />;
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
      return "Done";
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
    <div className={`flex items-center gap-6 ${className}`}>
      {sources.map((source) => (
        <div key={source.id} className="flex items-center gap-2 flex-1">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {getStatusIcon(source.data.status)}
            <span className="text-xs font-medium text-gray-300 truncate">
              {source.name}
            </span>
            <Badge
              variant="outline"
              className={`${getStatusColor(source.data.status)} text-white text-xs px-1 py-0.5`}
            >
              {getStatusText(source.data.status)}
            </Badge>
          </div>
          <div className="flex-1 min-w-0">
            <Progress
              value={getProgressPercentage(source.data.status)}
              className="h-1"
            />
          </div>
        </div>
      ))}
    </div>
  );
};
