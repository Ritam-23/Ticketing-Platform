import React, { useState } from 'react';
import {
  Sliders,
  Plus,
  Flame,
  TrendingUp,
  Save,
  CheckCircle2,
  Calendar,
  DollarSign,
  AlertCircle,
  Clock,
  Sparkles,
  BarChart,
  Tag,
  Percent,
} from 'lucide-react';
import { DynamicPricingPolicy, EventCategory, EventItem, User } from '../types.js';
import { formatINR } from '../lib/formatters.js';

interface ExecutorHubProps {
  events: EventItem[];
  currentUser: User | null;
  onUpdatePolicy: (eventId: string, policy: DynamicPricingPolicy) => Promise<void>;
  onCreateEvent: (eventData: Partial<EventItem>) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export const ExecutorHub: React.FC<ExecutorHubProps> = ({
  events = [],
  currentUser,
  onUpdatePolicy,
  onCreateEvent,
  onRefresh,
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>(events?.[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'policy' | 'create_event' | 'inventory'>('policy');

  // Policy Form State
  const selectedEvent = (events || []).find((e) => e.id === selectedEventId) || events?.[0];
  const [policy, setPolicy] = useState<DynamicPricingPolicy>(
    selectedEvent?.dynamicPricingPolicy || {
      enabled: true,
      scarcityMultiplier: 1.25,
      scarcityThresholdPct: 70,
      highDemandVelocityThreshold: 4,
      velocityMultiplier: 1.15,
      timeDecayEnabled: true,
      earlyBirdDiscountPct: 15,
      lastMinuteSurgePct: 20,
      maxPriceCeiling: 9000,
      minPriceFloor: 999,
    }
  );

  React.useEffect(() => {
    if (selectedEvent?.dynamicPricingPolicy) {
      setPolicy({ ...selectedEvent.dynamicPricingPolicy });
    }
  }, [selectedEvent?.id]);

  React.useEffect(() => {
    if (!selectedEventId && events && events.length > 0 && events[0]?.id) {
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId]);

  const [isSavingPolicy, setIsSavingPolicy] = useState(false);
  const [policySavedNotice, setPolicySavedNotice] = useState(false);

  // Simulation Slider State for Dynamic Pricing Curve
  const [simulatedSoldPct, setSimulatedSoldPct] = useState<number>(65);

  // Create Event Form State
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventCategory, setNewEventCategory] = useState<EventCategory>('concert');
  const [newEventDate, setNewEventDate] = useState('2026-11-15');
  const [newEventTime, setNewEventTime] = useState('20:00');
  const [newEventVenue, setNewEventVenue] = useState('Jio World Convention Centre');
  const [newEventCity, setNewEventCity] = useState('Mumbai');
  const [newEventImage, setNewEventImage] = useState(
    'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&auto=format&fit=crop&q=80'
  );
  const [newEventDesc, setNewEventDesc] = useState('Spectacular live production.');
  const [vipPrice, setVipPrice] = useState(4500);
  const [goldPrice, setGoldPrice] = useState(2500);
  const [genPrice, setGenPrice] = useState(1200);
  const [isCreating, setIsCreating] = useState(false);

  // Update policy state when event changes
  const handleSelectEvent = (evtId: string) => {
    setSelectedEventId(evtId);
    const evt = events.find((e) => e.id === evtId);
    if (evt) {
      setPolicy({ ...evt.dynamicPricingPolicy });
      setPolicySavedNotice(false);
    }
  };

  const handleSavePolicy = async () => {
    if (!selectedEvent) return;
    setIsSavingPolicy(true);
    try {
      await onUpdatePolicy(selectedEvent.id, policy);
      setPolicySavedNotice(true);
      setTimeout(() => setPolicySavedNotice(false), 3000);
    } finally {
      setIsSavingPolicy(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle) return;
    setIsCreating(true);
    try {
      await onCreateEvent({
        title: newEventTitle,
        category: newEventCategory,
        date: newEventDate,
        time: newEventTime,
        venue: newEventVenue,
        city: newEventCity,
        image: newEventImage,
        description: newEventDesc,
        executorId: currentUser?.id || 'user-executor-01',
        executorName: currentUser?.name || 'Metropolis Live',
        tiers: [
          { id: `t-vip-${Date.now()}`, name: 'Stagefront VIP', basePrice: Number(vipPrice), currentPrice: Number(vipPrice), surgeMultiplier: 1.0, totalCapacity: 20, soldCount: 0, color: '#f59e0b' },
          { id: `t-gold-${Date.now()}`, name: 'Gold Reserved', basePrice: Number(goldPrice), currentPrice: Number(goldPrice), surgeMultiplier: 1.0, totalCapacity: 20, soldCount: 0, color: '#3b82f6' },
          { id: `t-gen-${Date.now()}`, name: 'General Admission', basePrice: Number(genPrice), currentPrice: Number(genPrice), surgeMultiplier: 1.0, totalCapacity: 20, soldCount: 0, color: '#10b981' },
        ],
        dynamicPricingPolicy: { ...policy },
      });
      setActiveTab('policy');
      setNewEventTitle('');
    } finally {
      setIsCreating(false);
    }
  };

  // Calculate simulated pricing outcome based on current policy and slider
  const sampleBasePrice = selectedEvent?.tiers?.[0]?.basePrice || 4500;
  let simulatedMultiplier = 1.0;
  let simulatedTriggeredRules: string[] = [];

  if (policy.enabled) {
    if (simulatedSoldPct >= policy.scarcityThresholdPct) {
      const lift = (policy.scarcityMultiplier - 1.0) * (1 + (simulatedSoldPct - policy.scarcityThresholdPct) / 30);
      simulatedMultiplier += lift;
      simulatedTriggeredRules.push(`Scarcity markup triggered (+${Math.round(lift * 100)}%)`);
    }
    if (policy.timeDecayEnabled) {
      simulatedMultiplier += policy.lastMinuteSurgePct / 100 * 0.5;
      simulatedTriggeredRules.push(`Time-decay pressure (+${Math.round(policy.lastMinuteSurgePct * 0.5)}%)`);
    }
  }

  const simulatedCalculatedPrice = Math.round(
    Math.min(policy.maxPriceCeiling, Math.max(policy.minPriceFloor, sampleBasePrice * simulatedMultiplier))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <span>Organiser Studio: Setup Events & Dynamic Pricing</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Setup and publish live events, configure automated dynamic surge pricing rules, and control tier allocations
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            id="tab-setup-events"
            onClick={() => setActiveTab('create_event')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'create_event' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Setup New Event</span>
          </button>
          <button
            id="tab-setup-dynamic-pricing"
            onClick={() => setActiveTab('policy')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'policy' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Setup Dynamic Pricing</span>
          </button>
          <button
            id="tab-live-inventory"
            onClick={() => setActiveTab('inventory')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'inventory' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Live Inventory Yield
          </button>
        </div>
      </div>

      {/* TAB 1: DYNAMIC PRICING POLICY DESIGNER */}
      {activeTab === 'policy' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Policy Rules & Configuration */}
          <div className="lg:col-span-2 space-y-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
              <div>
                <h3 className="font-bold text-base text-white flex items-center space-x-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Algorithmic Dynamic Pricing Rules</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Target event inventory demand curves and automate price adjustments
                </p>
              </div>

              {/* Event Selector */}
              <select
                value={selectedEventId}
                onChange={(e) => handleSelectEvent(e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Master Toggle */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">
                  Enable Real-Time Dynamic Pricing Engine
                </span>
                <span className="text-[11px] text-slate-400">
                  When enabled, ticket prices scale automatically according to inventory depletion and velocity.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={policy.enabled}
                  onChange={(e) => setPolicy({ ...policy, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
              </label>
            </div>

            {/* Rule 1: Scarcity Surge */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Percent className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white">Rule 1: Inventory Scarcity Surge</span>
                </div>
                <span className="text-xs font-mono text-amber-400">
                  Trigger: &gt;{policy.scarcityThresholdPct}% Sold • Multiplier: {policy.scarcityMultiplier}x
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Scarcity Threshold</span>
                    <span className="text-white font-mono">{policy.scarcityThresholdPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="90"
                    step="5"
                    value={policy.scarcityThresholdPct}
                    onChange={(e) => setPolicy({ ...policy, scarcityThresholdPct: Number(e.target.value) })}
                    className="w-full accent-amber-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Surge kicks in once venue or tier occupancy exceeds this capacity.
                  </p>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Surge Multiplier</span>
                    <span className="text-white font-mono">{policy.scarcityMultiplier}x (+{Math.round((policy.scarcityMultiplier - 1) * 100)}%)</span>
                  </div>
                  <input
                    type="range"
                    min="1.05"
                    max="1.75"
                    step="0.05"
                    value={policy.scarcityMultiplier}
                    onChange={(e) => setPolicy({ ...policy, scarcityMultiplier: Number(e.target.value) })}
                    className="w-full accent-amber-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Base price increase applied to remaining seats.
                  </p>
                </div>
              </div>
            </div>

            {/* Rule 2: Demand Velocity Multiplier */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white">Rule 2: Booking Velocity Surge</span>
                </div>
                <span className="text-xs font-mono text-cyan-400">
                  {policy.highDemandVelocityThreshold} bookings/5min • {policy.velocityMultiplier}x
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Velocity Threshold</span>
                    <span className="text-white font-mono">{policy.highDemandVelocityThreshold} bookings / 5min</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="10"
                    step="1"
                    value={policy.highDemandVelocityThreshold}
                    onChange={(e) => setPolicy({ ...policy, highDemandVelocityThreshold: Number(e.target.value) })}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Velocity Multiplier</span>
                    <span className="text-white font-mono">{policy.velocityMultiplier}x (+{Math.round((policy.velocityMultiplier - 1) * 100)}%)</span>
                  </div>
                  <input
                    type="range"
                    min="1.05"
                    max="1.50"
                    step="0.05"
                    value={policy.velocityMultiplier}
                    onChange={(e) => setPolicy({ ...policy, velocityMultiplier: Number(e.target.value) })}
                    className="w-full accent-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Rule 3: Time Decay & Guardrails */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Rule 3: Time Decay & Safeguard Bounds</span>
                </div>
                <label className="flex items-center space-x-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={policy.timeDecayEnabled}
                    onChange={(e) => setPolicy({ ...policy, timeDecayEnabled: e.target.checked })}
                    className="rounded accent-emerald-500"
                  />
                  <span>Time Factors Active</span>
                </label>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Early Bird (-%)</label>
                  <input
                    type="number"
                    value={policy.earlyBirdDiscountPct}
                    onChange={(e) => setPolicy({ ...policy, earlyBirdDiscountPct: Number(e.target.value) })}
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Rush Hour (+%)</label>
                  <input
                    type="number"
                    value={policy.lastMinuteSurgePct}
                    onChange={(e) => setPolicy({ ...policy, lastMinuteSurgePct: Number(e.target.value) })}
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Min Floor (₹)</label>
                  <input
                    type="number"
                    value={policy.minPriceFloor}
                    onChange={(e) => setPolicy({ ...policy, minPriceFloor: Number(e.target.value) })}
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Max Ceiling (₹)</label>
                  <input
                    type="number"
                    value={policy.maxPriceCeiling}
                    onChange={(e) => setPolicy({ ...policy, maxPriceCeiling: Number(e.target.value) })}
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between pt-2">
              {policySavedNotice ? (
                <span className="text-xs text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Dynamic Policy Updated & Broadcast to Event Bus!</span>
                </span>
              ) : (
                <span className="text-xs text-slate-500">
                  Updates propagate live to all ticketing terminals and web clients.
                </span>
              )}

              <button
                onClick={handleSavePolicy}
                disabled={isSavingPolicy}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-amber-600/30 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingPolicy ? 'Syncing...' : 'Deploy Policy to Mesh'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Dynamic Pricing Curve Simulator */}
          <div className="space-y-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h4 className="font-bold text-sm text-white">Live Curve Visualizer & Simulator</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Test how prices dynamically react as venue occupancy changes.
              </p>

              {/* Slider for simulated occupancy */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Simulate Capacity Sold:</span>
                  <span className="text-amber-400 font-bold font-mono">{simulatedSoldPct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={simulatedSoldPct}
                  onChange={(e) => setSimulatedSoldPct(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>0% (Empty)</span>
                  <span>Threshold: {policy.scarcityThresholdPct}%</span>
                  <span>100% (Sold Out)</span>
                </div>
              </div>

              {/* Simulated Outcome Display */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 space-y-3">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">
                  Sample VIP Tier Simulation
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-400">Base Price:</span>
                  <span className="text-slate-300 font-mono text-sm">{formatINR(sampleBasePrice)}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-400">Dynamic Multiplier:</span>
                  <span className="text-amber-400 font-mono font-bold text-sm">
                    {simulatedMultiplier.toFixed(2)}x
                  </span>
                </div>
                <div className="flex items-baseline justify-between pt-2 border-t border-slate-800">
                  <span className="text-xs font-bold text-white">Projected Ticket Price:</span>
                  <span className="text-xl font-black text-emerald-400 font-mono">
                    {formatINR(simulatedCalculatedPrice)}
                  </span>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
                    Triggered Engine Rules:
                  </span>
                  {simulatedTriggeredRules.length === 0 ? (
                    <span className="text-[11px] text-slate-400">Standard base market rate applies.</span>
                  ) : (
                    simulatedTriggeredRules.map((r, i) => (
                      <div key={i} className="text-[11px] text-amber-300 flex items-center space-x-1 font-mono">
                        <span>•</span>
                        <span>{r}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* SVG Curve representation */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="text-[10px] text-slate-400 mb-1 flex justify-between">
                  <span>Price Curve (0% to 100% Capacity)</span>
                  <span className="text-amber-400">Ceiling: {formatINR(policy.maxPriceCeiling)}</span>
                </div>
                <svg className="w-full h-24 overflow-visible" viewBox="0 0 200 60">
                  {/* Grid lines */}
                  <line x1="0" y1="50" x2="200" y2="50" stroke="#334155" strokeDasharray="2" />
                  <line x1="0" y1="10" x2="200" y2="10" stroke="#334155" strokeDasharray="2" />
                  {/* Scarcity line */}
                  <line
                    x1={(policy.scarcityThresholdPct / 100) * 200}
                    y1="0"
                    x2={(policy.scarcityThresholdPct / 100) * 200}
                    y2="60"
                    stroke="#f59e0b"
                    strokeWidth="1"
                    strokeDasharray="3"
                  />
                  {/* Trajectory curve */}
                  <path
                    d={`M 0 50 Q ${(policy.scarcityThresholdPct / 100) * 200} 48 200 12`}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                  />
                  {/* Current point */}
                  <circle
                    cx={(simulatedSoldPct / 100) * 200}
                    cy={50 - ((simulatedCalculatedPrice - sampleBasePrice) / (policy.maxPriceCeiling - sampleBasePrice || 1)) * 38}
                    r="4.5"
                    fill="#38bdf8"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-800">
              OmniTicket Dynamic Pricing automatically balances revenue maximization against ticket affordability guardrails.
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CREATE NEW EVENT */}
      {activeTab === 'create_event' && (
        <form onSubmit={handleCreateEvent} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl max-w-3xl mx-auto space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-base text-white">Publish New Live Event</h3>
            <p className="text-xs text-slate-400">
              Provision seating layout and configure initial dynamic pricing policies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs text-slate-300 mb-1">Event Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Electric Dreams Arena Showcase"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Category</label>
              <select
                value={newEventCategory}
                onChange={(e) => setNewEventCategory(e.target.value as EventCategory)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              >
                <option value="concert">Concert / Musical Show</option>
                <option value="theater">Theater / Broadway Drama</option>
                <option value="sports">Sporting Tournament / Match</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Date & Time</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
                <input
                  type="time"
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Venue Name</label>
              <input
                type="text"
                value={newEventVenue}
                onChange={(e) => setNewEventVenue(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">City & State</label>
              <input
                type="text"
                value={newEventCity}
                onChange={(e) => setNewEventCity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs text-slate-300 mb-1">Event Poster Image URL</label>
              <input
                type="text"
                value={newEventImage}
                onChange={(e) => setNewEventImage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs text-slate-300 mb-1">Description</label>
              <textarea
                rows={2}
                value={newEventDesc}
                onChange={(e) => setNewEventDesc(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          {/* Tier Base Pricing Setup */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Seating Tiers Base Pricing
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-amber-400 mb-1">Stagefront VIP (₹)</label>
                <input
                  type="number"
                  value={vipPrice}
                  onChange={(e) => setVipPrice(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-blue-400 mb-1">Gold Reserved (₹)</label>
                <input
                  type="number"
                  value={goldPrice}
                  onChange={(e) => setGoldPrice(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-emerald-400 mb-1">General Admission (₹)</label>
                <input
                  type="number"
                  value={genPrice}
                  onChange={(e) => setGenPrice(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isCreating}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>{isCreating ? 'Provisioning Event...' : 'Publish Event to Mesh'}</span>
          </button>
        </form>
      )}

      {/* TAB 3: INVENTORY YIELD OVERVIEW */}
      {activeTab === 'inventory' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-base text-white">Live Event Inventory & Revenue Yield</h3>
              <p className="text-xs text-slate-400">Real-time status across all active event productions</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((evt) => {
              const occupancyPct = Math.round((evt.soldSeats / evt.totalSeats) * 100);
              return (
                <div key={evt.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-amber-400">
                        {evt.category}
                      </span>
                      <h4 className="font-bold text-sm text-white">{evt.title}</h4>
                      <p className="text-xs text-slate-400">{evt.venue} • {evt.date}</p>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold ${
                        evt.dynamicPricingPolicy.enabled
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {evt.dynamicPricingPolicy.enabled ? 'Dynamic Engine ON' : 'Fixed Pricing'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Occupancy: {evt.soldSeats} / {evt.totalSeats} seats</span>
                      <span className="font-mono text-cyan-400 font-bold">{occupancyPct}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full"
                        style={{ width: `${occupancyPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] font-mono border-t border-slate-800 text-slate-400">
                    <div>
                      <span className="block text-[9px] text-slate-500 uppercase">VIP Price</span>
                      <span className="text-white font-bold">{formatINR(evt.tiers?.[0]?.currentPrice ?? 0)}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-500 uppercase">Velocity</span>
                      <span className="text-cyan-400 font-bold">{evt.recentBookingVelocity} b/min</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-500 uppercase">Scarcity Limit</span>
                      <span className="text-amber-400 font-bold">{evt.dynamicPricingPolicy?.scarcityThresholdPct ?? 70}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
