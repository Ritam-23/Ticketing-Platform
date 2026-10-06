import React, { useState } from 'react';
import {
  Search,
  Calendar,
  MapPin,
  Flame,
  Ticket,
  Music,
  Drama,
  Trophy,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { EventCategory, EventItem } from '../types.js';
import { formatINR } from '../lib/formatters.js';

interface AudienceCatalogProps {
  events: EventItem[];
  onSelectEvent: (event: EventItem) => void;
  onOpenPricingSimulator?: (event: EventItem) => void;
}

export const AudienceCatalog: React.FC<AudienceCatalogProps> = ({
  events,
  onSelectEvent,
  onOpenPricingSimulator,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEvents = events.filter((e) => {
    const matchesCat = selectedCategory === 'all' || e.category === selectedCategory;
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getCategoryBadge = (cat: EventCategory) => {
    switch (cat) {
      case 'concert':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30">
            <Music className="w-3 h-3" />
            <span>Concert</span>
          </span>
        );
      case 'theater':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <Drama className="w-3 h-3" />
            <span>Theater</span>
          </span>
        );
      case 'sports':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Trophy className="w-3 h-3" />
            <span>Sports</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner / Hero Feature */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 md:p-8 shadow-xl shadow-indigo-950/20">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Real-Time Seat Locking & Dynamic Pricing Enabled</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Live Concerts, Theaters & Sporting Events
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Direct real-time booking across physical box office terminals and audience web clients with dynamic surge pricing and instant digital passes.
          </p>
        </div>
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            id="filter-cat-all"
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            All Events ({events.length})
          </button>
          <button
            id="filter-cat-concert"
            onClick={() => setSelectedCategory('concert')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              selectedCategory === 'concert'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Concerts</span>
          </button>
          <button
            id="filter-cat-theater"
            onClick={() => setSelectedCategory('theater')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              selectedCategory === 'theater'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Drama className="w-3.5 h-3.5" />
            <span>Theaters</span>
          </button>
          <button
            id="filter-cat-sports"
            onClick={() => setSelectedCategory('sports')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              selectedCategory === 'sports'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Sports</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            id="catalog-search-input"
            type="text"
            placeholder="Search artists, venues, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredEvents.map((event) => {
          const totalSeats = event.totalSeats || 1;
          const occupancyPct = Math.round(((event.soldSeats || 0) / totalSeats) * 100);
          const hasSurge = event.tiers?.some((t) => t.surgeMultiplier > 1.05) || false;
          const currentPrices = (event.tiers || []).map((t) => t.currentPrice);
          const basePrices = (event.tiers || []).map((t) => t.basePrice);
          const lowestCurrentPrice = currentPrices.length > 0 ? Math.min(...currentPrices) : 0;
          const lowestBasePrice = basePrices.length > 0 ? Math.min(...basePrices) : 0;

          return (
            <div
              key={event.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-slate-700 transition-all hover:shadow-2xl hover:shadow-indigo-950/30 flex flex-col group"
            >
              {/* Event Image Banner */}
              <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-950">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />

                {/* Badges on Image */}
                <div className="absolute top-3 left-3 flex items-center space-x-2">
                  {getCategoryBadge(event.category)}
                  {hasSurge && (
                    <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/90 text-slate-950 shadow-md">
                      <Flame className="w-3 h-3 fill-slate-950" />
                      <span>Dynamic Surge Active</span>
                    </span>
                  )}
                </div>

                {/* Organizer tag */}
                <div className="absolute bottom-3 left-4 text-xs text-slate-300 font-medium">
                  Presented by <span className="text-white font-semibold">{event.executorName}</span>
                </div>
              </div>

              {/* Event Details */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-bold text-lg text-white group-hover:text-indigo-300 transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-slate-300">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{event.date} at {event.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="truncate">{event.venue}, {event.city}</span>
                    </div>
                  </div>
                </div>

                {/* Seating Tiers & Dynamic Pricing Ribbon */}
                <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium flex items-center space-x-1">
                      <TrendingUp className="w-3 h-3 text-cyan-400" />
                      <span>Dynamic Pricing Tiers</span>
                    </span>
                    <span className="text-cyan-400 font-mono text-[10px]">
                      {event.recentBookingVelocity > 0 ? `${event.recentBookingVelocity} bookings recently` : 'Normal Velocity'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {(event.tiers || []).map((tier) => (
                      <div
                        key={tier.id}
                        className="flex items-center space-x-1.5 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px]"
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: tier.color }}
                        />
                        <span className="text-slate-300 font-medium">{tier.name}</span>
                        <span className="font-semibold text-white">
                          {formatINR(tier.currentPrice)}
                        </span>
                        {tier.surgeMultiplier > 1.05 && (
                          <span className="text-[9px] text-amber-400 font-mono">
                            +{(Math.round((tier.surgeMultiplier - 1) * 100))}%
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Seat capacity bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>{occupancyPct}% Sold ({event.soldSeats}/{event.totalSeats} seats)</span>
                      <span className="text-emerald-400">{event.totalSeats - event.soldSeats} remaining</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          occupancyPct > 80 ? 'bg-rose-500' : occupancyPct > 50 ? 'bg-amber-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${occupancyPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-medium">Tickets Starting at</div>
                    <div className="flex items-baseline space-x-1.5">
                      <span className="text-xl font-black text-white">{formatINR(lowestCurrentPrice)}</span>
                      {hasSurge && lowestCurrentPrice > lowestBasePrice && (
                        <span className="text-xs text-slate-500 line-through">{formatINR(lowestBasePrice)}</span>
                      )}
                      <span className="text-[11px] text-slate-400 font-normal">/ seat</span>
                    </div>
                  </div>

                  <button
                    id={`select-seats-btn-${event.id}`}
                    onClick={() => onSelectEvent(event)}
                    className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 group-hover:shadow-indigo-600/40 transition-all"
                  >
                    <span>Select Seats</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-3">
          <Ticket className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-sm font-semibold text-slate-300">No events matched your search</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords or switch category filter to "All Events".
          </p>
        </div>
      )}
    </div>
  );
};
