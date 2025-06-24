import { Temporal } from "@js-temporal/polyfill";
import { Doc } from "../../convex/_generated/dataModel";

const query = {
  "width-between-400-and-599": {
    minWidth: 400,
    maxWidth: 599,
  },
  "width-larger-than-600": {
    minWidth: 600,
  },
};

export function StayRange({
  start,
  end,
  from,
  to,
  rangeStart,
  rangeEnd,
}:
  | {
      start: string;
      end: string;
      from?: Doc<"airports">;
      to: Doc<"airports">;
      rangeStart?: Temporal.Instant;
      rangeEnd?: Temporal.Instant;
    }
  | {
      start: string;
      end: string;
      from?: Doc<"airports">;
      to?: Doc<"airports">;
      rangeStart?: Temporal.Instant;
      rangeEnd?: Temporal.Instant;
    }) {
  const fromLabel = from && `${from.name} (${from.city}, ${from.country})`;
  const toLabel = to && `${to.name} (${to.city}, ${to.country})`;
  const label =
    from && to && from._id !== to._id
      ? `${fromLabel} - ${toLabel}`
      : (fromLabel ?? toLabel);

  return (
    <div
      className="@container h-5 absolute flex items-center bg-slate-700  self-center justify-between"
      title={label}
      style={{
        transition: "left 0.3s ease-in-out, width 0.3s ease-in-out",
        left: start,
        width: `calc(${end} - ${start})`,
        justifyContent: !from ? "flex-end" : !to ? "flex-start" : "center",
      }}
    >
      {from && rangeStart && (
        <span className="hidden  @[80px]:inline text-xs text-white font-bold px-1">
          {from.iata}
        </span>
      )}
      {rangeStart && rangeEnd && (
        <span className="hidden  @[100px]:inline flex-1 text-xs text-white px-1">
          {getDuration(
            rangeEnd.epochMilliseconds - rangeStart.epochMilliseconds
          )}
        </span>
      )}
      {to && rangeEnd && (
        <span className="hidden  @[80px]:inline text-xs text-white font-bold px-1">
          {to.iata}
        </span>
      )}
      {from && to && from === to ? (
        <span className="@[80px]:hidden text-[0.5rem] @[60px]:text-xs text-white font-bold">
          {`${from.iata}-${to.iata}`}
        </span>
      ) : (
        <span className="@[80px]:hidden text-[0.6rem] @[40px]:text-xs text-white font-bold">
          {from?.iata ?? to?.iata}
        </span>
      )}
    </div>
  );
}

const getDuration = (milliseconds: number) => {
  const hours = Math.floor(milliseconds / (60 * 60 * 1000));
  const minutes = Math.floor((milliseconds / (60 * 1000)) % 60);
  if (milliseconds > 36 * 60 * 60 * 1000) {
    return Math.round(milliseconds / (24 * 60 * 60 * 1000)) + " days";
  }
  return (
    (milliseconds >= 60 * 60 * 1000 ? hours + "h" : "") +
    (minutes ? minutes.toString().padStart(2, "0") + "m" : "")
  );
};
