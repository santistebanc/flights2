import { Fragment } from "react";
import { FlightRange } from "./FlightRange";
import { StayRange } from "./StayRange";
import { Offer } from "../../convex/offers";

export function TimelineRow({
  track,
  offer,
  lowestPrice,
  timelineWidth,
  priceColumnWidth,
  getRelativePosition,
  handlePriceClick,
  paddingWidth,
  measureElement,
  virtualRow,
}: {
  track: any[];
  offer: Offer;
  lowestPrice: number | null;
  timelineWidth: number;
  priceColumnWidth: number;
  getRelativePosition: (instant: any) => number;
  handlePriceClick: (offer: Offer, event: React.MouseEvent) => void;
  paddingWidth: number;
  measureElement: (el: HTMLElement | null) => void;
  virtualRow: any;
}) {
  return (
    <div
      key={virtualRow.index}
      ref={measureElement}
      data-index={virtualRow.index}
      className="w-full h-14 bg-slate-800 border-b border-slate-700 flex absolute top-0 left-0"
      style={{
        height: `${virtualRow.size}px`,
        transform: `translateY(${virtualRow.start}px)`,
        width: `${timelineWidth}px`,
      }}
    >
      {/* Sticky Price Column */}
      <div
        className="h-full flex items-center justify-center border-r border-b border-slate-600 bg-slate-700 sticky left-0 z-10"
        style={{ width: `${priceColumnWidth}px` }}
      >
        {lowestPrice ? (
          <div
            data-price-clickable
            className="text-center cursor-pointer hover:bg-slate-600/50 rounded px-2 py-1 transition-colors"
            onClick={(e) => handlePriceClick(offer, e)}
          >
            <div className="text-yellow-400 font-semibold text-base">
              {lowestPrice.toLocaleString()}€
            </div>
          </div>
        ) : (
          <div className="text-gray-500 text-sm">No price</div>
        )}
      </div>
      {/* Timeline Content */}
      <div
        className="h-full flex relative"
        style={{
          width: `calc(100% - ${priceColumnWidth}px - ${paddingWidth * 2}px)`,
        }}
      >
        <StayRange
          key={`${virtualRow.index}-${-1}-stay`}
          start={`0px`}
          end={`calc(${getRelativePosition(track[0].start)}% + ${paddingWidth}px)`}
          rangeEnd={track[0].start}
          to={track[0].data.flight.from}
        />
        {track.map((range, r) => (
          <Fragment key={range.start.toString()}>
            <FlightRange
              start={`calc(${getRelativePosition(range.start)}% + ${paddingWidth}px)`}
              end={`calc(${getRelativePosition(range.end)}% + ${paddingWidth}px)`}
              flight={range.data.flight}
            />
            {r + 1 < track.length ? (
              <StayRange
                start={`calc(${getRelativePosition(range.end)}% + ${paddingWidth}px)`}
                end={`calc(${getRelativePosition(track[r + 1].start)}% + ${paddingWidth}px)`}
                rangeStart={range.end}
                rangeEnd={track[r + 1].start}
                from={range.data.flight.to}
                to={track[r + 1].data.flight.from}
              />
            ) : (
              <StayRange
                start={`calc(${getRelativePosition(track[r].end)}% + ${paddingWidth}px)`}
                end={`calc(100% + ${paddingWidth * 2}px`}
                rangeStart={track[r].end}
                from={track[r].data.flight.to}
              />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
} 