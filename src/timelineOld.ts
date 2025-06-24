import { Temporal } from "@js-temporal/polyfill";

type Range<T> = { start: Temporal.Instant; end: Temporal.Instant; data: T };

export function timeline<T>(
  ranges: Range<T>[],
  collapseThreshold: number,
  collapseInBetween: boolean
) {
  let max = ranges[0].end;
  let min = ranges[0].start;
  let smallestRange = {
    duration: ranges[0].start.until(ranges[0].end),
    range: ranges[0],
  };
  const sortedRanges = ranges
    .flatMap((range) => {
      if (Temporal.Instant.compare(range.start, min) < 0) min = range.start;
      if (Temporal.Instant.compare(range.end, max) > 0) max = range.end;
      const duration = range.start.until(range.end);
      if (
        duration.total("milliseconds") <
        smallestRange.duration.total("milliseconds")
      ) {
        smallestRange = { duration, range };
      }
      return [
        { type: "start", instant: range.start, range },
        { type: "end", instant: range.end, range },
      ];
    })
    .sort((a, b) => Temporal.Instant.compare(a.instant, b.instant));
  const stepDuration = smallestRange.duration.round({
    smallestUnit: "hour",
    roundingIncrement: 1,
  });

  const gaps: { start: Temporal.Instant; end: Temporal.Instant }[] = [];
  const segments: { start: Temporal.Instant; end: Temporal.Instant }[] = [];

  if (collapseInBetween) {
    let segmentStart = sortedRanges[0].instant;
    for (let i = 0; i < sortedRanges.length; i++) {
      const sr = sortedRanges[i];
      const prevSr = i > 0 ? sortedRanges[i - 1] : null;
      if (
        prevSr?.type === "end" &&
        sr.type === "start" &&
        prevSr.instant.until(sr.instant).total("minutes") > collapseThreshold
      ) {
        segments.push({
          start: segmentStart,
          end: prevSr.instant,
        });
        segmentStart = sr.instant;
        gaps.push({
          start: prevSr.instant,
          end: sr.instant,
        });
      }
    }
    segments.push({
      start: segmentStart,
      end: sortedRanges.at(-1)!.instant,
    });
  } else {
    let segmentStart = sortedRanges[0].instant;
    let currentFinish = sortedRanges[0].range.end;
    sortedRanges.forEach((sr) => {
      if (
        sr.type === "start" &&
        currentFinish.until(sr.range.start).total("minutes") > collapseThreshold
      ) {
        segments.push({
          start: segmentStart,
          end: currentFinish,
        });
        segmentStart = sr.range.start;
        gaps.push({
          start: currentFinish,
          end: sr.range.start,
        });
      }
      currentFinish =
        Temporal.Instant.compare(currentFinish, sr.range.end) < 0
          ? sr.range.end
          : currentFinish;
    });
    segments.push({
      start: segmentStart,
      end: sortedRanges.at(-1)!.instant,
    });
  }

  const paddedMin = min.subtract(stepDuration);
  const paddedMax = max.add(stepDuration);
  const totalMilliseconds =
    paddedMax.epochMilliseconds - paddedMin.epochMilliseconds;
  const totalGapMilliseconds = (until?: Temporal.Instant) =>
    gaps.reduce(
      (acc, gap) =>
        !until || gap.start.epochMilliseconds < until.epochMilliseconds
          ? acc + gap.end.epochMilliseconds - gap.start.epochMilliseconds
          : acc,
      0
    );
  const totalCollapsedMilliseconds = totalMilliseconds - totalGapMilliseconds();

  const mappedRanges = new Map<
    Range<T>,
    {
      startRelative: number;
      endRelative: number;
      startCollapsed: number;
      endCollapsed: number;
      segment: { start: Temporal.Instant; end: Temporal.Instant } | undefined;
    } & Range<T>
  >();

  sortedRanges.forEach((sr) => {
    mappedRanges.set(sr.range, {
      startRelative:
        (sr.range.start.epochMilliseconds - paddedMin.epochMilliseconds) /
        totalMilliseconds,
      endRelative:
        (sr.range.end.epochMilliseconds - paddedMin.epochMilliseconds) /
        totalMilliseconds,
      startCollapsed:
        (sr.range.start.epochMilliseconds -
          paddedMin.epochMilliseconds -
          totalGapMilliseconds(sr.range.start)) /
        totalCollapsedMilliseconds,
      endCollapsed:
        (sr.range.end.epochMilliseconds -
          paddedMin.epochMilliseconds -
          totalGapMilliseconds(sr.range.end)) /
        totalCollapsedMilliseconds,
      segment: segments.find((s) =>
        Temporal.Instant.compare(s.start, sr.range.start) <= 0 &&
        Temporal.Instant.compare(s.end, sr.range.end) >= 0
      ),
      ...sr.range,
    });
  });

  const valuedRanges = Array.from(mappedRanges.values());

  return {
    min: paddedMin,
    max: paddedMax,
    totalMilliseconds,
    totalCollapsedMilliseconds,
    valuedRanges,
    smallestRange,
    stepDuration,
    gaps,
    segments,
  };
}

export function getDivisions(
  start: Temporal.Instant,
  end: Temporal.Instant,
  step: Temporal.Duration
) {
  const divisions = [];
  let current = start;
  while (Temporal.Instant.compare(current, end) < 0) {
    divisions.push(current);
    current = current.add(step);
  }
  return divisions;
}
