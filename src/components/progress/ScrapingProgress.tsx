import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";

interface ScrapingProgressProps {
  session?: {
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
  } | null;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-3 w-3 text-green-500" />;
    case "error":
      return <XCircle className="h-3 w-3 text-red-500" />;
    case "idle":
      return <Clock className="h-3 w-3 text-muted-foreground" />;
    case "phase1":
    case "phase2":
      return <Loader2 className="h-3 w-3 text-blue-500 animate-spin" />;
    default:
      return <Clock className="h-3 w-3 text-muted-foreground" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return (
        <Badge variant="success" className="text-xs px-1.5 py-0.5">
          Done
        </Badge>
      );
    case "error":
      return (
        <Badge variant="error" className="text-xs px-1.5 py-0.5">
          Error
        </Badge>
      );
    case "idle":
      return (
        <Badge variant="outline" className="text-xs px-1.5 py-0.5">
          Idle
        </Badge>
      );
    case "phase1":
      return (
        <Badge variant="outline" className="text-xs px-1.5 py-0.5">
          Phase 1
        </Badge>
      );
    case "phase2":
      return (
        <Badge variant="outline" className="text-xs px-1.5 py-0.5">
          Phase 2
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-xs px-1.5 py-0.5">
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
      return "bg-muted-foreground";
  }
};

const CompactProgressBar = ({
  value,
  status,
}: {
  value: number;
  status: string;
}) => {
  return (
    <div className="w-24 bg-muted rounded-full h-1.5">
      <div
        className={`h-1.5 rounded-full transition-all duration-300 ${getProgressColor(status)}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

export const ScrapingProgress: React.FC<ScrapingProgressProps> = ({
  session,
}) => {
  return (
    <Card className="mb-4">
      <CardContent className="py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Overall Status */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              Search Progress:
            </span>
            <Badge
              variant={
                session?.status === "completed"
                  ? "success"
                  : session?.status === "failed"
                    ? "error"
                    : session?.status === "partial_success"
                      ? "warning"
                      : "secondary"
              }
              className="text-xs"
            >
              {session?.status === "in_progress"
                ? "In Progress"
                : session?.status === "completed"
                  ? "Completed"
                  : session?.status === "failed"
                    ? "Failed"
                    : session?.status === "partial_success"
                      ? "Partial Success"
                      : "Pending"}
            </Badge>
          </div>

          {/* Kiwi and Skyscanner Progress */}
          <div className="flex items-center gap-6">
            {/* Kiwi */}
            <div className="flex items-center gap-2">
              {getStatusIcon(session?.kiwiStatus || "idle")}
              <span className="text-sm text-foreground">Kiwi</span>
              <CompactProgressBar
                value={getProgressValue(session?.kiwiStatus || "idle")}
                status={session?.kiwiStatus || "idle"}
              />
              {getStatusBadge(session?.kiwiStatus || "idle")}
              {session?.kiwiRecordsProcessed && (
                <span className="text-xs text-muted-foreground">
                  {session?.kiwiRecordsProcessed}
                </span>
              )}
            </div>

            {/* Skyscanner */}
            <div className="flex items-center gap-2">
              {getStatusIcon(session?.skyscannerStatus || "idle")}
              <span className="text-sm text-foreground">Skyscanner</span>
              <CompactProgressBar
                value={getProgressValue(session?.skyscannerStatus || "idle")}
                status={session?.skyscannerStatus || "idle"}
              />
              {getStatusBadge(session?.skyscannerStatus || "idle")}
              {session?.skyscannerRecordsProcessed && (
                <span className="text-xs text-muted-foreground">
                  {session?.skyscannerRecordsProcessed}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Show errors if any */}
        {(session?.kiwiError || session?.skyscannerError) && (
          <div className="mt-2 text-xs text-red-500 dark:text-red-400 space-y-1">
            {session?.kiwiError && <div>Kiwi: {session?.kiwiError}</div>}
            {session?.skyscannerError && (
              <div>Skyscanner: {session.skyscannerError}</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
