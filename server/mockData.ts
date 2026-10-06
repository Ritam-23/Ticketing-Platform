import { EventItem, Terminal, User, SeatingTier, Seat } from '../src/types.js';

export function generateSeatsForEvent(
  eventId: string,
  tiers: SeatingTier[],
  soldIndices: number[] = []
): Seat[] {
  const seats: Seat[] = [];
  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  const seatsPerRow = 10;
  let seatIndex = 0;

  rows.forEach((row, rowIndex) => {
    for (let num = 1; num <= seatsPerRow; num++) {
      // Determine tier based on row
      let tier: SeatingTier;
      if (rowIndex === 0 || rowIndex === 1) {
        tier = tiers[0]; // VIP / Premium
      } else if (rowIndex === 2 || rowIndex === 3) {
        tier = tiers[1] || tiers[0]; // Tier 1
      } else {
        tier = tiers[2] || tiers[1] || tiers[0]; // Tier 2 / General
      }

      const isSold = soldIndices.includes(seatIndex);
      seats.push({
        id: `${eventId}-s-${row}${num}`,
        row,
        number: num,
        tierId: tier.id,
        tierName: tier.name,
        status: isSold ? 'sold' : 'available',
        price: tier.currentPrice || tier.basePrice,
        x: 40 + (num - 1) * 44,
        y: 60 + rowIndex * 48,
      });

      seatIndex++;
    }
  });

  return seats;
}

export const initialTerminals: Terminal[] = [
  {
    id: 'term-mac-sf-01',
    name: 'Box Office Station #1 (MacBook Pro M3)',
    deviceType: 'laptop',
    ip: '192.168.1.42',
    os: 'macOS Sonoma 14.5',
    browser: 'Chrome 128.0',
    physicalMachineFingerprint: 'hw-uuid-a98f-4b12-98e3',
    status: 'online',
    lastHeartbeat: new Date().toISOString(),
    location: 'San Francisco Central Box Office',
    activeSessionsCount: 2,
  },
  {
    id: 'term-kiosk-arena-08',
    name: 'Concourse Self-Service Kiosk #08',
    deviceType: 'kiosk',
    ip: '10.0.4.112',
    os: 'Ubuntu Core 22.04 LTS',
    browser: 'Chromium Embedded 124.0',
    physicalMachineFingerprint: 'hw-uuid-77bc-11a2-ff59',
    status: 'online',
    lastHeartbeat: new Date().toISOString(),
    location: 'Arena Gate 4 West concourse',
    activeSessionsCount: 1,
  },
  {
    id: 'term-win-pos-03',
    name: 'VIP Lounge Terminal #3 (Surface Pro)',
    deviceType: 'desktop',
    ip: '172.16.20.15',
    os: 'Windows 11 Enterprise',
    browser: 'Edge 127.0',
    physicalMachineFingerprint: 'hw-uuid-e309-881c-d001',
    status: 'online',
    lastHeartbeat: new Date().toISOString(),
    location: 'VIP SkyClub Desk',
    activeSessionsCount: 1,
  },
  {
    id: 'term-mobile-usher-12',
    name: 'Mobile Usher Handheld #12',
    deviceType: 'mobile_pos',
    ip: '10.240.12.89',
    os: 'Android 14 (Zebra TC58)',
    browser: 'Chrome Mobile 126.0',
    physicalMachineFingerprint: 'hw-uuid-8021-cc45-bb78',
    status: 'idle',
    lastHeartbeat: new Date(Date.now() - 300000).toISOString(),
    location: 'Section 104 roving scanner',
    activeSessionsCount: 1,
  },
];

