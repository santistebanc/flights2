import { Temporal } from "@js-temporal/polyfill";
import stc from "string-to-color";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { DetailedFlight } from "../../convex/offers";

export function FlightRange({
  start,
  end,
  flight,
}: {
  start: string;
  end: string;
  flight: DetailedFlight;
}) {
  return (
    <div
      className="h-full absolute flex items-center"
      title={`${flight.airline.name} ${flight.flightNumber}`}
      style={{
        transition: "left 0.3s ease-in-out, width 0.3s ease-in-out",
        left: start,
        width: `calc(${end} - ${start})`,
        zIndex: 1,
      }}
    >
      <div
        className="h-1 rounded-full w-full"
        style={{
          backgroundColor: stc(flight.airline.name),
        }}
      />

      <span
        className="absolute text-xs text-white px-1"
        style={{
          transform: "translateX(-50%) translateY(100%)",
        }}
      >
        {Temporal.PlainDateTime.from(flight.departure)
          .toPlainTime()
          .toString()
          .slice(0, -3)}
      </span>
      <span
        className="absolute text-xs text-white px-1"
        style={{
          transform: "translateX(50%) translateY(100%)",
          right: 0,
        }}
      >
        {Temporal.PlainDateTime.from(flight.arrival)
          .toPlainTime()
          .toString()
          .slice(0, -3)}
      </span>
      <span
        className="absolute text-xs text-white px-1"
        style={{
          transform: "translateX(-50%) translateY(-100%)",
          left: "50%",
        }}
      >
        {getDuration(flight.departure, flight.arrival)}
      </span>
    </div>
  );
}

const getDuration = (start: string, end: string) => {
  const duration = Temporal.ZonedDateTime.from(start).until(
    Temporal.ZonedDateTime.from(end)
  );
  return (
    duration.hours.toString() +
    "h" +
    (duration.minutes ? duration.minutes.toString().padStart(2, "0") : "")
  );
};
