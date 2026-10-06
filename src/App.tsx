import React, { useState, useEffect } from 'react';
import { api } from './lib/api.js';
import {
  AnalyticsData,
  DynamicPricingPolicy,
  EventItem,
  Order,
  Seat,
  SystemEvent,
  Terminal,
  User,
  UserRole,
} from './types.js';

import { Header } from './components/Header.js';
import { AuthModal } from './components/AuthModal.js';
import { TerminalManagerModal } from './components/TerminalManagerModal.js';
import { AudienceCatalog } from './components/AudienceCatalog.js';
import { SeatingMapModal } from './components/SeatingMapModal.js';
import { CheckoutModal } from './components/CheckoutModal.js';
import { ExecutorHub } from './components/ExecutorHub.js';
import { AnalyticsView } from './components/AnalyticsView.js';
import { MyTicketsView } from './components/MyTicketsView.js';
import { AuthView } from './components/AuthView.js';

export default function App() {
  const [currentView, setCurrentView] = useState<'catalog' | 'executor' | 'analytics' | 'my_tickets' | 'auth'>('catalog');
  const [authInitialMode, setAuthInitialMode] = useState<'signin' | 'register'>('signin');

  // Core Data State
  const [events, setEvents] = useState<EventItem[]>([]);
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [systemEvents, setSystemEvents] = useState<SystemEvent[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  // Active Session & Machine Terminal State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTerminal, setCurrentTerminal] = useState<Terminal | null>(null);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isSeatingOpen, setIsSeatingOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Active Selection for Booking
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);

  // 1. Initial Load of State
  const refreshAll = async () => {
    try {
      const [
        eventsData,
        terminalsData,
        usersData,
        ordersData,
        analyticsData,
      ] = await Promise.all([
        api.getEvents(),
        api.getTerminals(),
        api.getUsers(),
        api.getOrders(),
        api.getAnalytics(),
      ]);

      setEvents(eventsData);
      setTerminals(terminalsData);
      setUsers(usersData);
      setOrders(ordersData);
      setAnalytics(analyticsData);

      // Set default terminal and user if not set
      if (!currentTerminal && terminalsData && terminalsData.length > 0) {
        setCurrentTerminal(terminalsData[0]);
      }
      if (!currentUser && usersData && usersData.length > 0) {
        setCurrentUser(usersData[0]);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  // 2. Real-Time Event Bus SSE Stream Connection
  useEffect(() => {
    const eventSource = new EventSource('/api/events/stream');

    eventSource.onmessage = (e) => {
      try {
        const busEvent: SystemEvent = JSON.parse(e.data);
        setSystemEvents((prev) => [busEvent, ...prev.slice(0, 50)]);

        // Intelligently handle specific events
        if (
          busEvent.type === 'EVENT_CREATED' ||
          busEvent.type === 'DYNAMIC_PRICING_UPDATED' ||
          busEvent.type === 'SEAT_HELD' ||
          busEvent.type === 'PRICE_SURGE_TRIGGERED'
        ) {
          api.getEvents().then(setEvents);
          api.getAnalytics().then(setAnalytics);
        }

        if (busEvent.type === 'PAYMENT_SUCCESS' || busEvent.type === 'ORDER_CREATED') {
          api.getOrders().then(setOrders);
          api.getEvents().then(setEvents);
          api.getAnalytics().then(setAnalytics);
        }

        if (busEvent.type === 'TERMINAL_REGISTERED' || busEvent.type === 'TERMINAL_HEARTBEAT') {
          api.getTerminals().then(setTerminals);
        }
      } catch (err) {
        console.error('Error handling SSE message:', err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Handlers
  const handleOpenSeatingMap = (event: EventItem) => {
    setSelectedEvent(event);
    setIsSeatingOpen(true);
  };

  const handleProceedToCheckout = (seats: Seat[], event: EventItem) => {
    setSelectedSeats(seats);
    setSelectedEvent(event);
    setIsSeatingOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleConfirmOrder = async (payload: {
    eventId: string;
    selectedSeats: Seat[];
    userId: string;
    terminalId: string;
    paymentMethod: string;
    idempotencyKey: string;
  }) => {
    const res = await api.confirmOrder(payload);
    await refreshAll();
    return res;
  };

  const handleRegisterTerminal = async (newTerm: Partial<Terminal>) => {
    const registered = await api.registerTerminal(newTerm);
    setTerminals((prev) => [...prev, registered]);
    setCurrentTerminal(registered);
  };

  const handleUpdatePolicy = async (eventId: string, policy: DynamicPricingPolicy) => {
    const updated = await api.updatePricingPolicy(eventId, policy);
    setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  };

  const handleCreateEvent = async (eventData: Partial<EventItem>) => {
    const created = await api.createEvent(eventData);
    setEvents((prev) => [created, ...prev]);
  };

  const handleLogin = async (email: string, role: UserRole, terminalId: string) => {
    const res = await api.login({ email, role, terminalId });
    setCurrentUser(res.user);
    if (res.terminal) {
      setCurrentTerminal(res.terminal);
    }
  };

  const handleRegister = async (
    name: string,
    email: string,
    role: UserRole,
    companyName: string,
    terminalId: string
  ) => {
    const res = await api.register({ name, email, role, companyName, terminalId });
    setCurrentUser(res.user);
    setUsers((prev) => [...prev, res.user]);
    const term = terminals.find((t) => t.id === terminalId);
    if (term) {
      setCurrentTerminal(term);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation Bar */}
      <Header
        activeTab={currentView}
        setActiveTab={setCurrentView}
        currentUser={currentUser}
        currentTerminal={currentTerminal}
        onOpenAuth={(mode) => {
          setAuthInitialMode(mode || 'signin');
          setCurrentView('auth');
        }}
        onLogout={() => setCurrentUser(null)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentView === 'catalog' && (
          <AudienceCatalog
            events={events}
            onSelectEvent={handleOpenSeatingMap}
            onOpenPricingSimulator={(evt) => {
              setSelectedEvent(evt);
              setCurrentView('executor');
            }}
          />
        )}

        {currentView === 'executor' && (
          <ExecutorHub
            events={events}
            currentUser={currentUser}
            onUpdatePolicy={handleUpdatePolicy}
            onCreateEvent={handleCreateEvent}
            onRefresh={refreshAll}
          />
        )}

        {currentView === 'analytics' && (
          <AnalyticsView
            data={analytics}
            onRefresh={refreshAll}
          />
        )}

        {currentView === 'my_tickets' && (
          <MyTicketsView
            orders={orders.filter((o) => !currentUser || o.userId === currentUser.id)}
            onBrowseEvents={() => setCurrentView('catalog')}
          />
        )}

        {currentView === 'auth' && (
          <AuthView
            currentUser={currentUser}
            currentTerminal={currentTerminal}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onLogout={() => setCurrentUser(null)}
            onNavigate={(targetView) => setCurrentView(targetView)}
            initialMode={authInitialMode}
          />
        )}
      </main>

      {/* Seating Map Modal */}
      <SeatingMapModal
        isOpen={isSeatingOpen}
        onClose={() => setIsSeatingOpen(false)}
        event={selectedEvent}
        currentTerminal={currentTerminal}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        event={selectedEvent}
        selectedSeats={selectedSeats}
        currentUser={currentUser}
        currentTerminal={currentTerminal}
        onConfirmOrder={handleConfirmOrder}
        onViewTickets={() => setCurrentView('my_tickets')}
      />

      {/* User Authentication & Persona Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        currentTerminal={currentTerminal}
        terminals={terminals || []}
      />

      {/* Terminal & Physical Machine Registry Modal */}
      <TerminalManagerModal
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
        terminals={terminals}
        currentTerminal={currentTerminal}
        onSelectTerminal={(t) => setCurrentTerminal(t)}
        onRegisterTerminal={handleRegisterTerminal}
      />
    </div>
  );
}
