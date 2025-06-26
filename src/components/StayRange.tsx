import { Temporal } from "@js-temporal/polyfill";
import { Doc } from "../../convex/_generated/dataModel";
import randomColor from "randomcolor";

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
}: {
  start: string;
  end: string;
  from?: Doc<"airports">;
  to?: Doc<"airports">;
  rangeStart?: Temporal.ZonedDateTime;
  rangeEnd?: Temporal.ZonedDateTime;
}) {
  const fromLabel = from && `${from.name} (${from.municipality}, ${from.iso_country})`;
  const toLabel = to && `${to.name} (${to.municipality}, ${to.iso_country})`;
  const label =
    from && to && from._id !== to._id
      ? `${fromLabel} - ${toLabel}`
      : (fromLabel ?? toLabel);

  const getDivisions = (division: "days" | "hours") => {
    if (!rangeStart || !rangeEnd) return [];
    const first =
      division === "days" ? rangeStart.startOfDay() : rangeStart.round("hours");
    const divisions = [];
    let current = first;
    while (Temporal.ZonedDateTime.compare(current, rangeEnd) <= 0) {
      if (Temporal.ZonedDateTime.compare(current, rangeStart) >= 0) {
        divisions.push(current);
      }
      current = current.add({
        [division]: 1,
      });
    }
    return divisions;
  };

  return (
    <div
      className="@container h-5 absolute flex items-center self-center justify-between @[80px]:justify-center"
      title={label}
      style={{
        transition: "left 0.3s ease-in-out, width 0.3s ease-in-out",
        left: start,
        width: `calc(${end} - ${start})`,
        backgroundColor: randomColor({
          seed: label,
          hue: "rgb(30 41 59)",
          luminosity: "light",
          alpha: 0.1,
          format: 'rgba',
        }),
      }}
    >
      {rangeStart &&
        rangeEnd &&
        getDivisions("days").map((division) => (
          <span
            key={division.epochMilliseconds}
            className="absolute h-full w-1 bg-slate-600 top-0"
            style={{
              transition: "left 0.3s ease-in-out, width 0.3s ease-in-out",
              left: `${
                ((division.epochMilliseconds - rangeStart.epochMilliseconds) *
                  100) /
                (rangeEnd.epochMilliseconds - rangeStart.epochMilliseconds)
              }%`,
            }}
          />
        ))}
      {from && rangeStart && (
        <span
          className={
            (!to ? "flex-1 " : "") +
            "hidden @[80px]:inline text-xs text-white font-bold px-1 text-left"
          }
          style={{ zIndex: 1 }}
        >
          {from.iata_code}
        </span>
      )}
      {rangeStart && rangeEnd && (
        <span
          className="hidden @[120px]:inline flex-1 text-xs text-white px-1"
          style={{ zIndex: 1 }}
        >
          {getDuration(
            rangeEnd.epochMilliseconds - rangeStart.epochMilliseconds
          )}
        </span>
      )}
      {to && rangeEnd && (
        <span
          className={
            (!from ? "flex-1 " : "") +
            "hidden @[80px]:inline text-xs text-white font-bold px-1 text-right"
          }
          style={{ zIndex: 1 }}
        >
          {to.iata_code}
        </span>
      )}
      {from && to && from === to ? (
        <span
          className="@[80px]:hidden text-[0.5rem] @[60px]:text-xs text-white font-bold flex-1 text-center"
          style={{ zIndex: 1 }}
        >
          {`${from.iata_code}-${to.iata_code}`}
        </span>
      ) : (
        <span
          className="@[80px]:hidden text-[0.6rem] @[40px]:text-xs text-white font-bold flex-1 text-center"
          style={{ zIndex: 1 }}
        >
          {from?.iata_code ?? to?.iata_code}
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
