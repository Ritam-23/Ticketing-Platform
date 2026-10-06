import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Ticket,
  Flame,
  Laptop,
  Monitor,
  Server,
  Smartphone,
  Calendar,
  Layers,
  Sparkles,
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  Clock,
  MapPin,
  Music,
  Drama,
  Trophy,
} from 'lucide-react';
import { AnalyticsData, DeviceType, EventItem, Order } from '../types.js';
import { formatINR } from '../lib/formatters.js';

interface AnalyticsViewProps {
  data: AnalyticsData | null;
  events?: EventItem[];
  orders?: Order[];
  onRefresh: () => Promise<void>;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  data,
  events = [],
  orders = [],
  onRefresh,
}) => {
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const [eventCategoryFilter, setEventCategoryFilter] = useState<'all' | 'concert' | 'theater' | 'sports'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!data) {
    return (
      <div className="p-12 text-center text-xs text-slate-400">
        Loading real-time admin analytics engine...
      </div>
    );
  }

  const getDeviceIcon = (type: DeviceType) => {
    switch (type) {
      case 'kiosk':
        return <Server className="w-4 h-4" />;
      case 'mobile_pos':
        return <Smartphone className="w-4 h-4" />;
      case 'desktop':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Laptop className="w-4 h-4" />;
    }
  };

  const filteredEvents = events.filter((e) => {
    const matchesCat = eventCategoryFilter === 'all' || e.category === eventCategoryFilter;
    const matchesSearch =
      e.title.toLowerCase().includes(eventSearchQuery.toLowerCase()) ||
      e.venue.toLowerCase().includes(eventSearchQuery.toLowerCase()) ||
      e.city.toLowerCase().includes(eventSearchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const totalAudienceCount = events.reduce((acc, evt) => acc + (evt.soldSeats || 0), 0);
  const totalCapacityCount = events.reduce((acc, evt) => acc + (evt.totalSeats || 0), 0);
  const surgeEventsCount = events.filter((e) => {
    const mult = e.tiers?.[0]?.surgeMultiplier || 1.0;
    return mult > 1.0;
  }).length;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Header & Overview Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
                <span>Admin Monitor: Events, Audiences & Dynamic Pricing</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Platform Admin
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time supervision of active events going on, audience counts by tier, and dynamic pricing multipliers
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="flex items-center space-x-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-all self-start sm:self-auto shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : 'text-slate-400'}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh Live Metrics'}</span>
        </button>
      </div>

      {/* ADMIN PRIMARY SUPERVISOR: EVENTS GOING ON, AUDIENCES COUNT & DYNAMIC PRICING */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <span>Events Going On & Live Audience Counts</span>
            </h3>
            <p className="text-xs text-slate-400">
              Active ongoing events, ticket sales count, audience capacity, and live dynamic pricing status
            </p>
          </div>

          {/* Quick Metrics Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span><strong>{events.length}</strong> Events Active</span>
            </span>
            <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span><strong>{totalAudienceCount}</strong> Total Audiences ({totalCapacityCount > 0 ? Math.round((totalAudienceCount / totalCapacityCount) * 100) : 0}% Filled)</span>
            </span>
            <span className="px-3 py-1 rounded-xl bg-slate-900 border border-amber-500/30 text-xs text-amber-300 flex items-center space-x-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span><strong>{surgeEventsCount}</strong> Surging Events</span>
            </span>
          </div>
        </div>

        {/* Filter and Search Bar for Admin Events */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
          <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setEventCategoryFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                eventCategoryFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              All Categories ({events.length})
            </button>
            <button
              onClick={() => setEventCategoryFilter('concert')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1 ${
                eventCategoryFilter === 'concert'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Music className="w-3 h-3" />
              <span>Concerts</span>
            </button>
            <button
              onClick={() => setEventCategoryFilter('theater')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1 ${
                eventCategoryFilter === 'theater'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Drama className="w-3 h-3" />
              <span>Theaters</span>
            </button>
            <button
              onClick={() => setEventCategoryFilter('sports')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1 ${
                eventCategoryFilter === 'sports'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Trophy className="w-3 h-3" />
              <span>Sports</span>
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search ongoing event..."
              value={eventSearchQuery}
              onChange={(e) => setEventSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Ongoing Events Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredEvents.map((evt) => {
            const occupancyPct = Math.round((evt.soldSeats / evt.totalSeats) * 100) || 0;
            const primaryMultiplier = evt.tiers?.[0]?.surgeMultiplier || 1.0;
            const hasDynamicSurge = primaryMultiplier > 1.0;
            const scarcityThreshold = evt.dynamicPricingPolicy?.scarcityThresholdPct || 70;
            const isScarcityTriggered = occupancyPct >= scarcityThreshold;

            return (
              <div
                key={evt.id}
                id={`admin-event-card-${evt.id}`}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 hover:border-slate-700 transition-all"
              >
                {/* Event Heading & Live Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                        <span>Live & On Sale</span>
                      </span>

                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {evt.category}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white tracking-tight">{evt.title}</h4>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{evt.date} at {evt.time}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{evt.venue}, {evt.city}</span>
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Pricing Status Badge */}
                  <div className="text-right">
                    <div
                      className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold font-mono border ${
                        hasDynamicSurge
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700'
                      }`}
                    >
                      <Flame className={`w-3.5 h-3.5 ${hasDynamicSurge ? 'text-amber-400 fill-amber-400 animate-pulse' : 'text-slate-400'}`} />
                      <span>{primaryMultiplier.toFixed(2)}x Multiplier</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {hasDynamicSurge ? 'Surge Pricing Active' : 'Standard Base Rates'}
                    </div>
                  </div>
                </div>

                {/* Section A: Count of Audiences of this Event */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1.5 font-semibold text-slate-200">
                      <Users className="w-4 h-4 text-indigo-400" />
                      <span>Audience Capacity & Ticket Count</span>
                    </div>
                    <div className="font-mono text-white font-bold">
                      {evt.soldSeats} / {evt.totalSeats} Attendees ({occupancyPct}%)
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800/60">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        occupancyPct > 80 ? 'bg-rose-500' : occupancyPct > 50 ? 'bg-amber-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${occupancyPct}%` }}
                    />
                  </div>

                  {/* Seat Availability Summary */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                    <span className="text-emerald-400 font-medium">
                      {evt.totalSeats - evt.soldSeats} remaining audience seats available
                    </span>
                    <span className="font-mono text-slate-500">
                      Velocity: {evt.recentBookingVelocity || 2} sales/min
                    </span>
                  </div>

                  {/* Audience Count Breakdown per Seating Tier */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800/70">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Audience Attendance by Seating Tier
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {evt.tiers.map((tier) => {
                        const tierPct = Math.round((tier.soldCount / tier.totalCapacity) * 100) || 0;
                        return (
                          <div
                            key={tier.id}
                            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="flex items-center space-x-1 text-slate-300 truncate font-medium">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tier.color }} />
                                <span className="truncate">{tier.name}</span>
                              </span>
                              <span className="font-mono font-bold text-white">{tier.soldCount}/{tier.totalCapacity}</span>
                            </div>
                            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${tierPct}%`,
                                  backgroundColor: tier.color,
                                }}
                              />
                            </div>
                            <div className="text-[10px] text-slate-500 text-right font-mono">
                              {tierPct}% filled
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Section B: Dynamic Pricing of this Event */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1.5 font-semibold text-slate-200">
                      <Flame className="w-4 h-4 text-amber-400" />
                      <span>Dynamic Pricing Engine & Tier Rates</span>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        evt.dynamicPricingPolicy?.enabled
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {evt.dynamicPricingPolicy?.enabled ? 'Algorithmic Pricing Active' : 'Fixed Pricing'}
                    </span>
                  </div>

                  {/* Tier Pricing Comparison Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                          <th className="pb-1.5 font-medium">Tier Name</th>
                          <th className="pb-1.5 font-medium">Base Price</th>
                          <th className="pb-1.5 font-medium">Current Dynamic Price</th>
                          <th className="pb-1.5 font-medium text-right">Surge Lift</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {evt.tiers.map((tier) => {
                          const surgeAmount = tier.currentPrice - tier.basePrice;
                          return (
                            <tr key={tier.id} className="text-slate-300">
                              <td className="py-2 flex items-center space-x-1.5 font-medium">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tier.color }} />
                                <span>{tier.name}</span>
                              </td>
                              <td className="py-2 text-slate-400 font-mono">{formatINR(tier.basePrice)}</td>
                              <td className="py-2 font-mono font-bold text-white">
                                {formatINR(tier.currentPrice)}
                              </td>
                              <td className="py-2 text-right font-mono font-semibold">
                                {surgeAmount > 0 ? (
                                  <span className="text-amber-400">
                                    +{formatINR(surgeAmount)} ({(tier.surgeMultiplier * 100 - 100).toFixed(0)}%)
                                  </span>
                                ) : (
                                  <span className="text-slate-500">₹0 (1.0x)</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Active Policy Rules for this Event */}
                  <div className="pt-2 border-t border-slate-800/70 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-slate-400">
                    <div className="bg-slate-900/60 p-2 rounded-xl">
                      <span className="text-slate-500 block">Scarcity Rule:</span>
                      <span className="font-semibold text-slate-200">
                        &gt;{evt.dynamicPricingPolicy?.scarcityThresholdPct || 70}% capacity
                      </span>
                    </div>
                    <div className="bg-slate-900/60 p-2 rounded-xl">
                      <span className="text-slate-500 block">Velocity Rule:</span>
                      <span className="font-semibold text-slate-200">
                        {evt.dynamicPricingPolicy?.highDemandVelocityThreshold || 5} tix/min
                      </span>
                    </div>
                    <div className="bg-slate-900/60 p-2 rounded-xl">
                      <span className="text-slate-500 block">Price Floor/Ceil:</span>
                      <span className="font-semibold text-slate-200">
                        {formatINR(evt.dynamicPricingPolicy?.minPriceFloor || 999)} - {formatINR(evt.dynamicPricingPolicy?.maxPriceCeiling || 9000)}
                      </span>
                    </div>
                    <div className="bg-slate-900/60 p-2 rounded-xl">
                      <span className="text-slate-500 block">Time Decay:</span>
                      <span className="font-semibold text-slate-200">
                        {evt.dynamicPricingPolicy?.timeDecayEnabled ? 'Active (20% last hr)' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PLATFORM OVERALL METRICS & KPIs */}
      <div className="pt-6 border-t border-slate-800 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span>Platform Financial Yield & Machine Terminal Metrics</span>
          </h3>
          <p className="text-xs text-slate-400">
            High-level gross revenues, dynamic surge profit yield, and physical hardware terminal breakdown
          </p>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1: Total Gross Revenue */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium">Total Gross Revenue</span>
              <div className="w-7 h-7 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {formatINR(data.totalRevenue)}
            </div>
            <div className="text-[11px] text-emerald-400 flex items-center space-x-1">
              <TrendingUp className="w-3 h-3" />
              <span>+18.4% vs baseline</span>
            </div>
          </div>

          {/* Metric 2: Total Tickets Sold */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium">Total Tickets Sold</span>
              <div className="w-7 h-7 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center">
                <Ticket className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {data.totalTicketsSold} <span className="text-xs font-normal text-slate-400">passes</span>
            </div>
            <div className="text-[11px] text-cyan-400">
              Across {events.length} live event venues
            </div>
          </div>

          {/* Metric 3: Dynamic Pricing Yield */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-amber-500/30 shadow-xl space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium text-amber-300">Dynamic Pricing Yield</span>
              <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Flame className="w-4 h-4 fill-amber-400" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono">
              +{formatINR(data.dynamicPricingYield)}
            </div>
            <div className="text-[11px] text-amber-300/90 font-medium">
              Additional margin captured from surge policies
            </div>
          </div>

          {/* Metric 4: Average Ticket Price */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium">Average Ticket Yield</span>
              <div className="w-7 h-7 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {formatINR(data.averageTicketPrice)}
            </div>
            <div className="text-[11px] text-slate-400">
              Weighted blend across all tiers
            </div>
          </div>
        </div>

        {/* Sales by Hardware Terminal & Hourly Surge Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Hardware Terminal Sales Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Server className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-white">Sales by Physical Hardware Terminal</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {(data.salesByTerminal || []).length} Terminals Connected
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Audience ticket volume originated from connected box office kiosks, mobile POS, and counter stations.
            </p>

            <div className="space-y-3 pt-2">
              {(data.salesByTerminal || []).map((term) => {
                const maxRev = Math.max(...(data.salesByTerminal || []).map((t) => t.revenue || 1), 1);
                const pct = Math.round((term.revenue / maxRev) * 100);
                return (
                  <div key={term.terminalId} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-900 text-cyan-400 flex items-center justify-center border border-slate-800">
                          {getDeviceIcon(term.deviceType)}
                        </div>
                        <div>
                          <span className="font-bold text-xs text-white block">{term.terminalName}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{term.terminalId}</span>
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <span className="font-bold text-white text-xs block">{formatINR(term.revenue)}</span>
                        <span className="text-[10px] text-slate-400">{term.salesCount} tickets</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hourly Trend & Dynamic Multiplier Surge Correlation */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Hourly Sales Velocity & Surge Multiplier</h3>
              </div>
              <p className="text-xs text-slate-400">
                Hourly correlation of ticket sales demand with automated dynamic pricing multiplier adjustments.
              </p>

              {/* Custom SVG Trend Chart */}
              <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                  <span className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-indigo-500" />
                    <span>Gross Sales (₹)</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-amber-400" />
                    <span>Surge Multiplier (x)</span>
                  </span>
                </div>

                {/* Histogram */}
                <div className="h-40 flex items-end justify-between gap-3 pt-4 border-b border-slate-800">
                  {(data.salesTrend || []).map((pt, i) => {
                    const maxRev = 6000;
                    const barHeightPct = Math.min(100, Math.round((pt.revenue / maxRev) * 100));
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                        <div className="text-[9px] text-amber-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                          {pt.surgeMultiplier}x
                        </div>
                        <div className="w-full bg-slate-900 h-28 rounded-lg flex items-end overflow-hidden">
                          <div
                            className="w-full bg-indigo-600 group-hover:bg-indigo-500 rounded-lg transition-all"
                            style={{ height: `${barHeightPct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono mt-1">{pt.time}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between text-[10px] text-slate-500 pt-2 font-mono">
                  <span>Peak Demand Window: 13:00 (1.25x Dynamic Multiplier)</span>
                  <span>Automated Yield Optimization</span>
                </div>
              </div>
            </div>

            {/* Tier Breakdown Badges */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Platform Seating Tier Share
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(data.tierBreakdown || []).map((tb) => (
                  <div key={tb.name} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tb.color }} />
                      <span className="text-slate-300 truncate font-medium">{tb.name}</span>
                    </div>
                    <div className="mt-1 font-bold text-white font-mono">{formatINR(tb.revenue)}</div>
                    <div className="text-[10px] text-slate-500">{tb.sold} tickets</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
