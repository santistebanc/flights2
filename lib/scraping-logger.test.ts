import {
  MockScrapingLogger,
  ScrapingErrorMonitor,
  ScrapingPerformanceMonitor,
} from "./scraping-logger";
import { FlightSearchParams } from "../types/scraper";

describe("MockScrapingLogger", () => {
  let logger: MockScrapingLogger;
  let searchParams: FlightSearchParams;

  beforeEach(() => {
    logger = new MockScrapingLogger();
    searchParams = {
      departureAirport: "LAX",
      arrivalAirport: "JFK",
      departureDate: new Date("2024-01-15"),
      returnDate: new Date("2024-01-20"),
      isRoundTrip: true,
    };
  });

  describe("logStart", () => {
    it("should create a new log entry with started status", async () => {
      const logId = await logger.logStart("kiwi", searchParams);

      expect(logId).toBeDefined();
      expect(logId).toMatch(/^log_\d+_[a-z0-9]+$/);

      const logs = await logger.getRecentLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        source: "kiwi",
        status: "started",
        message: "Scraping started for kiwi",
        searchParams: JSON.stringify(searchParams),
      });
    });
  });

  describe("logSuccess", () => {
    it("should update log entry with success status and records count", async () => {
      const logId = await logger.logStart("skyscanner", searchParams);
      await logger.logSuccess(logId, 25, "Successfully scraped 25 flights");

      const logs = await logger.getRecentLogs();
      expect(logs[0]).toMatchObject({
        status: "success",
        message: "Successfully scraped 25 flights",
        recordsProcessed: 25,
      });
      expect(logs[0].endTime).toBeDefined();
    });

    it("should use default message when none provided", async () => {
      const logId = await logger.logStart("kiwi", searchParams);
      await logger.logSuccess(logId, 10);

      const logs = await logger.getRecentLogs();
      expect(logs[0].message).toBe(
        "Scraping completed successfully for 10 records"
      );
    });
  });

  describe("logError", () => {
    it("should update log entry with error status and details", async () => {
      const logId = await logger.logStart("skyscanner", searchParams);
      await logger.logError(
        logId,
        "Network timeout",
        "Connection failed after 30s",
        "phase1"
      );

      const logs = await logger.getRecentLogs();
      expect(logs[0]).toMatchObject({
        status: "error",
        message: "Scraping error in phase1: Network timeout",
        errorDetails: "Connection failed after 30s",
      });
      expect(logs[0].endTime).toBeDefined();
    });

    it("should handle error without phase", async () => {
      const logId = await logger.logStart("kiwi", searchParams);
      await logger.logError(logId, "Invalid response format");

      const logs = await logger.getRecentLogs();
      expect(logs[0].message).toBe("Scraping error: Invalid response format");
    });
  });

  describe("logFailure", () => {
    it("should update log entry with failed status", async () => {
      const logId = await logger.logStart("skyscanner", searchParams);
      await logger.logFailure(
        logId,
        "Complete scraping failure",
        "All phases failed"
      );

      const logs = await logger.getRecentLogs();
      expect(logs[0]).toMatchObject({
        status: "failed",
        message: "Scraping failed: Complete scraping failure",
        errorDetails: "All phases failed",
      });
      expect(logs[0].endTime).toBeDefined();
    });
  });

  describe("getRecentLogs", () => {
    it("should return logs in descending order", async () => {
      await logger.logStart("kiwi", searchParams);
      await new Promise((resolve) => setTimeout(resolve, 10)); // Ensure different timestamps
      await logger.logStart("skyscanner", searchParams);

      const logs = await logger.getRecentLogs();
      expect(logs).toHaveLength(2);
      expect(logs[0].source).toBe("skyscanner"); // Most recent first
      expect(logs[1].source).toBe("kiwi");
    });

    it("should respect limit parameter", async () => {
      await logger.logStart("kiwi", searchParams);
      await logger.logStart("skyscanner", searchParams);
      await logger.logStart("google", searchParams);

      const logs = await logger.getRecentLogs(2);
      expect(logs).toHaveLength(2);
    });
  });

  describe("getLogsBySource", () => {
    it("should return only logs for specified source", async () => {
      await logger.logStart("kiwi", searchParams);
      await logger.logStart("skyscanner", searchParams);
      await logger.logStart("kiwi", searchParams);

      const kiwiLogs = await logger.getLogsBySource("kiwi");
      expect(kiwiLogs).toHaveLength(2);
      expect(kiwiLogs.every((log) => log.source === "kiwi")).toBe(true);
    });
  });

  describe("getErrorLogs", () => {
    it("should return only error and failed logs", async () => {
      const logId1 = await logger.logStart("kiwi", searchParams);
      const logId2 = await logger.logStart("skyscanner", searchParams);
      const logId3 = await logger.logStart("google", searchParams);

      await logger.logSuccess(logId1, 10);
      await logger.logError(logId2, "Test error");
      await logger.logFailure(logId3, "Test failure");

      const errorLogs = await logger.getErrorLogs();
      expect(errorLogs).toHaveLength(2);
      expect(
        errorLogs.every(
          (log) => log.status === "error" || log.status === "failed"
        )
      ).toBe(true);
    });
  });

  describe("getStats", () => {
    it("should calculate correct statistics", async () => {
      const logId1 = await logger.logStart("kiwi", searchParams);
      const logId2 = await logger.logStart("skyscanner", searchParams);
      const logId3 = await logger.logStart("kiwi", searchParams);

      await logger.logSuccess(logId1, 10);
      await logger.logError(logId2, "Test error");
      await logger.logSuccess(logId3, 15);

      const stats = await logger.getStats(24);

      expect(stats.totalOperations).toBe(3);
      expect(stats.successfulOperations).toBe(2);
      expect(stats.errorOperations).toBe(1);
      expect(stats.failedOperations).toBe(0);
      expect(stats.totalRecordsProcessed).toBe(25);
      expect(stats.successRate).toBe(2 / 3);
      expect(stats.averageRecordsPerSuccess).toBe(12.5);

      expect(stats.sources).toHaveLength(2);
      const kiwiStats = stats.sources.find((s) => s.source === "kiwi");
      expect(kiwiStats?.totalOperations).toBe(2);
      expect(kiwiStats?.successfulOperations).toBe(2);
      expect(kiwiStats?.successRate).toBe(1);
    });

    it("should handle time window filtering", async () => {
      // Create a log that's older than the time window
      const oldLogId = await logger.logStart("kiwi", searchParams);
      const oldLog = logger.getLogs().get(oldLogId);
      if (oldLog) {
        oldLog.startTime = Date.now() - 25 * 60 * 60 * 1000; // 25 hours ago
      }

      const recentLogId = await logger.logStart("skyscanner", searchParams);
      await logger.logSuccess(recentLogId, 5);

      const stats = await logger.getStats(24);
      expect(stats.totalOperations).toBe(1); // Only the recent log
    });
  });

  describe("cleanupOldLogs", () => {
    it("should remove logs older than specified days", async () => {
      const oldLogId = await logger.logStart("kiwi", searchParams);
      const oldLog = logger.getLogs().get(oldLogId);
      if (oldLog) {
        oldLog.startTime = Date.now() - 31 * 24 * 60 * 60 * 1000; // 31 days ago
      }

      const recentLogId = await logger.logStart("skyscanner", searchParams);

      const deletedCount = await logger.cleanupOldLogs(30);
      expect(deletedCount).toBe(1);

      const remainingLogs = await logger.getRecentLogs();
      expect(remainingLogs).toHaveLength(1);
      expect(remainingLogs[0].source).toBe("skyscanner");
    });
  });
});

