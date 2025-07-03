import { FlightSearchParams } from "../types/scraper";

export interface ScrapingLogger {
  logStart(source: string, searchParams: FlightSearchParams): Promise<string>;
  logSuccess(
    logId: string,
    recordsProcessed: number,
    message?: string
  ): Promise<void>;
  logError(
    logId: string,
    errorMessage: string,
    errorDetails?: string,
    phase?: string
  ): Promise<void>;
  logFailure(
    logId: string,
    errorMessage: string,
    errorDetails?: string
  ): Promise<void>;
  getRecentLogs(limit?: number): Promise<ScrapingLogEntry[]>;
  getLogsBySource(source: string, limit?: number): Promise<ScrapingLogEntry[]>;
  getErrorLogs(limit?: number): Promise<ScrapingLogEntry[]>;
  getStats(hours?: number): Promise<ScrapingStats>;
  cleanupOldLogs(daysToKeep?: number): Promise<number>;
}

export interface ScrapingLogEntry {
  _id: string;
  _creationTime: number;
  source: string;
  status: "started" | "success" | "error" | "failed";
  message: string;
  errorDetails?: string;
  startTime: number;
  endTime?: number;
  recordsProcessed?: number;
  searchParams?: string;
}

export interface ScrapingStats {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  errorOperations: number;
  totalRecordsProcessed: number;
  averageRecordsPerSuccess: number;
  successRate: number;
  sources: Array<{
    source: string;
    totalOperations: number;
    successfulOperations: number;
    failedOperations: number;
    errorOperations: number;
    totalRecordsProcessed: number;
    successRate: number;
  }>;
}

/**
 * Convex-based scraping logger implementation.
 * This integrates with the Convex scraping logs functions.
 */
export class ConvexScrapingLogger implements ScrapingLogger {
  private convex: any; // Convex client

  constructor(convex: any) {
    this.convex = convex;
  }

  async logStart(
    source: string,
    searchParams: FlightSearchParams
  ): Promise<string> {
    const searchParamsJson = JSON.stringify(searchParams);
    const logId = await this.convex.mutation("scraping-logs:logScrapingStart", {
      source,
      searchParams: searchParamsJson,
    });
    return logId;
  }

  async logSuccess(
    logId: string,
    recordsProcessed: number,
    message?: string
  ): Promise<void> {
    await this.convex.mutation("scraping-logs:logScrapingSuccess", {
      logId,
      recordsProcessed,
      message,
    });
  }

  async logError(
    logId: string,
    errorMessage: string,
    errorDetails?: string,
    phase?: string
  ): Promise<void> {
    await this.convex.mutation("scraping-logs:logScrapingError", {
      logId,
      errorMessage,
      errorDetails,
      phase,
    });
  }

  async logFailure(
    logId: string,
    errorMessage: string,
    errorDetails?: string
  ): Promise<void> {
    await this.convex.mutation("scraping-logs:logScrapingFailure", {
      logId,
      errorMessage,
      errorDetails,
    });
  }

  async getRecentLogs(limit?: number): Promise<ScrapingLogEntry[]> {
    return await this.convex.query("scraping-logs:getRecentScrapingLogs", {
      limit,
    });
  }

  async getLogsBySource(
    source: string,
    limit?: number
  ): Promise<ScrapingLogEntry[]> {
    return await this.convex.query("scraping-logs:getScrapingLogsBySource", {
      source,
      limit,
    });
  }

  async getErrorLogs(limit?: number): Promise<ScrapingLogEntry[]> {
    return await this.convex.query("scraping-logs:getErrorLogs", { limit });
  }

  async getStats(hours?: number): Promise<ScrapingStats> {
    return await this.convex.query("scraping-logs:getScrapingStats", { hours });
  }

  async cleanupOldLogs(daysToKeep?: number): Promise<number> {
    return await this.convex.mutation("scraping-logs:cleanupOldLogs", {
      daysToKeep,
    });
  }
}

/**
 * Mock scraping logger for testing purposes.
 */
export class MockScrapingLogger implements ScrapingLogger {
  private logs: Map<string, any> = new Map();

  async logStart(
    source: string,
    searchParams: FlightSearchParams
  ): Promise<string> {
    const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.logs.set(logId, {
      source,
      status: "started",
      message: `Scraping started for ${source}`,
      startTime: Date.now(),
      searchParams: JSON.stringify(searchParams),
    });
    return logId;
  }

