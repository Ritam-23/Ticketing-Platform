import { SystemEvent, SystemEventType } from '../src/types.js';
import type { Response } from 'express';

class EventBus {
  private events: SystemEvent[] = [];
  private clients: Response[] = [];

  constructor() {
    const initialSeed: Array<{
      service: string;
      type: SystemEventType;
      severity: 'info' | 'warning' | 'error' | 'success';
      payload: Record<string, any>;
      minutesAgo: number;
    }> = [
      {
        service: 'terminal-service',
        type: 'TERMINAL_CONNECTED',
        severity: 'info',
        payload: { terminalId: 'term-mac-sf-01', location: 'San Francisco Box Office' },
        minutesAgo: 14,
      },
      {
        service: 'auth-service',
        type: 'USER_AUTHENTICATED',
        severity: 'success',
        payload: { email: 'priya@metropolis-live.in', role: 'executor' },
        minutesAgo: 12,
      },
      {
        service: 'pricing-engine',
        type: 'PRICE_SURGE_TRIGGERED',
        severity: 'warning',
        payload: {
          eventId: 'evt-symphony-2026',
          tierName: 'Stagefront VIP',
          surgeMultiplier: 1.25,
          reason: 'Sold 68% threshold passed',
        },
        minutesAgo: 8,
      },
      {
        service: 'catalog-service',
        type: 'SEAT_HELD',
        severity: 'info',
        payload: { seatId: 'evt-symphony-2026-s-A4', terminalId: 'term-kiosk-arena-08', durationSec: 300 },
        minutesAgo: 5,
      },
      {
        service: 'booking-service',
        type: 'PAYMENT_SUCCESS',
        severity: 'success',
        payload: { orderId: 'ord-88320', amount: 225, terminalId: 'term-kiosk-arena-08' },
        minutesAgo: 3,
      },
    ];

    const now = Date.now();
    initialSeed.forEach((s, idx) => {
      this.events.unshift({
        id: `evt-${idx}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date(now - s.minutesAgo * 60000).toISOString(),
        service: s.service,
        type: s.type,
        payload: s.payload,
        severity: s.severity,
      });
    });
  }

  public publish(
    service: string,
    type: SystemEventType,
    payload: Record<string, any>,
    severity: 'info' | 'warning' | 'error' | 'success' = 'info'
  ): SystemEvent {
    const event: SystemEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      service,
      type,
      payload,
      severity,
    };

    this.events.unshift(event);
    if (this.events.length > 200) {
      this.events.pop();
    }

    // Broadcast to active SSE clients
    const sseData = `data: ${JSON.stringify(event)}\n\n`;
    this.clients.forEach(client => {
      try {
        client.write(sseData);
      } catch (err) {
        // client closed
      }
    });

    return event;
  }

  public getRecent(limit = 50): SystemEvent[] {
    return this.events.slice(0, limit);
  }

  public registerSSEClient(res: Response) {
    this.clients.push(res);
    res.on('close', () => {
      this.clients = this.clients.filter(c => c !== res);
    });
  }
}

export const eventBus = new EventBus();