export const initialUsers: User[] = [
  {
    id: 'user-executor-01',
    name: 'Priya Sharma',
    email: 'priya@metropolis-live.in',
    role: 'executor',
    currentTerminalId: 'term-mac-sf-01',
    companyName: 'Metropolis Live Entertainment',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-audience-01',
    name: 'Aarav Patel',
    email: 'aarav.patel@gmail.com',
    role: 'audience',
    currentTerminalId: 'term-kiosk-arena-08',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-admin-01',
    name: 'Vikram Malhotra',
    email: 'vikram.admin@omniticket.cloud',
    role: 'admin',
    currentTerminalId: 'term-win-pos-03',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
];

const event1Tiers: SeatingTier[] = [
  { id: 't-1-vip', name: 'Stagefront VIP', basePrice: 4500, currentPrice: 5625, surgeMultiplier: 1.25, totalCapacity: 20, soldCount: 16, color: '#f59e0b' },
  { id: 't-1-gold', name: 'Gold Reserved', basePrice: 2800, currentPrice: 3360, surgeMultiplier: 1.20, totalCapacity: 20, soldCount: 14, color: '#3b82f6' },
  { id: 't-1-gen', name: 'General Admission', basePrice: 1200, currentPrice: 1380, surgeMultiplier: 1.15, totalCapacity: 20, soldCount: 11, color: '#10b981' },
];

const event2Tiers: SeatingTier[] = [
  { id: 't-2-orch', name: 'Orchestra Center', basePrice: 4800, currentPrice: 5760, surgeMultiplier: 1.20, totalCapacity: 20, soldCount: 17, color: '#ec4899' },
  { id: 't-2-mezz', name: 'Front Mezzanine', basePrice: 3200, currentPrice: 3520, surgeMultiplier: 1.10, totalCapacity: 20, soldCount: 12, color: '#8b5cf6' },
  { id: 't-2-balc', name: 'Grand Balcony', basePrice: 1800, currentPrice: 1800, surgeMultiplier: 1.0, totalCapacity: 20, soldCount: 8, color: '#6366f1' },
];

const event3Tiers: SeatingTier[] = [
  { id: 't-3-field', name: 'Fieldside Club', basePrice: 6500, currentPrice: 8450, surgeMultiplier: 1.30, totalCapacity: 20, soldCount: 18, color: '#eab308' },
  { id: 't-3-lower', name: 'Lower Bowl Prime', basePrice: 3500, currentPrice: 4200, surgeMultiplier: 1.20, totalCapacity: 20, soldCount: 15, color: '#06b6d4' },
  { id: 't-3-upper', name: 'Upper Bowl Deck', basePrice: 1500, currentPrice: 1650, surgeMultiplier: 1.10, totalCapacity: 20, soldCount: 10, color: '#14b8a6' },
];

const event4Tiers: SeatingTier[] = [
  { id: 't-4-pit', name: 'Main Stage Pit', basePrice: 3500, currentPrice: 4200, surgeMultiplier: 1.20, totalCapacity: 20, soldCount: 11, color: '#f43f5e' },
  { id: 't-4-deck', name: 'Sky Club Deck', basePrice: 2400, currentPrice: 2400, surgeMultiplier: 1.0, totalCapacity: 20, soldCount: 9, color: '#a855f7' },
  { id: 't-4-lawn', name: 'Open Lawn Pass', basePrice: 999, currentPrice: 999, surgeMultiplier: 1.0, totalCapacity: 20, soldCount: 6, color: '#22c55e' },
];

export const initialEvents: EventItem[] = [
  {
    id: 'evt-symphony-2026',
    title: 'Symphony of Lights: Global World Tour',
    category: 'concert',
    date: '2026-10-18',
    time: '20:00',
    venue: 'Jio World Garden, BKC',
    city: 'Mumbai',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    description: 'An immersive sonic and laser audiovisual spectacle featuring 60-piece orchestra paired with world-renowned electronic synth artists.',
    executorId: 'user-executor-01',
    executorName: 'Metropolis Live Entertainment',
    totalSeats: 60,
    soldSeats: 41,
    tiers: event1Tiers,
    seats: generateSeatsForEvent('evt-symphony-2026', event1Tiers, [0, 1, 2, 3, 5, 8, 10, 11, 12, 14, 18, 20, 22, 25, 27, 29, 31, 33, 40, 42, 45]),
    dynamicPricingPolicy: {
      enabled: true,
      scarcityMultiplier: 1.25,
      scarcityThresholdPct: 65,
      highDemandVelocityThreshold: 4,
      velocityMultiplier: 1.15,
      timeDecayEnabled: true,
      earlyBirdDiscountPct: 10,
      lastMinuteSurgePct: 20,
      maxPriceCeiling: 9500,
      minPriceFloor: 999,
    },
    recentBookingVelocity: 6,
  },
  {
    id: 'evt-hamilton-revival',
    title: 'Hamilton: The Broadway Revolutionary Return',
    category: 'theater',
    date: '2026-11-04',
    time: '19:30',
    venue: 'NCPA (National Centre for the Performing Arts)',
    city: 'Mumbai',
    image: 'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?w=800&auto=format&fit=crop&q=80',
    description: 'The award-winning musical masterpiece exploring Alexander Hamilton’s indelible mark on history through hip-hop, jazz, and classic stagecraft.',
    executorId: 'user-executor-01',
    executorName: 'Broadway Grand Touring',
    totalSeats: 60,
    soldSeats: 37,
    tiers: event2Tiers,
    seats: generateSeatsForEvent('evt-hamilton-revival', event2Tiers, [1, 2, 4, 6, 7, 9, 13, 15, 17, 21, 23, 24, 28, 30, 32, 35, 41, 44]),
    dynamicPricingPolicy: {
      enabled: true,
      scarcityMultiplier: 1.20,
      scarcityThresholdPct: 60,
      highDemandVelocityThreshold: 3,
      velocityMultiplier: 1.10,
      timeDecayEnabled: false,
      earlyBirdDiscountPct: 0,
      lastMinuteSurgePct: 15,
      maxPriceCeiling: 8000,
      minPriceFloor: 1500,
    },
    recentBookingVelocity: 4,
  },
  {
    id: 'evt-apex-finals-2026',
    title: 'World Cup Invitational: Apex FC vs Inter Continental',
    category: 'sports',
    date: '2026-10-25',
    time: '18:00',
    venue: 'DY Patil Stadium',
    city: 'Navi Mumbai',
    image: '/assets/barcelona_match.jpg',
    description: 'The ultimate continental clash between two powerhouse squads competing for the 2026 Invitational Silver Trophy.',
    executorId: 'user-executor-01',
    executorName: 'Premier Sports Global',
    totalSeats: 60,
    soldSeats: 43,
    tiers: event3Tiers,
    seats: generateSeatsForEvent('evt-apex-finals-2026', event3Tiers, [0, 2, 3, 5, 7, 8, 9, 11, 14, 16, 17, 19, 22, 26, 28, 34, 38, 41, 43, 46, 49]),
    dynamicPricingPolicy: {
      enabled: true,
      scarcityMultiplier: 1.30,
      scarcityThresholdPct: 70,
      highDemandVelocityThreshold: 5,
      velocityMultiplier: 1.20,
      timeDecayEnabled: true,
      earlyBirdDiscountPct: 12,
      lastMinuteSurgePct: 25,
      maxPriceCeiling: 12000,
      minPriceFloor: 1200,
    },
    recentBookingVelocity: 8,
  },
  {
    id: 'evt-neon-lights-fest',
    title: 'Neon Oasis: Electric Desert Odyssey',
    category: 'concert',
    date: '2026-12-05',
    time: '21:00',
    venue: 'Palace Grounds',
    city: 'Bengaluru',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
    description: 'Three stages of mind-bending electronic dance music, kinetic art installations, pyrotechnics, and late-night visual synthesizers.',
    executorId: 'user-executor-01',
    executorName: 'Neon Productions',
    totalSeats: 60,
    soldSeats: 26,
    tiers: event4Tiers,
    seats: generateSeatsForEvent('evt-neon-lights-fest', event4Tiers, [3, 4, 7, 12, 15, 18, 24, 27, 31, 36, 40]),
    dynamicPricingPolicy: {
      enabled: true,
      scarcityMultiplier: 1.15,
      scarcityThresholdPct: 75,
      highDemandVelocityThreshold: 3,
      velocityMultiplier: 1.10,
      timeDecayEnabled: true,
      earlyBirdDiscountPct: 15,
      lastMinuteSurgePct: 15,
      maxPriceCeiling: 7500,
      minPriceFloor: 800,
    },
    recentBookingVelocity: 2,
  },
];
