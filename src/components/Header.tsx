import React from 'react';
import {
  Ticket,
  Sliders,
  BarChart3,
  QrCode,
  User as UserIcon,
  LogOut,
  UserPlus,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { Terminal, User } from '../types.js';

interface HeaderProps {
  activeTab: 'catalog' | 'executor' | 'analytics' | 'my_tickets' | 'auth';
  setActiveTab: (tab: 'catalog' | 'executor' | 'analytics' | 'my_tickets' | 'auth') => void;
  currentUser: User | null;
  currentTerminal: Terminal | null;
  onOpenAuth: (initialMode?: 'signin' | 'register') => void;
  onLogout: () => void;
  onOpenTerminalManager?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuth,
  onLogout,
}) => {
  const isAudience = currentUser?.role === 'audience';
  const isExecutor = currentUser?.role === 'executor';
  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Tag */}
          <div className="flex items-center space-x-3">
            <div
              onClick={() => {
                if (currentUser) {
                  if (isAudience) setActiveTab('catalog');
                  else if (isExecutor) setActiveTab('executor');
                  else if (isAdmin) setActiveTab('analytics');
                } else {
                  setActiveTab('auth');
                }
              }}
              className="flex items-center space-x-2.5 cursor-pointer group"
              id="brand-logo-button"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                    OmniTicket
                  </span>
                  <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Live Ticketing
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  <span>Real-Time Platform</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Bar - Gated strictly based on authentication and user role */}
          {currentUser ? (
            <nav className="hidden md:flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
              {/* Audience only: Browse Events & Buy Tickets */}
              {isAudience && (
                <>
                  <button
                    id="nav-tab-catalog"
                    onClick={() => setActiveTab('catalog')}
                    className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === 'catalog'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>Browse Events & Buy Tickets</span>
                  </button>

                  <button
                    id="nav-tab-my-tickets"
                    onClick={() => setActiveTab('my_tickets')}
                    className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === 'my_tickets'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>My Tickets</span>
                  </button>
                </>
              )}

              {/* Organiser only: Setup Events & Dynamic Pricing */}
              {isExecutor && (
                <button
                  id="nav-tab-executor"
                  onClick={() => setActiveTab('executor')}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'executor'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Organiser Studio (Events & Dynamic Pricing)</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded font-mono">
                    Setup
                  </span>
                </button>
              )}

              {/* Admin only: Audiences count, dynamic pricing & events going on */}
              {isAdmin && (
                <button
                  id="nav-tab-analytics"
                  onClick={() => setActiveTab('analytics')}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'analytics'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Admin Monitor: Events, Audiences & Pricing</span>
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded font-mono">
                    Live
                  </span>
                </button>
              )}

              {/* Profile Tab */}
              <button
                id="nav-tab-auth"
                onClick={() => setActiveTab('auth')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'auth'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Account & Profile</span>
              </button>
            </nav>
          ) : (
            <div className="hidden md:flex items-center space-x-2 text-xs text-slate-400 bg-slate-950/40 px-3 py-1.5 rounded-xl border border-slate-800">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Authentication required to access ticketing system</span>
            </div>
          )}

          {/* Right Action Area: User Profile & Authentication */}
          <div className="flex items-center space-x-2">
            {currentUser ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveTab('auth')}
                  id="user-profile-summary-button"
                  className={`flex items-center space-x-2.5 px-3 py-1.5 rounded-xl border transition-all ${
                    activeTab === 'auth'
                      ? 'bg-indigo-600/20 border-indigo-500/80 text-white'
                      : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/70 text-slate-200'
                  }`}
                  title="View Account Profile & Session Details"
                >
                  <img
                    src={
                      currentUser.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                    }
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-indigo-400/40"
                  />
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-semibold text-slate-100 flex items-center space-x-1">
                      <span>{currentUser.name}</span>
                    </div>
                    <span
                      className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-semibold ${
                        currentUser.role === 'executor'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : currentUser.role === 'admin'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {currentUser.role === 'executor' ? 'Organiser' : currentUser.role}
                    </span>
                  </div>
                </button>

                <button
                  id="logout-button"
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-rose-300 hover:bg-slate-800/80 rounded-xl transition-colors border border-transparent hover:border-slate-700 flex items-center space-x-1 text-xs"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:inline text-[11px]">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  id="header-login-button"
                  onClick={() => {
                    setActiveTab('auth');
                    onOpenAuth('signin');
                  }}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-medium transition-all"
                >
                  <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Sign In</span>
                </button>

                <button
                  id="header-register-button"
                  onClick={() => {
                    setActiveTab('auth');
                    onOpenAuth('register');
                  }}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar: Only displayed when authenticated, according to role */}
      {currentUser && (
        <div className="md:hidden flex items-center justify-around py-2 px-2 bg-slate-950 border-t border-slate-800 text-xs">
          {isAudience && (
            <>
              <button
                onClick={() => setActiveTab('catalog')}
                className={`px-2.5 py-1 rounded-lg ${activeTab === 'catalog' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
              >
                Events
              </button>
              <button
                onClick={() => setActiveTab('my_tickets')}
                className={`px-2.5 py-1 rounded-lg ${activeTab === 'my_tickets' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
              >
                My Tickets
              </button>
            </>
          )}

          {isExecutor && (
            <button
              onClick={() => setActiveTab('executor')}
              className={`px-2.5 py-1 rounded-lg ${activeTab === 'executor' ? 'bg-amber-600 text-white' : 'text-slate-400'}`}
            >
              Organiser Studio
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-2.5 py-1 rounded-lg ${activeTab === 'analytics' ? 'bg-rose-600 text-white' : 'text-slate-400'}`}
            >
              Admin Monitor
            </button>
          )}

          <button
            onClick={() => setActiveTab('auth')}
            className={`px-2.5 py-1 rounded-lg ${activeTab === 'auth' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
          >
            Profile
          </button>
        </div>
      )}
    </header>
  );
};
