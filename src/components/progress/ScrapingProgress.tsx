import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";

interface ScrapingProgressProps {
  session: {
    _id: string;
    status:
      | "pending"
      | "in_progress"
      | "completed"
      | "failed"
      | "partial_success";
    kiwiStatus: "idle" | "phase1" | "phase2" | "completed" | "error";
    kiwiMessage: string;
    kiwiRecordsProcessed?: number;
    kiwiError?: string;
    skyscannerStatus: "idle" | "phase1" | "phase2" | "completed" | "error";
    skyscannerMessage: string;
    skyscannerRecordsProcessed?: number;
    skyscannerError?: string;
    createdAt: number;
    updatedAt: number;
    completedAt?: number;
  };
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-4 w-4 text-green-400" />;
    case "error":
      return <XCircle className="h-4 w-4 text-red-400" />;
    case "idle":
      return <Clock className="h-4 w-4 text-gray-400" />;
    case "phase1":
    case "phase2":
      return <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />;
    default:
      return <Clock className="h-4 w-4 text-gray-400" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return (
        <Badge
          variant="default"
          className="bg-green-600 text-white border-green-500"
        >
          Completed
        </Badge>
      );
    case "error":
      return (
        <Badge
          variant="default"
          className="bg-red-700 text-white border-red-600"
        >
          Error
        </Badge>
      );
    case "idle":
      return (
        <Badge
          variant="outline"
          className="bg-gray-800 text-gray-200 border-gray-600"
        >
          Idle
        </Badge>
      );
    case "phase1":
      return (
        <Badge
          variant="outline"
          className="bg-blue-800 text-blue-200 border-blue-600"
        >
          Phase 1
        </Badge>
      );
    case "phase2":
      return (
        <Badge
          variant="outline"
          className="bg-blue-800 text-blue-200 border-blue-600"
        >
          Phase 2
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="bg-gray-800 text-gray-200 border-gray-600"
        >
          Unknown
        </Badge>
      );
  }
};

const getProgressValue = (status: string) => {
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
      return 100;
    default:
      return 0;
  }
};

const getProgressColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-500";
    case "error":
      return "bg-red-500";
    case "phase1":
    case "phase2":
      return "bg-blue-500";
    default:
      return "bg-gray-500";
  }
};

const CustomProgressBar = ({
  value,
  status,
}: {
  value: number;
  status: string;
}) => {
  return (
    <div className="w-full bg-gray-700 rounded-full h-2">
      <div
        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(status)}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

const getOverallStatus = (kiwiStatus: string, skyscannerStatus: string) => {
  const kiwiDone = kiwiStatus === "completed" || kiwiStatus === "error";
  const skyscannerDone =
    skyscannerStatus === "completed" || skyscannerStatus === "error";

  if (kiwiDone && skyscannerDone) {
    const kiwiSuccess = kiwiStatus === "completed";
    const skyscannerSuccess = skyscannerStatus === "completed";

    if (kiwiSuccess && skyscannerSuccess) {
      return "Both sources completed successfully";
    } else if (kiwiSuccess || skyscannerSuccess) {
      return "Partial success - one source completed";
    } else {
      return "Both sources failed";
    }
  } else {
    return "Scraping in progress...";
  }
};

export const ScrapingProgress: React.FC<ScrapingProgressProps> = ({
  session,
}) => {
  const overallStatus = getOverallStatus(
    session.kiwiStatus,
    session.skyscannerStatus
  );

  return (
    <Card className="mb-4 bg-gray-900 border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-gray-100">
            Scraping Progress
          </CardTitle>
          <Badge
            variant={
              session.status === "completed"
                ? "default"
                : session.status === "failed"
                  ? "default"
                  : session.status === "partial_success"
                    ? "default"
                    : "outline"
            }
            className={
              session.status === "completed"
                ? "bg-green-600 text-white border-green-500"
                : session.status === "failed"
                  ? "bg-red-700 text-white border-red-600"
                  : session.status === "partial_success"
                    ? "bg-yellow-800 text-white border-yellow-700"
                    : "bg-gray-800 text-gray-200 border-gray-600"
            }
          >
            {session.status === "in_progress"
              ? "In Progress"
              : session.status === "completed"
                ? "Completed"
                : session.status === "failed"
                  ? "Failed"
                  : session.status === "partial_success"
                    ? "Partial Success"
                    : "Pending"}
          </Badge>
        </div>
        <p className="text-sm text-gray-300">{overallStatus}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Kiwi Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(session.kiwiStatus)}
              <span className="font-medium text-gray-200">Kiwi</span>
              {getStatusBadge(session.kiwiStatus)}
            </div>
            {session.kiwiRecordsProcessed && (
              <span className="text-sm text-gray-400">
                {session.kiwiRecordsProcessed} records
              </span>
            )}
          </div>
          <CustomProgressBar
            value={getProgressValue(session.kiwiStatus)}
            status={session.kiwiStatus}
          />
          <p className="text-sm text-gray-300">
            {session.kiwiMessage || "Waiting to start..."}
          </p>
          {session.kiwiError && (
            <p className="text-sm text-red-300 bg-red-900/30 p-2 rounded border border-red-800">
              Error: {session.kiwiError}
            </p>
          )}
        </div>

        {/* Skyscanner Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(session.skyscannerStatus)}
              <span className="font-medium text-gray-200">Skyscanner</span>
              {getStatusBadge(session.skyscannerStatus)}
            </div>
            {session.skyscannerRecordsProcessed && (
              <span className="text-sm text-gray-400">
                {session.skyscannerRecordsProcessed} records
              </span>
            )}
          </div>
          <CustomProgressBar
            value={getProgressValue(session.skyscannerStatus)}
            status={session.skyscannerStatus}
          />
          <p className="text-sm text-gray-300">
            {session.skyscannerMessage || "Waiting to start..."}
          </p>
          {session.skyscannerError && (
            <p className="text-sm text-red-300 bg-red-900/30 p-2 rounded border border-red-800">
              Error: {session.skyscannerError}
            </p>
          )}
        </div>

        {/* Session Info */}
        <div className="pt-2 border-t border-gray-700 text-xs text-gray-400">
          <div className="flex justify-between">
            <span>Started: {new Date(session.createdAt).toLocaleString()}</span>
            <span>Updated: {new Date(session.updatedAt).toLocaleString()}</span>
          </div>
          {session.completedAt && (
            <div className="mt-1">
              <span>
                Completed: {new Date(session.completedAt).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