  async logSuccess(
    logId: string,
    recordsProcessed: number,
    message?: string
  ): Promise<void> {
    const log = this.logs.get(logId);
    if (log) {
      log.status = "success";
      log.message =
        message ||
        `Scraping completed successfully for ${recordsProcessed} records`;
      log.endTime = Date.now();
      log.recordsProcessed = recordsProcessed;
    }
  }

  async logError(
    logId: string,
    errorMessage: string,
    errorDetails?: string,
    phase?: string
  ): Promise<void> {
    const log = this.logs.get(logId);
    if (log) {
      log.status = "error";
      log.message = phase
        ? `Scraping error in ${phase}: ${errorMessage}`
        : `Scraping error: ${errorMessage}`;
      log.errorDetails = errorDetails;
      log.endTime = Date.now();
    }
  }

  async logFailure(
    logId: string,
    errorMessage: string,
    errorDetails?: string
  ): Promise<void> {
    const log = this.logs.get(logId);
    if (log) {
      log.status = "failed";
      log.message = `Scraping failed: ${errorMessage}`;
      log.errorDetails = errorDetails;
      log.endTime = Date.now();
    }
  }

  getLogs(): Map<string, any> {
    return this.logs;
  }

  clearLogs(): void {
    this.logs.clear();
  }

  async getRecentLogs(limit?: number): Promise<ScrapingLogEntry[]> {
    const logs = Array.from(this.logs.entries()).map(([id, log]) => ({
      _id: id,
      _creationTime: log.startTime,
      ...log,
    }));
    // Sort by startTime descending (most recent first)
    logs.sort((a, b) => b.startTime - a.startTime);
    return logs.slice(0, limit || 50);
  }

  async getLogsBySource(
    source: string,
    limit?: number
  ): Promise<ScrapingLogEntry[]> {
    const logs = Array.from(this.logs.entries())
      .filter(([_, log]) => log.source === source)
      .map(([id, log]) => ({
        _id: id,
        _creationTime: log.startTime,
        ...log,
      }));
    return logs.slice(0, limit || 50);
  }

  async getErrorLogs(limit?: number): Promise<ScrapingLogEntry[]> {
    const logs = Array.from(this.logs.entries())
      .filter(([_, log]) => log.status === "error" || log.status === "failed")
      .map(([id, log]) => ({
        _id: id,
        _creationTime: log.startTime,
        ...log,
      }));
    return logs.slice(0, limit || 20);
  }

  async getStats(hours?: number): Promise<ScrapingStats> {
    const timeWindow = hours || 24;
    const cutoffTime = Date.now() - timeWindow * 60 * 60 * 1000;

    const logs = Array.from(this.logs.values()).filter(
      (log) => log.startTime >= cutoffTime
    );

    const stats = {
      totalOperations: logs.length,
      successfulOperations: logs.filter((log) => log.status === "success")
        .length,
      failedOperations: logs.filter((log) => log.status === "failed").length,
      errorOperations: logs.filter((log) => log.status === "error").length,
      totalRecordsProcessed: logs.reduce(
        (sum, log) => sum + (log.recordsProcessed || 0),
        0
      ),
      averageRecordsPerSuccess: 0,
      successRate: 0,
      sources: [] as any[],
    };

    const successfulLogs = logs.filter((log) => log.status === "success");
    if (successfulLogs.length > 0) {
      stats.averageRecordsPerSuccess =
        stats.totalRecordsProcessed / successfulLogs.length;
    }

    if (stats.totalOperations > 0) {
      stats.successRate = stats.successfulOperations / stats.totalOperations;
    }

    const sourceMap = new Map<string, any>();
    for (const log of logs) {
      if (!sourceMap.has(log.source)) {
        sourceMap.set(log.source, {
          source: log.source,
          totalOperations: 0,
          successfulOperations: 0,
          failedOperations: 0,
          errorOperations: 0,
          totalRecordsProcessed: 0,
          successRate: 0,
        });
      }

      const sourceStats = sourceMap.get(log.source)!;
      sourceStats.totalOperations++;

      if (log.status === "success") {
        sourceStats.successfulOperations++;
        sourceStats.totalRecordsProcessed += log.recordsProcessed || 0;
      } else if (log.status === "failed") {
        sourceStats.failedOperations++;
      } else if (log.status === "error") {
        sourceStats.errorOperations++;
      }
    }

    for (const sourceStats of sourceMap.values()) {
      if (sourceStats.totalOperations > 0) {
        sourceStats.successRate =
          sourceStats.successfulOperations / sourceStats.totalOperations;
      }
    }

    stats.sources = Array.from(sourceMap.values());
    return stats;
  }

