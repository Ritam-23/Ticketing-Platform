import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  Flame,
  ShieldCheck,
  Info,
  Check,
  AlertCircle,
  TrendingUp,
  CreditCard,
} from 'lucide-react';
import { EventItem, Seat, SeatingTier, Terminal } from '../types.js';
import { formatINR } from '../lib/formatters.js';

interface SeatingMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem | null;
  currentTerminal: Terminal | null;
  onProceedToCheckout: (selectedSeats: Seat[], event: EventItem) => void;
}

export const SeatingMapModal: React.FC<SeatingMapModalProps> = ({
  isOpen,
  onClose,
  event,
  currentTerminal,
  onProceedToCheckout,
}) => {
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [hoveredSeat, setHoveredSeat] = useState<Seat | null>(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState<number | null>(null);
  const [timeLeftSec, setTimeLeftSec] = useState<number>(300); // 5 mins

  useEffect(() => {
    setSelectedSeatIds([]);
    setHoveredSeat(null);
    if (isOpen) {
      const expires = Date.now() + 5 * 60 * 1000;
      setHoldExpiresAt(expires);
    }
  }, [isOpen, event?.id]);

  // Hold Countdown Timer
  useEffect(() => {
    if (!holdExpiresAt) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((holdExpiresAt - Date.now()) / 1000));
      setTimeLeftSec(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [holdExpiresAt]);

  if (!isOpen || !event) return null;

  const handleToggleSeat = (seat: Seat) => {
    if (seat.status === 'sold') return;
    if (seat.status === 'held' && seat.heldByTerminalId && seat.heldByTerminalId !== currentTerminal?.id) {
      return; // held by someone else
    }

    if (selectedSeatIds.includes(seat.id)) {
      setSelectedSeatIds(selectedSeatIds.filter((id) => id !== seat.id));
    } else {
      if (selectedSeatIds.length >= 6) {
        alert('Maximum 6 seats per transaction.');
        return;
      }
      setSelectedSeatIds([...selectedSeatIds, seat.id]);
    }
  };

  const selectedSeats = (event?.seats || []).filter((s) => selectedSeatIds.includes(s.id));

  const baseSubtotal = selectedSeats.reduce((sum, s) => {
    const tier = event?.tiers?.find((t) => t.id === s.tierId);
    return sum + (tier ? tier.basePrice : s.price);
  }, 0);

  const currentSubtotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const dynamicSurgeTotal = Math.max(0, currentSubtotal - baseSubtotal);
  const taxesAndFees = Math.round(currentSubtotal * 0.08);
  const grandTotal = currentSubtotal + taxesAndFees;

  const minutes = Math.floor(timeLeftSec / 60);
  const seconds = timeLeftSec % 60;
  const timerFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div
        id="seating-map-modal"
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl text-slate-100 flex flex-col max-h-[95vh]"
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
              {event.category === 'concert' ? '🎵' : event.category === 'sports' ? '⚽' : '🎭'}
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center space-x-2">
                <span>{event.title}</span>
                <span className="text-xs text-slate-400 font-normal">
                  ({event.venue}, {event.city})
                </span>
              </h3>
              <div className="flex items-center space-x-3 text-xs text-slate-400 mt-0.5">
                <span>Date: {event.date} at {event.time}</span>
                <span>•</span>
                <span className="text-cyan-400 font-mono">Terminal: {currentTerminal?.name}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Hold Reservation Lock Countdown */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              <span>Seat Lock: {timerFormatted}</span>
            </div>

            <button
              id="close-seating-modal"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Left Map Visualization + Right Cart Sidebar */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-0">
          {/* Main Visual Seating Map */}
          <div className="lg:col-span-2 p-6 flex flex-col items-center justify-between border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950/40">
            {/* Stage / Pitch Visual Projection */}
            <div className="w-full max-w-md mb-6">
              <div className="relative py-2.5 px-6 rounded-2xl bg-gradient-to-b from-indigo-900/60 to-slate-900 border border-indigo-500/40 text-center shadow-lg shadow-indigo-500/10">
                <span className="text-xs font-black tracking-widest text-indigo-200 uppercase">
                  {event.category === 'sports' ? 'FIELD / PITCH CENTER' : event.category === 'theater' ? 'MAIN PROSCENIUM STAGE' : 'CONCERT STAGE'}
                </span>
                <div className="absolute inset-x-8 -bottom-1 h-0.5 bg-indigo-400/50 blur-xs" />
              </div>
            </div>

            {/* Interactive Seating Layout Canvas */}
            <div className="relative w-full max-w-lg bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-inner flex flex-col items-center">
              {/* Rows */}
              <div className="space-y-3 w-full">
                {['A', 'B', 'C', 'D', 'E', 'F'].map((rowLetter) => {
                  const rowSeats = (event?.seats || []).filter((s) => s.row === rowLetter);
                  return (
                    <div key={rowLetter} className="flex items-center justify-center space-x-2">
                      <span className="w-4 text-center font-mono font-bold text-xs text-slate-500">
                        {rowLetter}
                      </span>

                      <div className="flex items-center space-x-1.5">
                        {rowSeats.map((seat) => {
                          const isSelected = selectedSeatIds.includes(seat.id);
                          const isSold = seat.status === 'sold';
                          const isHeld = seat.status === 'held' && seat.heldByTerminalId !== currentTerminal?.id;
                          const tier = event?.tiers?.find((t) => t.id === seat.tierId);
                          const tierColor = tier?.color || '#3b82f6';

                          return (
                            <button
                              key={seat.id}
                              id={`seat-btn-${seat.id}`}
                              disabled={isSold || isHeld}
                              onClick={() => handleToggleSeat(seat)}
                              onMouseEnter={() => setHoveredSeat(seat)}
                              onMouseLeave={() => setHoveredSeat(null)}
                              style={{
                                backgroundColor: isSelected
                                  ? '#6366f1'
                                  : isSold
                                  ? '#1e293b'
                                  : isHeld
                                  ? '#78350f'
                                  : tierColor,
                              }}
                              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all relative ${
                                isSold
                                  ? 'cursor-not-allowed opacity-30 text-slate-500 border border-slate-700'
                                  : isHeld
                                  ? 'cursor-not-allowed opacity-60 text-amber-200 border border-amber-500'
                                  : isSelected
                                  ? 'ring-2 ring-white scale-110 shadow-lg text-white font-black z-10'
                                  : 'hover:scale-110 hover:shadow-md text-slate-950 hover:brightness-110'
                              }`}
                              title={`Row ${seat.row} - Seat ${seat.number} (${tier?.name}) - ${formatINR(seat.price)}`}
                            >
                              {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : seat.number}
                            </button>
                          );
                        })}
                      </div>

                      <span className="w-4 text-center font-mono font-bold text-xs text-slate-500">
                        {rowLetter}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Hover Tooltip display */}
              <div className="h-9 mt-4 flex items-center justify-center">
                {hoveredSeat ? (
                  <div className="px-3 py-1 bg-slate-950 border border-indigo-500/40 rounded-xl text-xs flex items-center space-x-3 text-slate-200 shadow-md">
                    <span className="font-semibold text-white">
                      Row {hoveredSeat.row}, Seat {hoveredSeat.number}
                    </span>
                    <span>•</span>
                    <span className="text-cyan-300">{hoveredSeat.tierName}</span>
                    <span>•</span>
                    <span className="font-bold text-white">{formatINR(hoveredSeat.price)}</span>
                    {hoveredSeat.price > (event?.tiers?.find((t) => t.name === hoveredSeat.tierName)?.basePrice || 0) && (
                      <span className="text-[10px] text-amber-400 font-mono">
                        🔥 Dynamic Surge
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-slate-500">
                    Hover over seats to preview location, tier & dynamic price
                  </span>
                )}
              </div>
            </div>

            {/* Seating Tier Legend */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs">
              {(event?.tiers || []).map((tier) => (
                <div key={tier.id} className="flex items-center space-x-1.5">
                  <span
                    className="w-3.5 h-3.5 rounded-md shadow-sm"
                    style={{ backgroundColor: tier.color }}
                  />
                  <span className="text-slate-300 font-medium">{tier.name}</span>
                  <span className="text-white font-bold">{formatINR(tier.currentPrice)}</span>
                </div>
              ))}
              <div className="flex items-center space-x-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-slate-800 border border-slate-700 opacity-40" />
                <span className="text-slate-500">Sold</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-amber-800 border border-amber-600" />
                <span className="text-amber-400">Held (Other Terminal)</span>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Dynamic Pricing Breakdown & Reservation Summary */}
          <div className="p-6 bg-slate-900 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-sm text-white flex items-center justify-between">
                  <span>Selected Seats ({selectedSeats.length})</span>
                  <span className="text-xs text-slate-400 font-normal">Max 6 per booking</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Held under Terminal: {currentTerminal?.id || 'Local'}
                </p>
              </div>

              {/* Selected List */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedSeats.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
                    Click on any available seat on the venue map to add to your order.
                  </div>
                ) : (
                  selectedSeats.map((s) => {
                    const tier = event?.tiers?.find((t) => t.id === s.tierId);
                    const isSurging = tier && tier.surgeMultiplier > 1.05;
                    return (
                      <div
                        key={s.id}
                        className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="w-6 h-6 rounded-lg bg-indigo-600/20 text-indigo-300 font-bold flex items-center justify-center text-[11px]">
                            {s.row}{s.number}
                          </span>
                          <div>
                            <div className="font-semibold text-white">{s.tierName}</div>
                            <div className="text-[10px] text-slate-400">Row {s.row} • Seat {s.number}</div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <div className="font-bold text-white">{formatINR(s.price)}</div>
                            {isSurging && (
                              <div className="text-[9px] text-amber-400 font-mono">
                                +{Math.round((tier.surgeMultiplier - 1) * 100)}% Surge
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleToggleSeat(s)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                            title="Remove"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Dynamic Pricing Engine Transparency Box */}
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                  <span className="flex items-center space-x-1">
                    <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Dynamic Pricing Policy Applied</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">Active</span>
                </div>

                <div className="text-[11px] text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Occupancy Scarcity Factor:</span>
                    <span className="text-slate-200 font-mono">
                      {Math.round((event.soldSeats / event.totalSeats) * 100)}% sold
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Recent Booking Velocity:</span>
                    <span className="text-slate-200 font-mono">{event.recentBookingVelocity} req/min</span>
                  </div>
                  {event.dynamicPricingPolicy.timeDecayEnabled && (
                    <div className="flex justify-between">
                      <span>Time-Decay Window:</span>
                      <span className="text-emerald-400 font-mono">Standard Window</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Price Calculation Summary */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Base Tickets Subtotal:</span>
                  <span className="font-mono text-slate-200">{formatINR(baseSubtotal)}</span>
                </div>
                {dynamicSurgeTotal > 0 && (
                  <div className="flex justify-between text-amber-400">
                    <span className="flex items-center space-x-1">
                      <Flame className="w-3 h-3 inline mr-1" />
                      <span>Dynamic Demand Surge:</span>
                    </span>
                    <span className="font-mono">+{formatINR(dynamicSurgeTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Facility Fee & Taxes (8%):</span>
                  <span className="font-mono text-slate-200">{formatINR(taxesAndFees)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                  <span>Total Amount:</span>
                  <span className="font-mono text-indigo-300 text-base">{formatINR(grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Bottom Checkout CTA */}
            <div className="space-y-2">
              <button
                id="proceed-checkout-button"
                disabled={selectedSeats.length === 0}
                onClick={() => onProceedToCheckout(selectedSeats, event)}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Proceed to Secure Checkout</span>
              </button>

              <div className="text-[10px] text-center text-slate-500 flex items-center justify-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Encrypted & Verified Transaction Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
