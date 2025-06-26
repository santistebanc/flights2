import { Temporal } from "@js-temporal/polyfill";
import { Offer } from "../../convex/offers";

interface DealsPopupProps {
  offer: Offer;
  position: { x: number; y: number };
  onClose: () => void;
  getUniqueDealsByDealer: (offer: Offer) => any[];
}

export function DealsPopup({ offer, position, onClose, getUniqueDealsByDealer }: DealsPopupProps) {
  return (
    <div
      data-popup="deals"
      className="fixed z-50 bg-slate-800 border border-slate-600 rounded-lg shadow-lg max-w-sm pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div className="p-4 pointer-events-auto">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-white font-semibold">Available Deals</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {getUniqueDealsByDealer(offer).map((deal, index) => (
            <a
              key={deal._id}
              href={deal.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 bg-slate-700 hover:bg-slate-600 rounded border border-slate-600 transition-colors"
            >
              <div className="flex justify-between items-center gap-4">
                <div className="text-yellow-400 font-semibold min-w-0 flex-shrink-0">
                  {deal.price.toLocaleString()}€
                </div>
                <div className="text-sm text-gray-400 flex-1 text-center">
                  {deal.dealer}
                </div>
                <div className="text-xs text-gray-500 min-w-0 flex-shrink-0">
                  {Temporal.ZonedDateTime.from(deal.date).toPlainDate().toString()}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
} 