describe("ScrapingErrorMonitor", () => {
  let logger: MockScrapingLogger;
  let monitor: ScrapingErrorMonitor;
  let searchParams: FlightSearchParams;

  beforeEach(() => {
    logger = new MockScrapingLogger();
    monitor = new ScrapingErrorMonitor(logger, 10); // 10% error threshold
    searchParams = {
      departureAirport: "LAX",
      arrivalAirport: "JFK",
      departureDate: new Date("2024-01-15"),
      returnDate: new Date("2024-01-20"),
      isRoundTrip: true,
    };
  });

  describe("shouldAlert", () => {
    it("should not alert when error rate is below threshold", async () => {
      // Create 10 successful operations and 1 error (9% error rate < 10% threshold)
      for (let i = 0; i < 10; i++) {
        const logId = await logger.logStart("kiwi", searchParams);
        await logger.logSuccess(logId, 5);
      }
      const errorLogId = await logger.logStart("skyscanner", searchParams);
      await logger.logError(errorLogId, "Minor error");

      const shouldAlert = await monitor.shouldAlert();
      expect(shouldAlert).toBe(false);
    });

    it("should alert when error rate exceeds threshold", async () => {
      // Create 10 operations with 2 errors (20% error rate > 10% threshold)
      for (let i = 0; i < 8; i++) {
        const logId = await logger.logStart("kiwi", searchParams);
        await logger.logSuccess(logId, 5);
      }
      for (let i = 0; i < 2; i++) {
        const logId = await logger.logStart("skyscanner", searchParams);
        await logger.logError(logId, "Test error");
      }

      const shouldAlert = await monitor.shouldAlert();
      expect(shouldAlert).toBe(true);
    });

    it("should check specific source error rate", async () => {
      const logId1 = await logger.logStart("kiwi", searchParams);
      const logId2 = await logger.logStart("kiwi", searchParams);
      const logId3 = await logger.logStart("skyscanner", searchParams);

      await logger.logSuccess(logId1, 5);
      await logger.logError(logId2, "Test error"); // 50% error rate for kiwi
      await logger.logSuccess(logId3, 5);

      const kiwiAlert = await monitor.shouldAlert("kiwi");
      const skyscannerAlert = await monitor.shouldAlert("skyscanner");

      expect(kiwiAlert).toBe(true);
      expect(skyscannerAlert).toBe(false);
    });
  });

  describe("getErrorSummary", () => {
    it("should return comprehensive error summary", async () => {
      const logId1 = await logger.logStart("kiwi", searchParams);
      const logId2 = await logger.logStart("skyscanner", searchParams);
      const logId3 = await logger.logStart("kiwi", searchParams);

      await logger.logSuccess(logId1, 10);
      await logger.logError(logId2, "Network error");
      await logger.logFailure(logId3, "Complete failure");

      const summary = await monitor.getErrorSummary();

      expect(summary.totalErrors).toBe(2);
      expect(summary.errorRate).toBe(2 / 3);
      expect(summary.recentErrors).toHaveLength(2);
      expect(summary.sourcesWithErrors).toContain("skyscanner");
      expect(summary.sourcesWithErrors).toContain("kiwi");
    });
  });
});

