export type UserRole = 'audience' | 'executor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  currentTerminalId: string;
  avatar?: string;
  companyName?: string;
}

export type DeviceType = 'desktop' | 'laptop' | 'mobile_pos' | 'kiosk';

export interface Terminal {
  id: string;
  name: string;
  deviceType: DeviceType;
  ip: string;
  os: string;
  browser: string;
  physicalMachineFingerprint: string;
  status: 'online' | 'idle' | 'offline';
  lastHeartbeat: string;
  userId?: string;
  activeSessionsCount: number;
  location: string;
}

export type EventCategory = 'concert' | 'theater' | 'sports';

export interface SeatingTier {
  id: string;
  name: string;
  basePrice: number;
  currentPrice: number;
  surgeMultiplier: number;
  totalCapacity: number;
  soldCount: number;
  color: string;
}

export interface DynamicPricingPolicy {
  enabled: boolean;
  scarcityMultiplier: number; // e.g. 1.25 (+25%)
  scarcityThresholdPct: number; // e.g. 70%
  highDemandVelocityThreshold: number; // e.g. 5 bookings/min
  velocityMultiplier: number; // e.g. 1.15
  timeDecayEnabled: boolean;
  earlyBirdDiscountPct: number; // e.g. 15%
  lastMinuteSurgePct: number; // e.g. 20%
  maxPriceCeiling: number; // e.g. $400
  minPriceFloor: number; // e.g. $45
}

export interface Seat {
  id: string;
  row: string;
  number: number;
  tierId: string;
  tierName: string;
  status: 'available' | 'held' | 'sold';
  heldByTerminalId?: string;
  heldUntil?: number;
  price: number;
  x: number;
  y: number;
}

export interface EventItem {
  id: string;
  title: string;
  category: EventCategory;
  date: string;
  time: string;
  venue: string;
  city: string;
  image: string;
  description: string;
  executorId: string;
  executorName: string;
  totalSeats: number;
  soldSeats: number;
  tiers: SeatingTier[];
  seats: Seat[];
  dynamicPricingPolicy: DynamicPricingPolicy;
  recentBookingVelocity: number; // bookings in last 5 mins
}

export interface OrderSeat {
  seatId: string;
  tierName: string;
  price: number;
  row: string;
  number: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  terminalId: string;
  terminalName: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventVenue: string;
  eventCategory: EventCategory;
  seats: OrderSeat[];
  subtotal: number;
  dynamicSurgeAmount: number;
  taxesAndFees: number;
  totalAmount: number;
  status: 'confirmed' | 'failed' | 'refunded';
  idempotencyKey: string;
  createdAt: string;
  qrCodeData: string;
  paymentMethod: string;
}

export type SystemEventType =
  | 'USER_AUTHENTICATED'
  | 'TERMINAL_CONNECTED'
  | 'TERMINAL_DISCONNECTED'
  | 'TERMINAL_REGISTERED'
  | 'TERMINAL_HEARTBEAT'
  | 'SEAT_HELD'
  | 'SEAT_RELEASED'
  | 'PRICE_SURGE_TRIGGERED'
  | 'DYNAMIC_PRICING_UPDATED'
  | 'ORDER_ATTEMPTED'
  | 'ORDER_CREATED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'EVENT_CREATED';

export interface SystemEvent {
  id: string;
  timestamp: string;
  service: string;
  type: SystemEventType;
  payload: Record<string, any>;
  severity: 'info' | 'warning' | 'error' | 'success';
}

export interface AnalyticsData {
  totalRevenue: number;
  totalTicketsSold: number;
  dynamicPricingYield: number;
  averageTicketPrice: number;
  salesByEvent: {
    eventId: string;
    title: string;
    category: EventCategory;
    sold: number;
    capacity: number;
    revenue: number;
  }[];
  salesByTerminal: {
    terminalId: string;
    terminalName: string;
    deviceType: DeviceType;
    salesCount: number;
    revenue: number;
  }[];
  salesTrend: {
    time: string;
    sales: number;
    revenue: number;
    surgeMultiplier: number;
  }[];
  tierBreakdown: {
    name: string;
    sold: number;
    revenue: number;
    color: string;
  }[];
}
