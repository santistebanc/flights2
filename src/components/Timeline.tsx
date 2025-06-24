import { Temporal } from "@js-temporal/polyfill";
import { timeline } from "./timeline";
import { Offer } from "../../convex/offers";
import { FlightRange } from "./FlightRange";
import { StayRange } from "./StayRange";

export function Timeline({ offers }: { offers: Offer[] }) {
  const ranges = [offers[0], offers[1], offers[2]].map((offer) =>
    offer.flights.map((flight) => ({
      start: Temporal.Instant.from(flight.departure),
      end: Temporal.Instant.from(flight.arrival),
      data: { offer, flight },
    }))
  );
  const { gaps, stepDuration, max, min } = timeline(ranges, 0);

  const totalDuration = max.epochMilliseconds - min.epochMilliseconds;

  const totalSteps = Math.round(totalDuration / stepDuration);

  const paddingWidth = 40;

  function getRelativePosition(instant: Temporal.Instant) {
    return (
      ((instant.epochMilliseconds - min.epochMilliseconds) * 100) /
      totalDuration
    );
  }

  return (
    <div
      style={{
        minWidth: totalSteps * 30 + paddingWidth * 2,
        transition: "min-width 0.3s ease-in-out",
      }}
    >
      <div className="flex w-full flex-col">
        {ranges.map((track, t) => (
          <div
            key={t}
            className="w-full h-14 bg-slate-800 border-b border-slate-700 flex"
          >
            <div
              className="h-full flex relative"
              style={{ width: `calc(100% - ${paddingWidth * 2}px)` }}
            >
              <StayRange
                key={`${t}-${-1}-stay`}
                start={`0px`}
                end={`${paddingWidth}px`}
                rangeEnd={track[0].start}
                to={track[0].data.flight.from}
              />
              {track.map((range, r) => {
                return (
                  <>
                    <FlightRange
                      key={`${t}-${r}-flight`}
                      start={`calc(${getRelativePosition(range.start)}% + ${paddingWidth}px)`}
                      end={`calc(${getRelativePosition(range.end)}% + ${paddingWidth}px)`}
                      flight={range.data.flight}
                    />
                    {r + 1 < track.length ? (
                      <StayRange
                        key={`${t}-${r}-stay`}
                        start={`calc(${getRelativePosition(range.end)}% + ${paddingWidth}px)`}
                        end={`calc(${getRelativePosition(track[r + 1].start)}% + ${paddingWidth}px)`}
                        rangeStart={range.end}
                        rangeEnd={track[r + 1].start}
                        from={range.data.flight.to}
                        to={track[r + 1].data.flight.from}
                      />
                    ) : null}
                  </>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
