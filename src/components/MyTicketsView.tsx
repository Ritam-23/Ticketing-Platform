import React from 'react';
import {
  QrCode,
  Calendar,
  MapPin,
  Ticket,
  Printer,
  Share2,
  Clock,
  Cpu,
  Sparkles,
} from 'lucide-react';
import { Order } from '../types.js';
import { formatINR } from '../lib/formatters.js';

interface MyTicketsViewProps {
  orders: Order[];
  onBrowseEvents: () => void;
}

export const MyTicketsView: React.FC<MyTicketsViewProps> = ({ orders, onBrowseEvents }) => {
  const confirmedOrders = orders.filter((o) => o.status === 'confirmed');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Ticket className="w-5 h-5 text-indigo-400" />
            <span>My Digital Tickets & Admission Passes</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographically signed passes issued across registered physical terminals
          </p>
        </div>

        <button
          onClick={onBrowseEvents}
          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm self-start sm:self-auto"
        >
          Browse More Events
        </button>
      </div>

      {confirmedOrders.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-4">
          <Ticket className="w-12 h-12 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white">No Tickets Purchased Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Select an upcoming concert, theater show, or sporting event to experience real-time dynamic pricing and instant digital ticket issuance.
            </p>
          </div>
          <button
            onClick={onBrowseEvents}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30"
          >
            Explore Events Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {confirmedOrders.map((order) => (
            <div
              key={order.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-slate-700 shadow-xl transition-all flex flex-col justify-between group"
            >
              {/* Ticket Top Ribbon */}
              <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 p-5 border-b border-slate-800/80 flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {order.eventCategory} Pass
                  </span>
                  <h3 className="font-bold text-lg text-white mt-1.5 group-hover:text-indigo-300 transition-colors">
                    {order.eventTitle}
                  </h3>
                  <div className="flex items-center space-x-3 text-xs text-slate-300 mt-1">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{order.eventDate} at {order.eventTime}</span>
                    </div>
                  </div>
                </div>

                <div className="w-14 h-14 bg-white p-1 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                  <QrCode className="w-12 h-12 text-slate-950" />
                </div>
              </div>

              {/* Middle Ticket Body */}
              <div className="p-5 space-y-4">
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                  <span>{order.eventVenue}</span>
                </div>

                {/* Seats list */}
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Reserved Seats ({order.seats.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {order.seats.map((s) => (
                      <span
                        key={s.seatId}
                        className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 text-xs font-mono font-bold"
                      >
                        Row {s.row} - Seat {s.number} ({s.tierName})
                      </span>
                    ))}
                  </div>
                </div>

                {/* Metadata details */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-400">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Total Paid</span>
                    <span className="text-white font-bold text-sm">{formatINR(order.totalAmount)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Issued Terminal</span>
                    <span className="text-cyan-400 truncate block">{order.terminalName}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="px-5 py-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500 font-mono">
                  Token: {order.qrCodeData}
                </span>

                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-1 text-slate-300 hover:text-white transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Pass</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
