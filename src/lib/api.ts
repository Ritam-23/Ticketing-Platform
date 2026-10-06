import {
  AnalyticsData,
  DynamicPricingPolicy,
  EventItem,
  Order,
  Seat,
  SystemEvent,
  Terminal,
  User,
} from '../types.js';

export const api = {
  // Auth & User Management
  async login(payload: {
    email: string;
    role?: string;
    terminalId: string;
    terminalName?: string;
    deviceType?: string;
    machineFingerprint?: string;
  }): Promise<{ user: User; terminal: Terminal; allTerminals: Terminal[] }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },

  async register(payload: {
    name: string;
    email: string;
    role: string;
    companyName?: string;
    terminalId: string;
  }): Promise<{ user: User }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  async getUsers(): Promise<User[]> {
    const res = await fetch('/api/users');
    if (!res.ok) throw new Error('Failed to fetch users');
    const data = await res.json();
    return data.users || [];
  },

  // Terminal & Physical Machines
  async getTerminals(): Promise<Terminal[]> {
    const res = await fetch('/api/terminals');
    if (!res.ok) throw new Error('Failed to fetch terminals');
    const data = await res.json();
    return data.terminals || [];
  },

  async registerTerminal(terminal: Partial<Terminal>): Promise<Terminal> {
    const res = await fetch('/api/terminals/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(terminal),
    });
    if (!res.ok) throw new Error('Failed to register terminal');
    const data = await res.json();
    return data.terminal;
  },

  async sendHeartbeat(terminalId: string): Promise<void> {
    await fetch(`/api/terminals/${terminalId}/heartbeat`, { method: 'POST' });
  },

  // Events & Catalog
  async getEvents(): Promise<EventItem[]> {
    const res = await fetch('/api/events');
    if (!res.ok) throw new Error('Failed to fetch events');
    const data = await res.json();
    return data.events || [];
  },

  async getEvent(id: string): Promise<EventItem> {
    const res = await fetch(`/api/events/${id}`);
    if (!res.ok) throw new Error('Failed to fetch event');
    const data = await res.json();
    return data.event;
  },

  async createEvent(eventData: Partial<EventItem>): Promise<EventItem> {
    const res = await fetch('/api/events/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });
    if (!res.ok) throw new Error('Failed to create event');
    const data = await res.json();
    return data.event;
  },

  async updatePricingPolicy(eventId: string, policy: DynamicPricingPolicy): Promise<EventItem> {
    const res = await fetch(`/api/events/${eventId}/policy`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ policy }),
    });
    if (!res.ok) throw new Error('Failed to update pricing policy');
    const data = await res.json();
    return data.event;
  },

  // Seat hold / release
  async holdSeats(eventId: string, seatIds: string[], terminalId: string): Promise<{ heldUntil: number }> {
    const res = await fetch('/api/seats/hold', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, seatIds, terminalId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to hold seats');
    }
    return res.json();
  },

  async releaseSeats(eventId: string, seatIds: string[], terminalId: string): Promise<void> {
    await fetch('/api/seats/release', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, seatIds, terminalId }),
    });
  },

  // Orders & Transactions
  async confirmOrder(payload: {
    eventId: string;
    selectedSeats: Seat[];
    userId: string;
    terminalId: string;
    paymentMethod: string;
    idempotencyKey: string;
  }): Promise<{ order: Order }> {
    const res = await fetch('/api/orders/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Checkout failed');
    }
    return data;
  },

  async getOrders(userId?: string, role?: string): Promise<Order[]> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (role) params.append('role', role);

    const res = await fetch(`/api/orders?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    const data = await res.json();
    return data.orders || [];
  },

  // Events History & Analytics
  async getEventHistory(): Promise<SystemEvent[]> {
    const res = await fetch('/api/events/history');
    if (!res.ok) throw new Error('Failed to fetch event history');
    const data = await res.json();
    return data.events || [];
  },

  async getAnalytics(): Promise<AnalyticsData> {
    const res = await fetch('/api/analytics');
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },
};
