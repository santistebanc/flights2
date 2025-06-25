import { Temporal } from "@js-temporal/polyfill";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useRef, useMemo, useState, useEffect } from "react";
import { timeline } from "./timeline";
import { Offer } from "../../convex/offers";
import { FlightRange } from "./FlightRange";
import { StayRange } from "./StayRange";
import { Fragment } from "react/jsx-runtime";

export function Timeline({ offers }: { offers: Offer[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);

  // Memoize the ranges calculation to avoid unnecessary recalculations
  const { ranges, timelineData, getRelativePosition } = useMemo(() => {
    const ranges = offers.map((offer) =>
      offer.flights.map((flight) => ({
        start: Temporal.ZonedDateTime.from(flight.departure),
        end: Temporal.ZonedDateTime.from(flight.arrival),
        data: { offer, flight },
      }))
    );
    
    const { gaps, stepDuration, max, min } = timeline(ranges, 0);
    const totalDuration = max.epochMilliseconds - min.epochMilliseconds;

    function getRelativePosition(instant: Temporal.ZonedDateTime) {
      return (
        ((instant.epochMilliseconds - min.epochMilliseconds) * 100) /
        totalDuration
      );
    }

    return {
      ranges,
      timelineData: { gaps, stepDuration, max, min, totalDuration },
      getRelativePosition,
    };
  }, [offers]);

  const totalSteps = Math.round(
    timelineData.totalDuration / timelineData.stepDuration
  );
  const paddingWidth = 40;
  const priceColumnWidth = 80; // Reduced width for more compact layout

  // Configure the window virtualizer with optimized settings
  const rowVirtualizer = useWindowVirtualizer({
    count: ranges.length,
    estimateSize: () => 56, // 14 * 4 = 56px (h-14)
    overscan: 10, // Increased overscan for smoother scrolling
    // scrollPaddingEnd: 100, // Add padding at the end for better UX
  });

  // Calculate total width for the timeline content
  const timelineWidth = totalSteps * 30 + paddingWidth * 2 + priceColumnWidth;

  // Helper function to get the lowest price for an offer
  const getLowestPrice = (offer: Offer) => {
    if (!offer.deals || offer.deals.length === 0) return null;
    const lowestDeal = offer.deals.reduce((min, deal) => 
      deal.price < min.price ? deal : min
    );
    return lowestDeal.price;
  };

  // Helper function to get unique deals by dealer (lowest price per dealer)
  const getUniqueDealsByDealer = (offer: Offer) => {
    if (!offer.deals || offer.deals.length === 0) return [];
    
    const dealerMap = new Map<string, typeof offer.deals[0]>();
    
    offer.deals.forEach(deal => {
      const existingDeal = dealerMap.get(deal.dealer);
      if (!existingDeal || deal.price < existingDeal.price) {
        dealerMap.set(deal.dealer, deal);
      }
    });
    
    return Array.from(dealerMap.values()).sort((a, b) => a.price - b.price);
  };

  // Handle price click
  const handlePriceClick = (offer: Offer, event: React.MouseEvent) => {
    if (!offer.deals || offer.deals.length === 0) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    setPopupPosition({ x: rect.left, y: rect.bottom + 5 });
    setSelectedOffer(offer);
  };

  // Close popup
  const closePopup = () => {
    setSelectedOffer(null);
    setPopupPosition(null);
  };

  // Add scroll event listeners
  useEffect(() => {
    if (selectedOffer) {
      const handleWindowScroll = () => {
        closePopup();
      };

      const handleTimelineScroll = () => {
        closePopup();
      };

      // Listen for window scroll (vertical)
      window.addEventListener('scroll', handleWindowScroll);
      
      // Listen for timeline scroll (horizontal)
      const timelineElement = parentRef.current;
      if (timelineElement) {
        timelineElement.addEventListener('scroll', handleTimelineScroll);
      }

      return () => {
        window.removeEventListener('scroll', handleWindowScroll);
        if (timelineElement) {
          timelineElement.removeEventListener('scroll', handleTimelineScroll);
        }
      };
    }
  }, [selectedOffer]);

  return (
    <div
      ref={parentRef}
      className="h-full overflow-auto"
      style={{
        transition: "min-width 0.3s ease-in-out",
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: `${timelineWidth}px`,
          position: "relative",
          minWidth: "100%",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const track = ranges[virtualRow.index];
          if (!track || track.length === 0) return null;
          
          const offer = track[0].data.offer;
          const lowestPrice = getLowestPrice(offer);
          
          return (
            <div
              key={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              data-index={virtualRow.index}
              className="w-full h-14 bg-slate-800 border-b border-slate-700 flex absolute top-0 left-0"
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                width: `${timelineWidth}px`,
              }}
            >
              {/* Price Column */}
              <div
                className="h-full flex items-center justify-center border-r border-slate-600 bg-slate-700/50"
                style={{ width: `${priceColumnWidth}px` }}
              >
                {lowestPrice ? (
                  <div 
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
                {track.map((range, r) => {
                  return (
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
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Deals Popup */}
      {selectedOffer && popupPosition && (
        <div
          className="fixed z-50 bg-slate-800 border border-slate-600 rounded-lg shadow-lg max-w-sm pointer-events-none"
          style={{
            left: popupPosition.x,
            top: popupPosition.y,
          }}
        >
          <div className="p-4 pointer-events-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white font-semibold">Available Deals</h3>
              <button
                onClick={closePopup}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {getUniqueDealsByDealer(selectedOffer).map((deal, index) => (
                <a
                  key={deal._id}
                  href={deal.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-slate-700 hover:bg-slate-600 rounded border border-slate-600 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-yellow-400 font-semibold">
                        {deal.price.toLocaleString()}€
                      </div>
                      <div className="text-sm text-gray-400">
                        {deal.dealer}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {Temporal.ZonedDateTime.from(deal.date).toPlainDate().toString()}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
