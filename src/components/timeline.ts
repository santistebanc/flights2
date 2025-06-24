import { Temporal } from "@js-temporal/polyfill";

export type Range<T> = {
  start: Temporal.Instant;
  end: Temporal.Instant;
  data: T;
};

export function timeline<T>(
  ranges: Range<T>[][],
  collapseThreshold: number = 0,
) {
  let max = ranges[0][0].end;
  let min = ranges[0][0].start;
  let smallestRange = {
    duration: ranges[0][0].start.until(ranges[0][0].end),
    range: ranges[0][0],
  };
  const sortedRanges = ranges
    .flatMap((track, trackIndex) =>
      track.flatMap((range) => {
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
          { type: "start", instant: range.start, trackIndex, range },
          { type: "end", instant: range.end, trackIndex, range },
        ];
      })
    )
    .sort((a, b) => Temporal.Instant.compare(a.instant, b.instant));

  const stepDuration = smallestRange.duration
    .round({
      smallestUnit: "hour",
      roundingIncrement: 1,
    })
    .total("milliseconds");

  const gaps: Pick<Range<T>, "start" | "end">[] = [];

  let gapTotalDuration = 0;
  for (let i = 0; i < sortedRanges.length; i++) {
    const sr = sortedRanges[i];
    const prevSr = i > 0 ? sortedRanges[i - 1] : null;
    if (
      prevSr?.type === "end" &&
      sr.type === "start" &&
      prevSr.instant.until(sr.instant).total("minutes") > collapseThreshold
    ) {
      gaps.push({
        start: prevSr.instant,
        end: sr.instant,
      });
      gapTotalDuration += prevSr.instant
        .until(sr.instant)
        .total("milliseconds");
    }
  }

  return {
    min,
    max,
    gaps,
    smallestRange,
    stepDuration,
    gapTotalDuration,
  };
}
