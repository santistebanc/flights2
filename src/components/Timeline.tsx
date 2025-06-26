import { Temporal } from "@js-temporal/polyfill";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useRef, useMemo, useState, useEffect } from "react";
import { timeline } from "./timeline";
import { Offer } from "../../convex/offers";
import { TimelineRow } from "./TimelineRow";
import { DealsPopup } from "./DealsPopup";
import React from "react";

export function getLowestPrice(offer: Offer) {
  if (!offer.deals || offer.deals.length === 0) return null;
  const lowestDeal = offer.deals.reduce((min, deal) =>
    deal.price < min.price ? deal : min
  );
  return lowestDeal.price;
}

export function getUniqueDealsByDealer(offer: Offer) {
  if (!offer.deals || offer.deals.length === 0) return [];
  const dealerMap = new Map<string, typeof offer.deals[0]>();
  offer.deals.forEach(deal => {
    const existingDeal = dealerMap.get(deal.dealer);
    if (!existingDeal || deal.price < existingDeal.price) {
      dealerMap.set(deal.dealer, deal);
    }
  });
  return Array.from(dealerMap.values()).sort((a, b) => a.price - b.price);
}

export function Timeline({ offers }: { offers: Offer[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);

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
  const priceColumnWidth = 80;

  const rowVirtualizer = useWindowVirtualizer({
    count: ranges.length,
    estimateSize: () => 56,
    overscan: 10,
  });

  const timelineWidth = totalSteps * 30 + paddingWidth * 2 + priceColumnWidth;

  const handlePriceClick = (offer: Offer, event: React.MouseEvent) => {
    if (!offer.deals || offer.deals.length === 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setPopupPosition({ x: rect.left, y: rect.bottom + 5 });
    setSelectedOffer(offer);
  };

  const closePopup = () => {
    setSelectedOffer(null);
    setPopupPosition(null);
  };

  useEffect(() => {
    if (selectedOffer) {
      const handleWindowScroll = () => closePopup();
      const handleTimelineScroll = () => closePopup();
      const handleDocumentClick = (event: MouseEvent) => {
        const popupElement = document.querySelector('[data-popup="deals"]');
        const clickedElement = event.target as Element;
        if (popupElement && !popupElement.contains(clickedElement)) {
          const isPriceClick = clickedElement.closest('[data-price-clickable]');
          if (!isPriceClick) closePopup();
        }
      };
      window.addEventListener('scroll', handleWindowScroll);
      const timelineElement = parentRef.current;
      if (timelineElement) {
        timelineElement.addEventListener('scroll', handleTimelineScroll);
      }
      setTimeout(() => {
        document.addEventListener('click', handleDocumentClick);
      }, 100);
      return () => {
        window.removeEventListener('scroll', handleWindowScroll);
        if (timelineElement) {
          timelineElement.removeEventListener('scroll', handleTimelineScroll);
        }
        document.removeEventListener('click', handleDocumentClick);
      };
    }
  }, [selectedOffer]);

  return (
    <div
      ref={parentRef}
      className="h-full overflow-auto"
      style={{ transition: "min-width 0.3s ease-in-out" }}
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
            <TimelineRow
              key={virtualRow.index}
              track={track}
              offer={offer}
              lowestPrice={lowestPrice}
              timelineWidth={timelineWidth}
              priceColumnWidth={priceColumnWidth}
              getRelativePosition={getRelativePosition}
              handlePriceClick={handlePriceClick}
              paddingWidth={paddingWidth}
              measureElement={rowVirtualizer.measureElement}
              virtualRow={virtualRow}
            />
          );
        })}
      </div>
      {selectedOffer && popupPosition && (
        <DealsPopup
          offer={selectedOffer}
          position={popupPosition}
          onClose={closePopup}
          getUniqueDealsByDealer={getUniqueDealsByDealer}
        />
      )}
    </div>
  );
}
