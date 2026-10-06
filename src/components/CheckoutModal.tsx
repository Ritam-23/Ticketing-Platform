import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  CreditCard,
  CheckCircle2,
  QrCode,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Download,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { EventItem, Order, Seat, Terminal, User } from '../types.js';
import { formatINR } from '../lib/formatters.js';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem | null;
  selectedSeats: Seat[];
  currentUser: User | null;
  currentTerminal: Terminal | null;
  onConfirmOrder: (payload: {
    eventId: string;
    selectedSeats: Seat[];
    userId: string;
    terminalId: string;
    paymentMethod: string;
    idempotencyKey: string;
  }) => Promise<{ order: Order }>;
  onViewTickets: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  event,
  selectedSeats,
  currentUser,
  currentTerminal,
  onConfirmOrder,
  onViewTickets,
}) => {
  const [paymentMethod, setPaymentMethod] = useState('UPI / QR Payment');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [idempotencyKey] = useState(`idemp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`);

  if (!isOpen || !event) return null;

  const baseSubtotal = (selectedSeats || []).reduce((sum, s) => {
    const tier = event?.tiers?.find((t) => t.id === s.tierId);
    return sum + (tier ? tier.basePrice : s.price);
  }, 0);

  const currentSubtotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const dynamicSurgeAmount = Math.max(0, currentSubtotal - baseSubtotal);
  const taxesAndFees = Math.round(currentSubtotal * 0.08);
  const totalAmount = currentSubtotal + taxesAndFees;

  const handlePay = async () => {
    setIsProcessing(true);

    try {
      const res = await onConfirmOrder({
        eventId: event.id,
        selectedSeats,
        userId: currentUser?.id || 'guest-attendee',
        terminalId: currentTerminal?.id || 'term-mac-sf-01',
        paymentMethod,
        idempotencyKey,
      });

      setCompletedOrder(res.order);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      alert(err.message || 'Transaction could not be processed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div
        id="checkout-modal-container"
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl text-slate-100 max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                {completedOrder ? 'Ticket Confirmation & Pass' : 'Secure Checkout'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Idempotency Key: <span className="font-mono text-cyan-400">{idempotencyKey}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* STATE 1: Completed Order Success with Digital Pass */}
          {completedOrder ? (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-base text-white">Payment & Ticket Reservation Confirmed!</h4>
                <p className="text-xs text-emerald-300">
                  Transaction #{completedOrder.id} • Authenticated from {currentTerminal?.name}
                </p>
              </div>

              {/* Digital Boarding Pass / Ticket Card */}
              <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-indigo-500/30 p-5 shadow-xl space-y-4 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Official Digital Admission Pass
                    </span>
                    <h3 className="font-extrabold text-lg text-white mt-1.5">{completedOrder.eventTitle}</h3>
                    <p className="text-xs text-slate-400">
                      {completedOrder.eventVenue} • {completedOrder.eventDate} at {completedOrder.eventTime}
                    </p>
                  </div>

                  <div className="w-16 h-16 bg-white p-1 rounded-xl flex items-center justify-center shadow-md">
                    <QrCode className="w-14 h-14 text-slate-900" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-800 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Attendee</span>
                    <span className="font-semibold text-slate-200 truncate block">{completedOrder.userName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Seats</span>
                    <span className="font-semibold text-cyan-400 block">
                      {completedOrder.seats.map((s) => `${s.row}${s.number}`).join(', ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Total Paid</span>
                    <span className="font-bold text-emerald-400 block">{formatINR(completedOrder.totalAmount)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Pass Token: {completedOrder.qrCodeData}</span>
                  <span className="text-emerald-400">Cryptographically Signed</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handlePrint}
                  className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download / Print Pass</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onViewTickets();
                  }}
                  className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <span>Go to My Tickets</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* STATE 2: Standard Checkout Form */
            <div className="space-y-4">
              {/* Event summary banner */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider">
                      {event.category}
                    </span>
                    <h4 className="font-bold text-sm text-white">{event.title}</h4>
                    <p className="text-xs text-slate-400">
                      {event.venue}, {event.city} • {event.date} at {event.time}
                    </p>
                  </div>
                  <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                    {selectedSeats.length} seats
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {selectedSeats.map((s) => (
                    <span
                      key={s.id}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300"
                    >
                      Row {s.row} Seat {s.number} ({formatINR(s.price)})
                    </span>
                  ))}
                </div>
              </div>

              {/* Physical Machine & Terminal Stamp */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-slate-400">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Authorizing Physical Machine:</span>
                </div>
                <span className="font-mono text-cyan-300 text-[11px]">
                  {currentTerminal?.name} ({currentTerminal?.ip})
                </span>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Select Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'UPI / QR Payment',
                    'Credit / Debit Card (POS)',
                    'Net Banking',
                    'Cash at Box Office Counter',
                  ].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        paymentMethod === method
                          ? 'border-indigo-500 bg-indigo-500/10 text-white font-semibold'
                          : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-1.5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Base Ticket Price:</span>
                  <span className="font-mono text-slate-200">{formatINR(baseSubtotal)}</span>
                </div>
                {dynamicSurgeAmount > 0 && (
                  <div className="flex justify-between text-amber-400">
                    <span className="flex items-center space-x-1">
                      <Flame className="w-3 h-3 inline mr-1" />
                      <span>Dynamic Demand Surge:</span>
                    </span>
                    <span className="font-mono">+{formatINR(dynamicSurgeAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Taxes & Processing Fee (8%):</span>
                  <span className="font-mono text-slate-200">{formatINR(taxesAndFees)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                  <span>Total Amount Due:</span>
                  <span className="font-mono text-indigo-300 text-base">{formatINR(totalAmount)}</span>
                </div>
              </div>

              <button
                id="submit-payment-btn"
                disabled={isProcessing}
                onClick={handlePay}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Transaction...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Authorize & Issue Digital Pass ({formatINR(totalAmount)})</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
