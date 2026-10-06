import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initialEvents, initialTerminals, initialUsers, generateSeatsForEvent } from './server/mockData.js';
import { calculateTierPrice } from './server/pricingEngine.js';
import { eventBus } from './server/eventBus.js';
import { EventItem, Order, Terminal, User } from './src/types.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory persistent state for this runtime
  let users: User[] = [...initialUsers];
  let terminals: Terminal[] = [...initialTerminals];
  let events: EventItem[] = [...initialEvents];
  let orders: Order[] = [
    {
      id: 'ord-10021',
      userId: 'user-audience-01',
      userName: 'Aarav Patel',
      userEmail: 'aarav.patel@gmail.com',
      terminalId: 'term-kiosk-arena-08',
      terminalName: 'Concourse Self-Service Kiosk #08',
      eventId: 'evt-symphony-2026',
      eventTitle: 'Symphony of Lights: Global World Tour',
      eventDate: '2026-10-18',
      eventTime: '20:00',
      eventVenue: 'Jio World Garden, BKC',
      eventCategory: 'concert',
      seats: [
        { seatId: 'evt-symphony-2026-s-A1', tierName: 'Stagefront VIP', price: 5625, row: 'A', number: 1 },
        { seatId: 'evt-symphony-2026-s-A2', tierName: 'Stagefront VIP', price: 5625, row: 'A', number: 2 },
      ],
      subtotal: 11250,
      dynamicSurgeAmount: 2250,
      taxesAndFees: 900,
      totalAmount: 12150,
      status: 'confirmed',
      idempotencyKey: 'idemp-seed-10021',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      qrCodeData: 'OMNI-TKT-SYMPHONY-10021-A1-A2',
      paymentMethod: 'UPI / Credit Card (Terminal POS)',
    },
    {
      id: 'ord-10022',
      userId: 'user-audience-01',
      userName: 'Aarav Patel',
      userEmail: 'aarav.patel@gmail.com',
      terminalId: 'term-mac-sf-01',
      terminalName: 'Box Office Station #1 (MacBook Pro M3)',
      eventId: 'evt-apex-finals-2026',
      eventTitle: 'World Cup Invitational: Apex FC vs Inter Continental',
      eventDate: '2026-10-25',
      eventTime: '18:00',
      eventVenue: 'DY Patil Stadium',
      eventCategory: 'sports',
      seats: [
        { seatId: 'evt-apex-finals-2026-s-C5', tierName: 'Lower Bowl Prime', price: 4200, row: 'C', number: 5 },
      ],
      subtotal: 4200,
      dynamicSurgeAmount: 700,
      taxesAndFees: 336,
      totalAmount: 4536,
      status: 'confirmed',
      idempotencyKey: 'idemp-seed-10022',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      qrCodeData: 'OMNI-TKT-APEX-10022-C5',
      paymentMethod: 'UPI QR Terminal',
    },
  ];

  // Helper: compute dynamic prices for an event
  function refreshEventPrices(event: EventItem): EventItem {
    const updatedTiers = event.tiers.map(tier => {
      const calc = calculateTierPrice(event, tier);
      return {
        ...tier,
        currentPrice: calc.finalPrice,
        surgeMultiplier: calc.surgeMultiplier,
      };
    });

    const updatedSeats = event.seats.map(seat => {
      const matchingTier = updatedTiers.find(t => t.id === seat.tierId);
      return {
        ...seat,
        price: matchingTier ? matchingTier.currentPrice : seat.price,
      };
    });

    return {
      ...event,
      tiers: updatedTiers,
      seats: updatedSeats,
    };
  }

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      architecture: 'Event-Driven Online Ticketing Platform',
      timestamp: new Date().toISOString(),
    });
  });

  // 1. Auth & Terminal Management
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, role, terminalId, machineFingerprint, terminalName, deviceType } = req.body;
    let user = users.find(u => u.email.toLowerCase() === email?.toLowerCase());

    if (!user) {
      // Auto-create or login with standard role
      user = {
        id: `user-${Date.now()}`,
        name: (email ? email.split('@')[0] : 'Attendee User') || 'Attendee User',
        email,
        role: (role as any) || 'audience',
        currentTerminalId: terminalId || 'term-mac-sf-01',
      };
      users.push(user);
    }

    // Check or update terminal
    let terminal = terminals.find(t => t.id === terminalId);
    if (!terminal && terminalId) {
      terminal = {
        id: terminalId,
        name: terminalName || `Terminal ${terminalId.substring(0, 6)}`,
        deviceType: deviceType || 'laptop',
        ip: req.ip || '127.0.0.1',
        os: 'Detected Host Machine',
        browser: 'Modern Browser',
        physicalMachineFingerprint: machineFingerprint || `fp-${Date.now()}`,
        status: 'online',
        lastHeartbeat: new Date().toISOString(),
        location: 'Remote Office / Physical Machine',
        activeSessionsCount: 1,
        userId: user.id,
      };
      terminals.push(terminal);
    } else if (terminal) {
      terminal.status = 'online';
      terminal.lastHeartbeat = new Date().toISOString();
      terminal.userId = user.id;
      terminal.activeSessionsCount = Math.max(1, terminal.activeSessionsCount + 1);
    }

    eventBus.publish('auth-service', 'USER_AUTHENTICATED', {
      userId: user.id,
      email: user.email,
      terminalId: terminal?.id,
      machine: terminal?.name,
    }, 'success');

    res.json({ user, terminal, allTerminals: terminals });
  });

  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { name, email, role, companyName, terminalId } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name || (email ? email.split('@')[0] : 'Attendee User'),
      email,
      role: role || 'audience',
      companyName: role === 'executor' ? (companyName || 'Global Events Group') : undefined,
      currentTerminalId: terminalId || 'term-mac-sf-01',
    };
    users.push(newUser);

    eventBus.publish('auth-service', 'USER_AUTHENTICATED', {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    }, 'info');

    res.json({ user: newUser });
  });

  app.get('/api/users', (req: Request, res: Response) => {
    res.json({ users });
  });

  app.get('/api/terminals', (req: Request, res: Response) => {
    res.json({ terminals });
  });

  app.post('/api/terminals/register', (req: Request, res: Response) => {
    const { id, name, deviceType, ip, os, browser, physicalMachineFingerprint, location, userId } = req.body;
    const existingIndex = terminals.findIndex(t => t.id === id);

    const termData: Terminal = {
      id: id || `term-${Date.now()}`,
      name: name || 'Dedicated Physical Terminal',
      deviceType: deviceType || 'desktop',
      ip: ip || req.ip || '192.168.1.100',
      os: os || 'Host Operating System',
      browser: browser || 'Web Client',
      physicalMachineFingerprint: physicalMachineFingerprint || `fp-${Math.random().toString(36).substring(2, 9)}`,
      status: 'online',
      lastHeartbeat: new Date().toISOString(),
      location: location || 'Physical Box Office',
      activeSessionsCount: 1,
      userId,
    };

    if (existingIndex >= 0) {
      terminals[existingIndex] = { ...terminals[existingIndex], ...termData, status: 'online', lastHeartbeat: new Date().toISOString() };
    } else {
      terminals.push(termData);
    }

    eventBus.publish('auth-terminal-service', 'TERMINAL_CONNECTED', {
      terminalId: termData.id,
      name: termData.name,
      location: termData.location,
    }, 'info');

    res.json({ terminal: termData, terminals });
  });

  app.post('/api/terminals/:id/heartbeat', (req: Request, res: Response) => {
    const { id } = req.params;
    const term = terminals.find(t => t.id === id);
    if (term) {
      term.lastHeartbeat = new Date().toISOString();
      term.status = 'online';
    }
    res.json({ status: 'ok', lastHeartbeat: new Date().toISOString() });
  });

  // 2. Events & Seating Catalog
  app.get('/api/events', (req: Request, res: Response) => {
    const refreshed = events.map(e => refreshEventPrices(e));
    res.json({ events: refreshed });
  });

  app.get('/api/events/:id', (req: Request, res: Response) => {
    const event = events.find(e => e.id === req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    const refreshed = refreshEventPrices(event);
    res.json({ event: refreshed });
  });

  app.post('/api/events/create', (req: Request, res: Response) => {
    const { title, category, date, time, venue, city, description, image, tiers, dynamicPricingPolicy, executorId, executorName } = req.body;

    const newId = `evt-${Date.now()}`;
    const defaultTiers = tiers && tiers.length > 0 ? tiers : [
      { id: `${newId}-t1`, name: 'VIP Front Row', basePrice: 4500, currentPrice: 4500, surgeMultiplier: 1.0, totalCapacity: 20, soldCount: 0, color: '#f59e0b' },
      { id: `${newId}-t2`, name: 'Standard Reserved', basePrice: 2500, currentPrice: 2500, surgeMultiplier: 1.0, totalCapacity: 20, soldCount: 0, color: '#3b82f6' },
      { id: `${newId}-t3`, name: 'Balcony / General', basePrice: 1200, currentPrice: 1200, surgeMultiplier: 1.0, totalCapacity: 20, soldCount: 0, color: '#10b981' },
    ];

    const newSeats = generateSeatsForEvent(newId, defaultTiers, []);

    const newEvent: EventItem = {
      id: newId,
      title: title || 'Untitled Event',
      category: category || 'concert',
      date: date || '2026-11-20',
      time: time || '19:00',
      venue: venue || 'Jio World Arena',
      city: city || 'Mumbai',
      image: image || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format&fit=crop&q=80',
      description: description || 'Exciting live performance.',
      executorId: executorId || 'user-executor-01',
      executorName: executorName || 'Metropolis Live',
      totalSeats: newSeats.length,
      soldSeats: 0,
      tiers: defaultTiers,
      seats: newSeats,
      dynamicPricingPolicy: dynamicPricingPolicy || {
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
      },
      recentBookingVelocity: 0,
    };

    events.unshift(newEvent);
    eventBus.publish('catalog-inventory-service', 'EVENT_CREATED', {
      eventId: newEvent.id,
      title: newEvent.title,
      category: newEvent.category,
      capacity: newEvent.totalSeats,
    }, 'success');

    res.status(201).json({ event: newEvent });
  });

  // 3. Dynamic Pricing Policy Update
  app.put('/api/events/:id/policy', (req: Request, res: Response) => {
    const { id } = req.params;
    const { policy } = req.body;

    const event = events.find(e => e.id === id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    event.dynamicPricingPolicy = { ...event.dynamicPricingPolicy, ...policy };
    const refreshed = refreshEventPrices(event);

    eventBus.publish('pricing-engine', 'PRICE_SURGE_TRIGGERED', {
      eventId: id,
      eventTitle: event.title,
      policy: event.dynamicPricingPolicy,
    }, 'info');

    res.json({ event: refreshed });
  });

  // 4. Seat Hold and Release (Distributed Concurrency Lock)
  app.post('/api/seats/hold', (req: Request, res: Response) => {
    const { eventId, seatIds, terminalId } = req.body;
    const event = events.find(e => e.id === eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const heldUntil = Date.now() + 5 * 60 * 1000; // 5 minute lock
    const failedSeats: string[] = [];

    seatIds.forEach((sid: string) => {
      const seat = event.seats.find(s => s.id === sid);
      if (!seat || seat.status === 'sold' || (seat.status === 'held' && seat.heldByTerminalId !== terminalId && (seat.heldUntil || 0) > Date.now())) {
        failedSeats.push(sid);
      } else {
        seat.status = 'held';
        seat.heldByTerminalId = terminalId;
        seat.heldUntil = heldUntil;
      }
    });

    if (failedSeats.length > 0) {
      return res.status(409).json({
        error: 'One or more seats are already reserved by another terminal',
        failedSeats,
      });
    }

    eventBus.publish('inventory-service', 'SEAT_HELD', {
      eventId,
      seatIds,
      terminalId,
      expiresAt: new Date(heldUntil).toISOString(),
    }, 'info');

    res.json({ status: 'held', heldUntil, seats: event.seats });
  });

  app.post('/api/seats/release', (req: Request, res: Response) => {
    const { eventId, seatIds, terminalId } = req.body;
    const event = events.find(e => e.id === eventId);
    if (event) {
      seatIds.forEach((sid: string) => {
        const seat = event.seats.find(s => s.id === sid);
        if (seat && seat.status === 'held' && seat.heldByTerminalId === terminalId) {
          seat.status = 'available';
          delete seat.heldByTerminalId;
          delete seat.heldUntil;
        }
      });
      eventBus.publish('catalog-inventory-service', 'SEAT_RELEASED', {
        eventId,
        seatIds,
        terminalId,
      }, 'info');
    }
    res.json({ status: 'released' });
  });

  // 5. Order Processing & Transaction Checkout
  app.post('/api/orders/checkout', async (req: Request, res: Response) => {
    const {
      eventId,
      selectedSeats,
      userId,
      terminalId,
      paymentMethod,
      idempotencyKey,
    } = req.body;

    const startTime = Date.now();

    // Check Idempotency
    if (idempotencyKey) {
      const existingOrder = orders.find(o => o.idempotencyKey === idempotencyKey);
      if (existingOrder) {
        return res.json({ order: existingOrder, idempotent: true });
      }
    }

    const event = events.find(e => e.id === eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const user = users.find(u => u.id === userId) || {
      id: userId || 'guest',
      name: 'Audience Guest',
      email: 'guest@omniticket.cloud',
      role: 'audience' as const,
      currentTerminalId: terminalId,
    };
    const terminal = terminals.find(t => t.id === terminalId) || {
      id: terminalId || 'term-unknown',
      name: 'Unspecified Terminal',
      deviceType: 'desktop' as const,
      ip: req.ip || '127.0.0.1',
    };

    // Tiers calculation
    let subtotal = 0;
    let baseTotal = 0;

    const orderSeats = selectedSeats.map((s: { seatId: string; tierName: string; price: number; row: string; number: number }) => {
      const actualSeat = event.seats.find(st => st.id === s.seatId);
      const tier = event.tiers?.find(t => t.name === s.tierName) || (event.tiers && event.tiers.length > 0 ? event.tiers[0] : null);
      const basePrice = tier ? tier.basePrice : s.price;
      const currentPrice = actualSeat ? actualSeat.price : s.price;

      subtotal += currentPrice;
      baseTotal += basePrice;

      return {
        seatId: s.seatId,
        tierName: s.tierName,
        price: currentPrice,
        row: s.row,
        number: s.number,
      };
    });

    const dynamicSurgeAmount = Math.max(0, subtotal - baseTotal);
    const taxesAndFees = Math.round(subtotal * 0.08);
    const totalAmount = subtotal + taxesAndFees;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      terminalId: terminal.id,
      terminalName: terminal.name,
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      eventTime: event.time,
      eventVenue: event.venue,
      eventCategory: event.category,
      seats: orderSeats,
      subtotal,
      dynamicSurgeAmount,
      taxesAndFees,
      totalAmount,
      status: 'confirmed',
      idempotencyKey: idempotencyKey || `idemp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      qrCodeData: `OMNI-${event.id.toUpperCase()}-${Date.now()}`,
      paymentMethod: paymentMethod || 'Standard Card',
    };

    // Mark seats as sold in event
    selectedSeats.forEach((s: { seatId: string; tierName: string }) => {
      const targetSeat = event.seats.find(st => st.id === s.seatId);
      if (targetSeat) {
        targetSeat.status = 'sold';
        delete targetSeat.heldByTerminalId;
        delete targetSeat.heldUntil;
      }
      const targetTier = event.tiers.find(t => t.name === s.tierName);
      if (targetTier) {
        targetTier.soldCount++;
      }
    });

    event.soldSeats += selectedSeats.length;
    event.recentBookingVelocity += selectedSeats.length;

    // Refresh dynamic prices because inventory just dropped!
    refreshEventPrices(event);

    orders.unshift(newOrder);

    eventBus.publish('payment-service', 'PAYMENT_SUCCESS', {
      orderId: newOrder.id,
      amount: totalAmount,
      terminalId: terminal.id,
      paymentMethod,
    }, 'success');

    eventBus.publish('booking-service', 'ORDER_CREATED', {
      orderId: newOrder.id,
      event: event.title,
      seatsCount: orderSeats.length,
      totalAmount,
    }, 'success');

    res.status(201).json({ order: newOrder, refreshedEvent: refreshEventPrices(event) });
  });

  // 6. Orders list
  app.get('/api/orders', (req: Request, res: Response) => {
    const { userId, role } = req.query;
    if (role === 'executor' || role === 'admin') {
      return res.json({ orders });
    }
    if (userId) {
      return res.json({ orders: orders.filter(o => o.userId === userId) });
    }
    res.json({ orders });
  });

  // 8. Event Bus Event Log & SSE
  app.get('/api/events/history', (req: Request, res: Response) => {
    res.json({ events: eventBus.getRecent(100) });
  });

  app.get('/api/events/stream', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    eventBus.registerSSEClient(res);

    // Initial ping
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'Event stream connected' })}\n\n`);
  });

  // 9. Analytics Engine
  app.get('/api/analytics', (req: Request, res: Response) => {
    let totalRevenue = 0;
    let totalTicketsSold = 0;
    let dynamicPricingYield = 0;

    orders.forEach(o => {
      if (o.status === 'confirmed') {
        totalRevenue += o.totalAmount;
        totalTicketsSold += o.seats.length;
        dynamicPricingYield += o.dynamicSurgeAmount;
      }
    });

    const averageTicketPrice = totalTicketsSold > 0 ? Math.round(totalRevenue / totalTicketsSold) : 0;

    const salesByEvent = events.map(e => {
      const eventOrders = orders.filter(o => o.eventId === e.id && o.status === 'confirmed');
      const sold = eventOrders.reduce((sum, o) => sum + o.seats.length, 0);
      const revenue = eventOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      return {
        eventId: e.id,
        title: e.title,
        category: e.category,
        sold,
        capacity: e.totalSeats,
        revenue,
      };
    });

    const terminalMap = new Map<string, { name: string; deviceType: any; count: number; rev: number }>();
    orders.forEach(o => {
      if (o.status === 'confirmed') {
        const existing = terminalMap.get(o.terminalId) || {
          name: o.terminalName,
          deviceType: 'desktop',
          count: 0,
          rev: 0,
        };
        existing.count += o.seats.length;
        existing.rev += o.totalAmount;
        terminalMap.set(o.terminalId, existing);
      }
    });

    const salesByTerminal = Array.from(terminalMap.entries()).map(([termId, val]) => ({
      terminalId: termId,
      terminalName: val.name,
      deviceType: val.deviceType,
      salesCount: val.count,
      revenue: val.rev,
    }));

    const tierBreakdown = [
      { name: 'VIP / Courtside', sold: 48, revenue: 270000, color: '#f59e0b' },
      { name: 'Gold / Lower Bowl', sold: 62, revenue: 208320, color: '#3b82f6' },
      { name: 'General Admission', sold: 45, revenue: 62100, color: '#10b981' },
      { name: 'Mezzanine / Deck', sold: 32, revenue: 76800, color: '#a855f7' },
    ];

    const salesTrend = [
      { time: '10:00', sales: 4, revenue: 14500, surgeMultiplier: 1.0 },
      { time: '11:00', sales: 12, revenue: 42000, surgeMultiplier: 1.05 },
      { time: '12:00', sales: 26, revenue: 98000, surgeMultiplier: 1.15 },
      { time: '13:00', sales: 38, revenue: 165000, surgeMultiplier: 1.25 },
      { time: '14:00', sales: 22, revenue: 86000, surgeMultiplier: 1.20 },
      { time: '15:00', sales: 31, revenue: 124000, surgeMultiplier: 1.22 },
    ];

    res.json({
      totalRevenue,
      totalTicketsSold,
      dynamicPricingYield,
      averageTicketPrice,
      salesByEvent,
      salesByTerminal,
      salesTrend,
      tierBreakdown,
    });
  });

  // --- VITE MIDDLEWARE SETUP ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[OmniTicket Server] Microservices & Event Bus running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[OmniTicket Server Startup Error]', err);
});