describe("ScrapingPerformanceMonitor", () => {
  let logger: MockScrapingLogger;
  let monitor: ScrapingPerformanceMonitor;
  let searchParams: FlightSearchParams;

  beforeEach(() => {
    logger = new MockScrapingLogger();
    monitor = new ScrapingPerformanceMonitor(logger);
    searchParams = {
      departureAirport: "LAX",
      arrivalAirport: "JFK",
      departureDate: new Date("2024-01-15"),
      returnDate: new Date("2024-01-20"),
      isRoundTrip: true,
    };
  });

  describe("getPerformanceMetrics", () => {
    it("should calculate performance metrics correctly", async () => {
      const logId1 = await logger.logStart("kiwi", searchParams);
      const logId2 = await logger.logStart("skyscanner", searchParams);

      // Simulate some processing time
      await new Promise((resolve) => setTimeout(resolve, 50));
      await logger.logSuccess(logId1, 10);

      await new Promise((resolve) => setTimeout(resolve, 100));
      await logger.logSuccess(logId2, 15);

      const metrics = await monitor.getPerformanceMetrics(24);

      expect(metrics.totalRecordsProcessed).toBe(25);
      expect(metrics.successRate).toBe(1);
      expect(metrics.averageDuration).toBeGreaterThan(0);
      expect(metrics.recordsPerHour).toBeGreaterThan(0);

      expect(metrics.sourcePerformance).toHaveLength(2);
      const kiwiPerformance = metrics.sourcePerformance.find(
        (p) => p.source === "kiwi"
      );
      expect(kiwiPerformance?.recordsProcessed).toBe(10);
      expect(kiwiPerformance?.successRate).toBe(1);
    });

    it("should handle empty logs gracefully", async () => {
      const metrics = await monitor.getPerformanceMetrics(24);

      expect(metrics.totalRecordsProcessed).toBe(0);
      expect(metrics.successRate).toBe(0);
      expect(metrics.averageDuration).toBe(0);
      expect(metrics.recordsPerHour).toBe(0);
      expect(metrics.sourcePerformance).toHaveLength(0);
    });
  });
});