  async cleanupOldLogs(daysToKeep?: number): Promise<number> {
    const days = daysToKeep || 30;
    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;

    let deletedCount = 0;
    for (const [id, log] of this.logs.entries()) {
      if (log.startTime < cutoffTime) {
        this.logs.delete(id);
        deletedCount++;
      }
    }

    return deletedCount;
  }
}

/**
 * Error monitoring and alerting utilities.
 */
export class ScrapingErrorMonitor {
  private logger: ScrapingLogger;
  private errorThreshold: number;
  private timeWindow: number; // in milliseconds

  constructor(
    logger: ScrapingLogger,
    errorThreshold: number = 5,
    timeWindow: number = 60 * 60 * 1000
  ) {
    this.logger = logger;
    this.errorThreshold = errorThreshold;
    this.timeWindow = timeWindow;
  }

  /**
   * Check if error rate exceeds threshold and should trigger alerts.
   */
  async shouldAlert(source?: string): Promise<boolean> {
    const stats = await this.logger.getStats(1); // Last hour

    if (source) {
      const sourceStats = stats.sources.find((s) => s.source === source);
      if (!sourceStats) return false;

      return (
        sourceStats.totalOperations > 0 &&
        (sourceStats.errorOperations + sourceStats.failedOperations) /
          sourceStats.totalOperations >
          this.errorThreshold / 100
      );
    }

    return (
      stats.totalOperations > 0 &&
      (stats.errorOperations + stats.failedOperations) / stats.totalOperations >
        this.errorThreshold / 100
    );
  }

  /**
   * Get error summary for monitoring dashboard.
   */
  async getErrorSummary(): Promise<{
    totalErrors: number;
    errorRate: number;
    recentErrors: ScrapingLogEntry[];
    sourcesWithErrors: string[];
  }> {
    const stats = await this.logger.getStats(24); // Last 24 hours
    const errorLogs = await this.logger.getErrorLogs(10);

    const sourcesWithErrors = stats.sources
      .filter((s) => s.errorOperations > 0 || s.failedOperations > 0)
      .map((s) => s.source);

    return {
      totalErrors: stats.errorOperations + stats.failedOperations,
      errorRate:
        stats.totalOperations > 0
          ? (stats.errorOperations + stats.failedOperations) /
            stats.totalOperations
          : 0,
      recentErrors: errorLogs,
      sourcesWithErrors,
    };
  }
}

/**
 * Performance monitoring utilities.
 */
export class ScrapingPerformanceMonitor {
  private logger: ScrapingLogger;

  constructor(logger: ScrapingLogger) {
    this.logger = logger;
  }

  /**
   * Get performance metrics for scraping operations.
   */
  async getPerformanceMetrics(hours: number = 24): Promise<{
    averageDuration: number;
    totalRecordsProcessed: number;
    recordsPerHour: number;
    successRate: number;
    sourcePerformance: Array<{
      source: string;
      averageDuration: number;
      recordsProcessed: number;
      successRate: number;
    }>;
  }> {
    const stats = await this.logger.getStats(hours);
    const logs = await this.logger.getRecentLogs(1000); // Get more logs for detailed analysis

    // Calculate average duration
    const completedLogs = logs.filter((log) => log.endTime && log.startTime);
    const totalDuration = completedLogs.reduce(
      (sum, log) => sum + (log.endTime! - log.startTime),
      0
    );
    const averageDuration =
      completedLogs.length > 0 ? totalDuration / completedLogs.length : 0;

    // Calculate records per hour
    const recordsPerHour = hours > 0 ? stats.totalRecordsProcessed / hours : 0;

    // Calculate per-source performance
    const sourcePerformance = stats.sources.map((source) => {
      const sourceLogs = completedLogs.filter(
        (log) => log.source === source.source
      );
      const sourceDuration = sourceLogs.reduce(
        (sum, log) => sum + (log.endTime! - log.startTime),
        0
      );
      const sourceAvgDuration =
        sourceLogs.length > 0 ? sourceDuration / sourceLogs.length : 0;

      return {
        source: source.source,
        averageDuration: sourceAvgDuration,
        recordsProcessed: source.totalRecordsProcessed,
        successRate: source.successRate,
      };
    });

    return {
      averageDuration,
      totalRecordsProcessed: stats.totalRecordsProcessed,
      recordsPerHour,
      successRate: stats.successRate,
      sourcePerformance,
    };
  }
}
